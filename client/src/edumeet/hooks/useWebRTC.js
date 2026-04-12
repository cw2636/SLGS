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
    const lastEventIdx = useRef(0); // track which events we've already processed

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

        // Receive remote tracks — distinguish camera vs screen share by stream ID
        pc.ontrack = (e) => {
            const stream = e.streams[0];
            if (!stream) return;

            // First stream we see from this peer is their camera; any other stream is screen share
            if (!peerCameraStreamIds.current[peerId]) {
                peerCameraStreamIds.current[peerId] = stream.id;
            }

            if (stream.id === peerCameraStreamIds.current[peerId]) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [peerId]: { stream, name: peerId }
                }));
            } else {
                // This is a screen share stream
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
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                closePeer(peerId);
            }
        };

        if (isInitiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    send('webrtc_offer', { sdp: pc.localDescription }, peerId);
                })
                .catch(console.error);
        }

        return pc;
    }, [send]);

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

    // Helper: renegotiate a peer connection (create new offer/answer)
    const renegotiate = useCallback((peerId) => {
        const pc = peersRef.current[peerId];
        if (!pc) return;
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .then(() => {
                send('webrtc_offer', { sdp: pc.localDescription }, peerId);
            })
            .catch(console.error);
    }, [send]);

    // Screen sharing — add/remove track on all existing peer connections
    const stopScreenShareRef = useRef(null);

    const stopScreenShare = useCallback(() => {
        // Remove screen track from all peer connections and renegotiate
        Object.entries(screenSendersRef.current).forEach(([peerId, sender]) => {
            const pc = peersRef.current[peerId];
            if (pc && sender) {
                try { pc.removeTrack(sender); } catch { /* ignore */ }
                renegotiate(peerId);
            }
        });
        screenSendersRef.current = {};

        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
        }
        send('screen_share_stop', {});
    }, [send, renegotiate]);

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

            // Add screen track to all existing peer connections and renegotiate
            Object.entries(peersRef.current).forEach(([peerId, pc]) => {
                const sender = pc.addTrack(screenTrack, stream);
                screenSendersRef.current[peerId] = sender;
                renegotiate(peerId);
            });

            send('screen_share_start', { userId: sessionId });
            return stream;
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    }, [send, sessionId, renegotiate]);

    // Handle signaling events from WebSocket
    // Process ALL new events since last render (not just the last one)
    useEffect(() => {
        if (!events.length) return;
        const start = lastEventIdx.current;
        // Detect if events array was trimmed (slice(-200)) — reset index
        const idx = start > events.length ? 0 : start;
        const newEvents = events.slice(idx);
        lastEventIdx.current = events.length;

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
                    const key = `${evt.from}-${evt.timestamp}`;
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
