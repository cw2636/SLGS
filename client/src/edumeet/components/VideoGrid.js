import React, { useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUser } from 'react-icons/fa';

/**
 * VideoGrid — displays local + remote video tiles in a responsive grid.
 */
export default function VideoGrid({ localStream, remoteStreams, screenStream, micOn, camOn, participants }) {
    return (
        <div className="edm-video-grid">
            {/* Screen share (full-width) */}
            {screenStream && (
                <div className="edm-video-tile edm-screen-tile">
                    <VideoElement stream={screenStream} muted autoPlay />
                    <div className="edm-video-label">Screen Share</div>
                </div>
            )}

            {/* Local video */}
            {localStream && (
                <div className="edm-video-tile edm-local-tile">
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

            {!localStream && Object.keys(remoteStreams).length === 0 && !screenStream && (
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
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={ref}
            autoPlay={autoPlay}
            muted={muted}
            playsInline
            style={mirror ? { transform: 'scaleX(-1)' } : {}}
        />
    );
}
