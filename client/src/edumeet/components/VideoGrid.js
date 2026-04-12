import React, { useRef, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaUser } from 'react-icons/fa';

/**
 * VideoGrid — displays local + remote video tiles in a responsive grid.
 * Background is baked into the stream via VirtualBackground processor.
 */
export default function VideoGrid({ localStream, remoteStreams, screenStream, remoteScreenStream, micOn, camOn, participants }) {
    const activeScreen = screenStream || remoteScreenStream;
    return (
        <div className="edm-video-grid">
            {/* Screen share (full-width) — local or remote */}
            {activeScreen && (
                <div className="edm-video-tile edm-screen-tile">
                    <VideoElement stream={activeScreen} muted={!!screenStream} autoPlay />
                    <div className="edm-video-label">
                        {screenStream ? 'You are sharing' : 'Screen Share'}
                    </div>
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

            {!localStream && Object.keys(remoteStreams).length === 0 && !activeScreen && (
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
