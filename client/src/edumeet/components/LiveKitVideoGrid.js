import {
    useTracks,
    VideoTrack,
    useLocalParticipant,
    isTrackReference,
    TrackRefContext,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
    FaMicrophone, FaMicrophoneSlash,
    FaVideo, FaVideoSlash,
    FaUser, FaDesktop, FaCrown,
} from 'react-icons/fa';

/**
 * LiveKitVideoGrid — SFU-powered video grid.
 *
 * v2 API rules applied here:
 *   • Every <VideoTrack> must be inside a <TrackRefContext.Provider>.
 *     Passing trackRef as a prop alone is not reliable across all v2 patch versions.
 *   • Filter out placeholder entries with empty identity — these are the local
 *     participant before LiveKit finishes initialising; rendering them causes the
 *     infamous "No TrackRef" crash that then unmounts LiveKitRoom mid-ICE and
 *     produces cascade failures (WebSocket close, pc-connection error, etc.).
 *   • Use a composite key (identity + source) so React never sees duplicate keys.
 *
 * Audio is handled entirely by <RoomAudioRenderer /> in EduMeetLive — no AudioTrack here.
 */
export default function LiveKitVideoGrid({ pinnedId, onPin }) {
    const { localParticipant } = useLocalParticipant();

    const cameraTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false }
    ).filter(t => !!t.participant.identity);   // ← drop uninitialized local placeholder

    const screenTracks = useTracks(
        [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
        { onlySubscribed: false }
    ).filter(t => !!t.participant.identity);

    const pinnedTrack = pinnedId ? cameraTracks.find(t => t.participant.identity === pinnedId) : null;
    const restTracks  = pinnedId ? cameraTracks.filter(t => t.participant.identity !== pinnedId) : cameraTracks;

    return (
        <div className={`edm-video-grid ${(pinnedId || screenTracks.length > 0) ? 'edm-grid-pinned' : ''}`}>

            {/* Screen share tiles — always pinned / spotlight */}
            {screenTracks.map(trackRef => (
                <ScreenTile
                    key={`${trackRef.participant.identity}-screen`}
                    trackRef={trackRef}
                    localIdentity={localParticipant?.identity}
                />
            ))}

            {/* Pinned tile */}
            {pinnedTrack && (
                <Tile
                    trackRef={pinnedTrack}
                    localIdentity={localParticipant?.identity}
                    spotlight
                    onDoubleClick={() => onPin?.(null)}
                />
            )}

            {/* Rest */}
            {restTracks.map(trackRef => (
                <Tile
                    key={`${trackRef.participant.identity}-${trackRef.source}`}
                    trackRef={trackRef}
                    localIdentity={localParticipant?.identity}
                    onDoubleClick={() => onPin?.(trackRef.participant.identity)}
                />
            ))}

            {cameraTracks.length === 0 && screenTracks.length === 0 && (
                <div className="edm-video-empty">
                    <FaVideoSlash style={{ fontSize: '2rem', opacity: .3 }} />
                    <p>No participants yet.</p>
                </div>
            )}
        </div>
    );
}

/** Outer tile: provides TrackRefContext so VideoTrack always finds its context */
function Tile({ trackRef, localIdentity, spotlight, onDoubleClick }) {
    const isLocal = trackRef.participant.identity === localIdentity;
    return (
        <TrackRefContext.Provider value={trackRef}>
            <div
                className={`edm-video-tile ${isLocal ? 'edm-local-tile' : ''} ${spotlight ? 'edm-tile-spotlight' : ''}`}
                onDoubleClick={onDoubleClick}
                title="Double-click to pin"
            >
                <ParticipantTile isLocal={isLocal} participant={trackRef.participant} hasVideo={isTrackReference(trackRef) && !trackRef.publication?.isMuted} />
                {spotlight && <div className="edm-pin-badge">📌 Pinned</div>}
            </div>
        </TrackRefContext.Provider>
    );
}

/** Inner tile: video feed (reads trackRef from context) or avatar fallback + labels */
function ParticipantTile({ isLocal, participant, hasVideo }) {
    const micPub    = participant.getTrackPublication(Track.Source.Microphone);
    const screenPub = participant.getTrackPublication(Track.Source.ScreenShare);
    const micOn     = !!micPub && !micPub.isMuted;
    const hasScreen = !!screenPub?.track;

    const meta = (() => {
        try { return JSON.parse(participant.metadata || '{}'); } catch { return {}; }
    })();
    const isTeacher  = meta.role === 'teacher' || meta.role === 'principal';
    const displayName = participant.name || participant.identity;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#111', borderRadius: 'inherit', overflow: 'hidden' }}>

            {hasVideo ? (
                /* No trackRef prop — VideoTrack reads from TrackRefContext.Provider above */
                <VideoTrack
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transform: isLocal ? 'scaleX(-1)' : 'none',
                    }}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', gap: '.5rem' }}>
                    <FaUser style={{ fontSize: '2.5rem' }} />
                    <span style={{ fontSize: '.8rem' }}>{displayName}</span>
                </div>
            )}

            {hasScreen && (
                <div className="edm-screen-badge"><FaDesktop /> Sharing screen</div>
            )}

            <div className="edm-video-label">
                {isTeacher && <FaCrown style={{ color: 'var(--gold-light)', marginRight: 4, fontSize: '.7rem' }} />}
                {isLocal ? `You (${displayName})` : displayName}
                <span className="edm-video-indicators">
                    {micOn ? <FaMicrophone /> : <FaMicrophoneSlash className="edm-indicator-off" />}
                    {hasVideo ? <FaVideo /> : <FaVideoSlash className="edm-indicator-off" />}
                </span>
            </div>
        </div>
    );
}

/** Screen share tile — always rendered in spotlight style */
function ScreenTile({ trackRef, localIdentity }) {
    const isLocal = trackRef.participant.identity === localIdentity;
    const displayName = trackRef.participant.name || trackRef.participant.identity;
    return (
        <TrackRefContext.Provider value={trackRef}>
            <div className="edm-video-tile edm-tile-spotlight edm-screen-tile">
                <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000', borderRadius: 'inherit', overflow: 'hidden' }}>
                    <VideoTrack
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div className="edm-video-label">
                        <FaDesktop style={{ marginRight: 4 }} />
                        {isLocal ? 'Your screen' : `${displayName}'s screen`}
                    </div>
                </div>
            </div>
        </TrackRefContext.Provider>
    );
}
