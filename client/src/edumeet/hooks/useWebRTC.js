import { useState, useRef, useCallback, useEffect } from 'react';
import VirtualBackground from '../virtualBackground';

const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

/**
 * WebRTC hook  — manages peer connections for video/audio/screen sharing.
 *
 * Uses mesh topology (each peer connects to every other peer).
 * The Go signaling server relays SDP offers/answers and ICE candidates.
 *
 * @param {Function} send      - WebSocket send function from useEdumeetSocket
 * @param {Array}    events    - WebSocket events from useEdumeetSocket
 * @param {string}   sessionId - Unique session ID from useEdumeetSocket
 * @returns {{ localStream, remoteStreams, screenStream, startMedia, stopMedia, startScreenShare, stopScreenShare, toggleMic, toggleCam, micOn, camOn }}
 */
export default function useWebRTC(send, events, sessionId) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { peerId: { stream, name } }
    const [screenStream, setScreenStream] = useState(null);        // local screen share
    const [remoteScreenStream, setRemoteScreenStream] = useState(null); // remote screen share
    const [screenSharer, setScreenSharer] = useState(null);        // who is sharing
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const peersRef = useRef({}); // { peerId: RTCPeerConnection }
    const localStreamRef = useRef(null);
    const rawStreamRef = useRef(null); // original camera stream before VB processing
    const vbRef = useRef(null); // VirtualBackground instance
    const pendingPeers = useRef(new Set()); // peers that sent webrtc_ready before our media was ready
    const screenStreamRef = useRef(null);
    const screenSendersRef = useRef({}); // { peerId: RTCRtpSender } for screen track removal
    const peerCameraStreamIds = useRef({}); // { peerId: streamId } — first stream per peer is camera
    const processedOffers = useRef(new Set());
    const lastEventSeq = useRef(-1); // track by __seq so we survive the 200-event array cap

    // Create a peer connection for a given peer
    const createPeer = useCallback((peerId, isInitiator) => {
        if (peersRef.current[peerId]) return peersRef.current[peerId];

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        peersRef.current[peerId] = pc;

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // If we're currently screen sharing, add that track too
        if (screenStreamRef.current) {
            const screenTrack = screenStreamRef.current.getVideoTracks()[0];
            if (screenTrack) {
                const sender = pc.addTrack(screenTrack, screenStreamRef.current);
                screenSendersRef.current[peerId] = sender;
            }
        }

        // ICE candidates → relay to peer
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                send('webrtc_ice', { candidate: e.candidate }, peerId);
            }
        };

        // Receive remote tracks — distinguish camera vs screen share by stream ID.
        // During renegotiation some browsers fire ontrack with e.streams = [] even when
        // the track was added with addTrack(track, stream). We handle both cases.
        pc.ontrack = (e) => {
            const stream = e.streams?.[0] ?? null;
            const track  = e.track;
            console.log('[WebRTC] ontrack from', peerId, 'kind:', track.kind, 'stream:', stream?.id ?? 'null', 'cameraStreamId:', peerCameraStreamIds.current[peerId] ?? 'none');

            if (!stream) {
                // Null-stream path: build a synthetic stream from the raw track
                if (track.kind === 'video') {
                    if (!peerCameraStreamIds.current[peerId]) {
                        // First video from this peer → camera
                        const s = new MediaStream([track]);
                        peerCameraStreamIds.current[peerId] = s.id;
                        console.log('[WebRTC] → camera stream (null-stream path) from', peerId);
                        setRemoteStreams(prev => ({ ...prev, [peerId]: { stream: s, name: peerId } }));
                    } else {
                        // Camera already registered → this video track is screen share
                        const s = new MediaStream([track]);
                        console.log('[WebRTC] → SCREEN SHARE stream (null-stream path) from', peerId);
                        setRemoteScreenStream(s);
                        setScreenSharer(peerId);
                        track.onended = () => {
                            setRemoteScreenStream(null);
                            setScreenSharer(prev => prev === peerId ? null : prev);
                        };
                    }
                }
                // Audio with no stream: already handled by the camera stream; skip
                return;
            }

            // Normal path: stream is present
            // First stream we see from this peer is their camera; any other stream is screen share
            if (!peerCameraStreamIds.current[peerId]) {
                peerCameraStreamIds.current[peerId] = stream.id;
            }

            if (stream.id === peerCameraStreamIds.current[peerId]) {
                console.log('[WebRTC] → camera stream (normal path) from', peerId);
                setRemoteStreams(prev => ({
                    ...prev,
                    [peerId]: { stream, name: peerId }
                }));
            } else {
                // Different stream ID → screen share
                console.log('[WebRTC] → SCREEN SHARE stream (normal path) from', peerId);
                setRemoteScreenStream(stream);
                setScreenSharer(peerId);
                stream.onremovetrack = () => {
                    if (stream.getTracks().length === 0) {
                        setRemoteScreenStream(prev => prev?.id === stream.id ? null : prev);
                        setScreenSharer(prev => prev === peerId ? null : prev);
                    }
                };
            }
        };

        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log('[WebRTC] ICE state', peerId, '→', state);
            if (state === 'failed') {
                closePeer(peerId);
            } else if (state === 'disconnected') {
                setTimeout(() => {
                    if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                        closePeer(peerId);
                    }
                }, 5000);
            }
        };

        // Use onnegotiationneeded so the browser fires renegotiation at the right time.
        // This covers both the initial offer and any mid-call renegotiation (screen share,
        // track removal). Non-initiator peers never create offers — they only send answers.
        let makingOffer = false;
        pc.onnegotiationneeded = async () => {
            if (!isInitiator || makingOffer) return;
            if (pc.signalingState !== 'stable') return;
            try {
                makingOffer = true;
                const offer = await pc.createOffer();
                if (pc.signalingState !== 'stable') return; // state changed during async gap
                await pc.setLocalDescription(offer);
                send('webrtc_offer', { sdp: pc.localDescription }, peerId);
            } catch (err) {
                console.error('[WebRTC] onnegotiationneeded error:', peerId, err);
            } finally {
                makingOffer = false;
            }
        };

        return pc;
    }, [send]); // eslint-disable-line react-hooks/exhaustive-deps — closePeer is stable ([] deps)

    const closePeer = useCallback((peerId) => {
        const pc = peersRef.current[peerId];
        if (pc) {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.oniceconnectionstatechange = null;
            pc.onnegotiationneeded = null;
            pc.close();
            delete peersRef.current[peerId];
        }
        delete screenSendersRef.current[peerId];
        delete peerCameraStreamIds.current[peerId];
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
        // If this peer was sharing screen, clear it
        setScreenSharer(prev => {
            if (prev === peerId) {
                setRemoteScreenStream(null);
                return null;
            }
            return prev;
        });
    }, []);

    // Start camera + mic (with optional initial settings from lobby)
    // If opts.stream is provided (from PreJoinLobby), reuse it instead of re-acquiring media
    // If opts.bgId is set, process through VirtualBackground (person segmentation)
    const startMedia = useCallback(async (opts = {}) => {
        const wantMic = opts.micOn !== undefined ? opts.micOn : true;
        const wantCam = opts.camOn !== undefined ? opts.camOn : true;
        const bgId = opts.bgId || 'none';

        let rawStream;

        // Get raw camera/mic stream
        if (opts.stream) {
            rawStream = opts.stream;
        } else {
            try {
                rawStream = await navigator.mediaDevices.getUserMedia({
                    video: wantCam ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
                    audio: true
                });
            } catch (err) {
                console.error('Failed to get media:', err);
                try {
                    rawStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (audioErr) {
                    console.error('No media available:', audioErr);
                    return;
                }
            }
        }

        // Apply initial mute/cam state on raw tracks
        const audioTrack = rawStream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = wantMic;
        const videoTrack = rawStream.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = wantCam;

        rawStreamRef.current = rawStream;

        // Process through virtual background if requested
        let finalStream = rawStream;
        if (bgId !== 'none' && videoTrack) {
            try {
                if (!vbRef.current) vbRef.current = new VirtualBackground();
                finalStream = await vbRef.current.process(rawStream, bgId);
            } catch (err) {
                console.warn('Virtual background failed, using raw stream:', err);
                finalStream = rawStream;
            }
        }

        localStreamRef.current = finalStream;
        setLocalStream(finalStream);
        setMicOn(audioTrack ? wantMic : false);
        setCamOn(videoTrack ? wantCam : false);

        // Tell everyone we're ready
        send('webrtc_ready', {});

        // Connect to any peers that sent webrtc_ready before our media was ready
        if (pendingPeers.current.size > 0) {
            pendingPeers.current.forEach(peerId => {
                if (!peersRef.current[peerId]) {
                    createPeer(peerId, true);
                }
            });
            pendingPeers.current.clear();
        }

        return finalStream;
    }, [send, createPeer]);

    // Stop camera + mic
    const stopMedia = useCallback(() => {
        // Stop virtual background processing
        if (vbRef.current) { vbRef.current.destroy(); vbRef.current = null; }
        // Stop the original camera/mic tracks
        if (rawStreamRef.current) {
            rawStreamRef.current.getTracks().forEach(t => t.stop());
            rawStreamRef.current = null;
        }
        localStreamRef.current = null;
        setLocalStream(null);
        pendingPeers.current.clear();
        // Close all peers and clear remote streams
        Object.keys(peersRef.current).forEach(closePeer);
        setRemoteStreams({});
    }, [closePeer]);

    // Toggle mic — operates on the raw stream's audio track
    const toggleMic = useCallback(() => {
        const stream = rawStreamRef.current || localStreamRef.current;
        if (stream) {
            const audio = stream.getAudioTracks()[0];
            if (audio) {
                audio.enabled = !audio.enabled;
                setMicOn(audio.enabled);
            }
        }
    }, []);

    // Toggle camera — operates on the raw stream's video track
    const toggleCam = useCallback(() => {
        const stream = rawStreamRef.current || localStreamRef.current;
        if (stream) {
            const video = stream.getVideoTracks()[0];
            if (video) {
                video.enabled = !video.enabled;
                setCamOn(video.enabled);
            }
        }
    }, []);

    // Screen sharing — add/remove track on all existing peer connections
    // Renegotiation is driven by onnegotiationneeded (set in createPeer) so we don't
    // need to call createOffer manually — addTrack/removeTrack trigger the event.
    const stopScreenShareRef = useRef(null);

    const stopScreenShare = useCallback(() => {
        // Remove screen track from all peer connections — onnegotiationneeded fires automatically
        Object.entries(screenSendersRef.current).forEach(([peerId, sender]) => {
            const pc = peersRef.current[peerId];
            if (pc && sender) {
                try { pc.removeTrack(sender); } catch { /* ignore */ }
            }
        });
        screenSendersRef.current = {};

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
        }
        send('screen_share_stop', {});
    }, [send]);

    stopScreenShareRef.current = stopScreenShare;

    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });
            screenStreamRef.current = stream;
            setScreenStream(stream);

            const screenTrack = stream.getVideoTracks()[0];

            // When user clicks browser "Stop sharing"
            screenTrack.onended = () => {
                stopScreenShareRef.current?.();
            };

            // Add screen track to all existing peer connections.
            // onnegotiationneeded fires automatically — no manual renegotiate needed.
            console.log('[WebRTC] startScreenShare — peers:', Object.keys(peersRef.current));
            Object.entries(peersRef.current).forEach(([peerId, pc]) => {
                const sender = pc.addTrack(screenTrack, stream);
                screenSendersRef.current[peerId] = sender;
                console.log('[WebRTC] added screen track to peer', peerId, 'signalingState:', pc.signalingState);
            });

            send('screen_share_start', { userId: sessionId });
            return stream;
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    }, [send, sessionId]);

    // Handle signaling events from WebSocket — filter by __seq to survive array cap rollover
    useEffect(() => {
        if (!events.length) return;
        const newEvents = events.filter(e => (e.__seq ?? 0) > lastEventSeq.current);
        if (!newEvents.length) return;
        lastEventSeq.current = newEvents[newEvents.length - 1].__seq ?? lastEventSeq.current;

        for (const evt of newEvents) {
            if (evt.from === sessionId) continue; // ignore own events

            switch (evt.type) {
                case 'webrtc_ready': {
                    if (localStreamRef.current && !peersRef.current[evt.from]) {
                        createPeer(evt.from, true);
                    } else if (!localStreamRef.current) {
                        pendingPeers.current.add(evt.from);
                    }
                    break;
                }
                case 'webrtc_offer': {
                    // Use __seq (monotonic, always unique) so renegotiation offers
                    // (e.g. screen-share added mid-call) are never silently dropped.
                    // evt.timestamp is unreliable — server may omit it or reuse the same value.
                    const key = `${evt.from}-${evt.__seq ?? evt.timestamp}`;
                    console.log('[WebRTC] webrtc_offer from', evt.from, 'key:', key, 'already processed:', processedOffers.current.has(key));
                    if (processedOffers.current.has(key)) break;
                    processedOffers.current.add(key);

                    const pc = createPeer(evt.from, false);
                    const sdp = evt.payload?.sdp;
                    if (!sdp) break;

                    pc.setRemoteDescription(new RTCSessionDescription(sdp))
                        .then(() => pc.createAnswer())
                        .then(answer => pc.setLocalDescription(answer))
                        .then(() => {
                            send('webrtc_answer', { sdp: pc.localDescription }, evt.from);
                        })
                        .catch(console.error);
                    break;
                }
                case 'webrtc_answer': {
                    const pc = peersRef.current[evt.from];
                    if (pc && evt.payload?.sdp) {
                        pc.setRemoteDescription(new RTCSessionDescription(evt.payload.sdp))
                            .catch(console.error);
                    }
                    break;
                }
                case 'webrtc_ice': {
                    const pc = peersRef.current[evt.from];
                    if (pc && evt.payload?.candidate) {
                        pc.addIceCandidate(new RTCIceCandidate(evt.payload.candidate))
                            .catch(console.error);
                    }
                    break;
                }
                case 'room_leave': {
                    closePeer(evt.from);
                    break;
                }
                case 'screen_share_start': {
                    // Peer started sharing — record who is sharing so ontrack can use it
                    console.log('[WebRTC] screen_share_start from', evt.from);
                    setScreenSharer(evt.from);
                    break;
                }
                case 'screen_share_stop': {
                    // Remote peer stopped screen share
                    setScreenSharer(prev => {
                        if (prev === evt.from) {
                            setRemoteScreenStream(null);
                            return null;
                        }
                        return prev;
                    });
                    break;
                }
                default:
                    break;
            }
        }
    }, [events, sessionId, createPeer, closePeer, send]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopMedia();
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [stopMedia]);

    return {
        localStream,
        remoteStreams,
        screenStream,
        remoteScreenStream,
        screenSharer,
        startMedia,
        stopMedia,
        startScreenShare,
        stopScreenShare,
        toggleMic,
        toggleCam,
        micOn,
        camOn,
        closePeer,
    };
}
