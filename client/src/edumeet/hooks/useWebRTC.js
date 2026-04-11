import { useState, useRef, useCallback, useEffect } from 'react';

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
    const [screenStream, setScreenStream] = useState(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    const peersRef = useRef({}); // { peerId: RTCPeerConnection }
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const screenPeersRef = useRef({}); // separate connections for screen share
    const processedOffers = useRef(new Set());

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

        // ICE candidates → relay to peer
        pc.onicecandidate = (e) => {
            if (e.candidate) {
                send('webrtc_ice', { candidate: e.candidate }, peerId);
            }
        };

        // Receive remote tracks
        pc.ontrack = (e) => {
            const stream = e.streams[0];
            if (stream) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [peerId]: { stream, name: peerId }
                }));
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
        if (peersRef.current[peerId]) {
            peersRef.current[peerId].close();
            delete peersRef.current[peerId];
        }
        if (screenPeersRef.current[peerId]) {
            screenPeersRef.current[peerId].close();
            delete screenPeersRef.current[peerId];
        }
        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[peerId];
            return next;
        });
    }, []);

    // Start camera + mic
    const startMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 } },
                audio: true
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            setMicOn(true);
            setCamOn(true);

            // Tell everyone we're ready
            send('webrtc_ready', {});
            return stream;
        } catch (err) {
            console.error('Failed to get media:', err);
            // Try audio only
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                setLocalStream(stream);
                setMicOn(true);
                setCamOn(false);
                send('webrtc_ready', {});
                return stream;
            } catch (audioErr) {
                console.error('No media available:', audioErr);
            }
        }
    }, [send]);

    // Stop camera + mic
    const stopMedia = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
        // Close all peers and clear remote streams
        Object.keys(peersRef.current).forEach(closePeer);
        setRemoteStreams({});
    }, [closePeer]);

    // Toggle mic
    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            const audio = localStreamRef.current.getAudioTracks()[0];
            if (audio) {
                audio.enabled = !audio.enabled;
                setMicOn(audio.enabled);
            }
        }
    }, []);

    // Toggle camera
    const toggleCam = useCallback(() => {
        if (localStreamRef.current) {
            const video = localStreamRef.current.getVideoTracks()[0];
            if (video) {
                video.enabled = !video.enabled;
                setCamOn(video.enabled);
            }
        }
    }, []);

    // Screen sharing
    const startScreenShare = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: false
            });
            screenStreamRef.current = stream;
            setScreenStream(stream);

            // When user clicks browser "Stop sharing"
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            send('screen_share_start', { userId: sessionId });
            return stream;
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    }, [send, sessionId]);

    const stopScreenShare = useCallback(() => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            setScreenStream(null);
        }
        send('screen_share_stop', {});
    }, [send]);

    // Handle signaling events from WebSocket
    useEffect(() => {
        if (!events.length) return;
        const last = events[events.length - 1];

        if (last.from === sessionId) return; // ignore own events

        switch (last.type) {
            case 'webrtc_ready': {
                // New peer is ready — initiate connection if we have media
                if (localStreamRef.current && !peersRef.current[last.from]) {
                    createPeer(last.from, true);
                }
                break;
            }
            case 'webrtc_offer': {
                const key = `${last.from}-${last.timestamp}`;
                if (processedOffers.current.has(key)) break;
                processedOffers.current.add(key);

                const pc = createPeer(last.from, false);
                const sdp = last.payload?.sdp;
                if (!sdp) break;

                pc.setRemoteDescription(new RTCSessionDescription(sdp))
                    .then(() => pc.createAnswer())
                    .then(answer => pc.setLocalDescription(answer))
                    .then(() => {
                        send('webrtc_answer', { sdp: pc.localDescription }, last.from);
                    })
                    .catch(console.error);
                break;
            }
            case 'webrtc_answer': {
                const pc = peersRef.current[last.from];
                if (pc && last.payload?.sdp) {
                    pc.setRemoteDescription(new RTCSessionDescription(last.payload.sdp))
                        .catch(console.error);
                }
                break;
            }
            case 'webrtc_ice': {
                const pc = peersRef.current[last.from];
                if (pc && last.payload?.candidate) {
                    pc.addIceCandidate(new RTCIceCandidate(last.payload.candidate))
                        .catch(console.error);
                }
                break;
            }
            case 'room_leave': {
                closePeer(last.from);
                break;
            }
            default:
                break;
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
        startMedia,
        stopMedia,
        startScreenShare,
        stopScreenShare,
        toggleMic,
        toggleCam,
        micOn,
        camOn,
    };
}
