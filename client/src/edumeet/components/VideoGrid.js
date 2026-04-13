import React, { useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUser, FaDesktop } from 'react-icons/fa';

/**
 * VideoGrid — displays local + remote video tiles in a responsive grid.
 * Background is baked into the stream via VirtualBackground processor.
 */
export default function VideoGrid({ localStream, remoteStreams, screenStream, remoteScreenStream, screenSharer, micOn, camOn, participants }) {
    return (
        <div className="edm-video-grid">
            {/* Local screen share: show indicator only — rendering the stream causes
                an infinite mirror loop when the user shares the browser tab */}
            {screenStream && (
                <div key="screen-local" className="edm-video-tile edm-screen-tile edm-screen-indicator">
                    <FaDesktop className="edm-screen-indicator-icon" />
                    <p className="edm-screen-indicator-text">You are sharing your screen</p>
                    <p className="edm-screen-indicator-sub">Others can see your screen</p>
                </div>
            )}

            {/* Remote screen share: show video stream when available */}
            {!screenStream && remoteScreenStream && (
                <div key="screen-remote" className="edm-video-tile edm-screen-tile">
                    <VideoElement stream={remoteScreenStream} autoPlay />
                    <div className="edm-video-label">Screen Share</div>
                </div>
            )}

            {/* Signal received but WebRTC stream not yet arrived — show waiting banner */}
            {!screenStream && !remoteScreenStream && screenSharer && (
                <div key="screen-pending" className="edm-video-tile edm-screen-tile edm-screen-indicator">
                    <FaDesktop className="edm-screen-indicator-icon" />
                    <p className="edm-screen-indicator-text">Teacher is sharing their screen</p>
                    <p className="edm-screen-indicator-sub">Connecting stream...</p>
                </div>
            )}

            {/* Local video */}
            {localStream && (
                <div key="local" className="edm-video-tile edm-local-tile">
                    <VideoElement stream={localStream} muted autoPlay mirror />
                    <div className="edm-video-label">
                        You
                        <span className="edm-video-indicators">
                            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash className="edm-indicator-off" />}
                            {camOn ? <FaVideo /> : <FaVideoSlash className="edm-indicator-off" />}
                        </span>
                    </div>
                    {!camOn && <div className="edm-video-avatar"><FaUser /></div>}
                </div>
            )}

            {/* Remote videos */}
            {Object.entries(remoteStreams).map(([peerId, { stream, name }]) => {
                const pName = participants.find(p => p.user_id === peerId)?.name || name || peerId;
                return (
                    <div key={peerId} className="edm-video-tile">
                        <VideoElement stream={stream} autoPlay />
                        <div className="edm-video-label">{pName}</div>
                    </div>
                );
            })}

            {!localStream && Object.keys(remoteStreams).length === 0 && !screenStream && !remoteScreenStream && (
                <div className="edm-video-empty">
                    <FaVideoSlash style={{ fontSize: '2rem', opacity: .3 }} />
                    <p>Camera is off. Click the camera button in the toolbar to start video.</p>
                </div>
            )}
        </div>
    );
}

/** Renders a <video> element attached to a MediaStream. */
function VideoElement({ stream, muted, autoPlay, mirror }) {
    const ref = useRef(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        if (stream) {
            video.srcObject = stream;
        }

        return () => {
            // Clean up: detach stream and exit PiP on unmount
            if (video) {
                video.srcObject = null;
                video.load(); // reset to clear black frame
                if (document.pictureInPictureElement === video) {
                    document.exitPictureInPicture().catch(() => {});
                }
            }
        };
    }, [stream]);

    return (
        <video
            ref={ref}
            autoPlay={autoPlay}
            muted={muted}
            playsInline
            disablePictureInPicture
            style={mirror ? { transform: 'scaleX(-1)' } : {}}
        />
    );
}
