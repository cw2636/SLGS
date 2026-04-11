import React, { useState, useRef, useEffect } from 'react';
import {
    FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
    FaUser, FaSignInAlt, FaCircle
} from 'react-icons/fa';

const BACKGROUNDS = [
    { id: 'none', label: 'None', style: {} },
    { id: 'blur', label: 'Blur', style: { filter: 'blur(8px)' } },
    { id: 'classroom', label: 'Classroom', color: '#1a4731' },
    { id: 'library', label: 'Library', color: '#2c1810' },
    { id: 'gradient', label: 'Gradient', color: 'linear-gradient(135deg, #0a1a0e, #1a4731)' },
];

/**
 * Pre-join lobby — Zoom/Teams style screen where users set up
 * camera, microphone, and background before entering the meeting.
 */
export default function PreJoinLobby({ roomId, user, onJoin }) {
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [bgId, setBgId] = useState('none');
    const [previewStream, setPreviewStream] = useState(null);
    const [error, setError] = useState('');
    const videoRef = useRef(null);

    // Start camera preview
    useEffect(() => {
        let stream = null;
        (async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: true,
                });
                setPreviewStream(stream);
            } catch {
                // Try audio only
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    setPreviewStream(stream);
                    setCamOn(false);
                } catch {
                    setError('Could not access camera or microphone. Check browser permissions.');
                }
            }
        })();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    // Attach preview to video element
    useEffect(() => {
        if (videoRef.current && previewStream) {
            videoRef.current.srcObject = previewStream;
        }
    }, [previewStream]);

    // Toggle mic preview
    const toggleMic = () => {
        if (previewStream) {
            const audio = previewStream.getAudioTracks()[0];
            if (audio) { audio.enabled = !audio.enabled; setMicOn(audio.enabled); }
        }
    };

    // Toggle camera preview
    const toggleCam = () => {
        if (previewStream) {
            const video = previewStream.getVideoTracks()[0];
            if (video) { video.enabled = !video.enabled; setCamOn(video.enabled); }
        }
    };

    const handleJoin = () => {
        // Pass the live stream to EduMeet so it can reuse it (avoids mic re-acquire race)
        onJoin({ micOn, camOn, bgId, stream: previewStream });
    };

    const selectedBg = BACKGROUNDS.find(b => b.id === bgId);
    const roomTitle = roomId.replace(/-/g, ' ');

    return (
        <div className="edm-lobby">
            <div className="edm-lobby-card">
                {/* Left — video preview */}
                <div className="edm-lobby-preview">
                    <div className="edm-lobby-video-wrap" style={selectedBg?.color && !selectedBg.color.startsWith('linear')
                        ? { background: selectedBg.color }
                        : selectedBg?.color?.startsWith('linear') ? { background: selectedBg.color } : {}}>
                        {camOn && previewStream?.getVideoTracks().length > 0 ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                disablePictureInPicture
                                className="edm-lobby-video"
                                style={bgId === 'blur' ? { filter: 'blur(8px)' } : {}}
                            />
                        ) : (
                            <div className="edm-lobby-avatar">
                                <FaUser />
                                <span>{camOn ? 'Starting camera...' : 'Camera off'}</span>
                            </div>
                        )}
                    </div>

                    {/* Media controls */}
                    <div className="edm-lobby-controls">
                        <button
                            className={`edm-lobby-btn ${micOn ? '' : 'off'}`}
                            onClick={toggleMic}
                            title={micOn ? 'Mute mic' : 'Unmute mic'}
                        >
                            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                            <span>{micOn ? 'Mic on' : 'Mic off'}</span>
                        </button>
                        <button
                            className={`edm-lobby-btn ${camOn ? '' : 'off'}`}
                            onClick={toggleCam}
                            title={camOn ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {camOn ? <FaVideo /> : <FaVideoSlash />}
                            <span>{camOn ? 'Camera on' : 'Camera off'}</span>
                        </button>
                    </div>
                </div>

                {/* Right — info + backgrounds */}
                <div className="edm-lobby-info">
                    <div className="edm-lobby-header">
                        <FaCircle className="edm-status online" style={{ fontSize: '.5rem' }} />
                        <span className="edm-lobby-ready">Ready to join</span>
                    </div>

                    <h2 className="edm-lobby-title">{roomTitle}</h2>

                    <div className="edm-lobby-user">
                        <FaUser />
                        <span>Joining as <strong>{user?.name || 'Guest'}</strong></span>
                        {user?.role && <span className="edm-lobby-role">{user.role}</span>}
                    </div>

                    {/* Background selection */}
                    <div className="edm-lobby-bg-section">
                        <label>Background</label>
                        <div className="edm-lobby-bg-grid">
                            {BACKGROUNDS.map(bg => (
                                <button
                                    key={bg.id}
                                    className={`edm-lobby-bg-opt ${bgId === bg.id ? 'active' : ''}`}
                                    onClick={() => setBgId(bg.id)}
                                    style={bg.color?.startsWith('linear')
                                        ? { background: bg.color }
                                        : { background: bg.color || '#0f2318' }}
                                >
                                    {bg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className="edm-lobby-error">{error}</p>}

                    <button className="edm-lobby-join" onClick={handleJoin}>
                        <FaSignInAlt /> Join Meeting
                    </button>

                    <p className="edm-lobby-hint">
                        You can change your settings after joining.
                    </p>
                </div>
            </div>
        </div>
    );
}
