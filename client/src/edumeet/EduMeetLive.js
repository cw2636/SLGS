import { useState, useEffect, useRef, useCallback, Component } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// LiveKit
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';

// Go WebSocket (chat, whiteboard, polls, quiz, hand queue, etc.)
import useEdumeetSocket from './hooks/useEdumeetSocket';

// Existing components (unchanged)
import PreJoinLobby  from './components/PreJoinLobby';
import ChatPanel     from './components/ChatPanel';
import Whiteboard    from './components/Whiteboard';
import ParticipantList from './components/ParticipantList';

// New LiveKit + feature components
import LiveKitVideoGrid  from './components/LiveKitVideoGrid';
import BreakoutRooms     from './components/BreakoutRooms';
import LivePoll          from './components/LivePoll';
import QuizMode          from './components/QuizMode';
import HandQueue         from './components/HandQueue';
import FocusCheck        from './components/FocusCheck';
import PomodoroTimer     from './components/PomodoroTimer';
import ReactionsOverlay  from './components/ReactionsOverlay';
import ClassNotes        from './components/ClassNotes';

import {
    FaComments, FaChalkboard, FaUsers, FaHandPaper, FaSignOutAlt,
    FaCircle, FaExpand, FaCompress, FaVideo, FaVideoSlash,
    FaMicrophone, FaMicrophoneSlash, FaDesktop, FaStop,
    FaDoorOpen, FaLock, FaLockOpen, FaPoll, FaBrain,
    FaEye, FaClock, FaStickyNote, FaCamera,
} from 'react-icons/fa';

const GO_API = process.env.REACT_APP_GO_API_URL || 'http://localhost:4000';

/**
 * EduMeetLive — SLGS classroom powered by LiveKit SFU.
 *
 * Architecture:
 *   • LiveKit  → all video / audio (1-to-many SFU, scales to 1000)
 *   • Go WS    → all non-media messaging (chat, whiteboard, polls, quiz, etc.)
 *
 * Unique features vs Zoom/Teams:
 *   ✦ Live Poll — real-time voting with visible results
 *   ✦ Quiz Mode — timed in-class quiz, scores fed to gradebook
 *   ✦ Hand Queue — ordered queue with position shown to student
 *   ✦ Focus Check — comprehension pulse (Clear / Confused / Too Fast / Repeat)
 *   ✦ Pomodoro Timer — class-wide 25/5 study timer
 *   ✦ Floating Reactions — educational emoji overlay
 *   ✦ Class Notes — shared notepad, teacher can pin key points, exportable
 *   ✦ Breakout Rooms — auto-group, countdown timer, LiveKit sub-room switch
 *   ✦ Student Spotlight — double-click any tile to pin/spotlight
 *   ✦ Late Join Summary — contextual info card for late arrivals
 */
export default function EduMeetLive() {
    const { roomId } = useParams();
    const { user }   = useAuth();
    const navigate   = useNavigate();

    const [joined, setJoined]             = useState(false);
    const [lkToken, setLkToken]           = useState(null);
    const [lkUrl, setLkUrl]               = useState(null);
    const [lkError, setLkError]           = useState(null);
    const [micEnabled, setMicEnabled]     = useState(true);
    const [camEnabled, setCamEnabled]     = useState(true);
    // Capture initial lobby choices so LiveKitRoom doesn't re-enable tracks on re-render
    const initialMic = useRef(true);
    const initialCam = useRef(true);
    const [pinnedId, setPinnedId]         = useState(null);
    // Guard: only navigate away on disconnect if we actually connected once.
    // Without this, a connection failure (LiveKit unreachable) calls onDisconnected
    // immediately and navigates back — which looks like the lobby "closes the meeting".
    const hasConnectedRef = useRef(false);

    // Safety net: stop ALL media tracks when this component unmounts for any reason
    useEffect(() => {
        return () => {
            // Stop every MediaStreamTrack the browser has active
            document.querySelectorAll('video, audio').forEach(el => {
                const ms = el.srcObject;
                if (ms && ms.getTracks) ms.getTracks().forEach(t => t.stop());
                el.srcObject = null;
            });
        };
    }, []);

    // Go WebSocket — all feature messaging
    const { events, participants, send, connected, sessionId } = useEdumeetSocket(roomId, user);

    // UI state
    const [sidePanel,    setSidePanel]    = useState('chat');
    const [mainView,     setMainView]     = useState('video');
    const [fullscreen,   setFullscreen]   = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);

    const isHost = user?.role === 'teacher' || user?.role === 'principal';
    const wbAllowed = whiteboardOpen || isHost;

    // Late join tracking
    const joinedAt    = useRef(Date.now());
    const [lateJoin, setLateJoin] = useState(false);

    useEffect(() => {
        if (joined && events.length > 5) {
            const elapsed = (Date.now() - joinedAt.current) / 1000;
            if (elapsed < 10) setLateJoin(events.some(e => e.type === 'chat_message'));
        }
    }, [joined, events]);

    // Fetch LiveKit token from Go server
    const fetchToken = useCallback(async () => {
        try {
            const res = await fetch(`${GO_API}/api/livekit-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_name: roomId,
                    identity:  String(user?.id || user?.studentId || `guest-${Date.now()}`),
                    name:      user?.name || 'Guest',
                    role:      user?.role || 'student',
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setLkToken(data.token);
            setLkUrl(data.url);
        } catch (err) {
            setLkError(err.message);
        }
    }, [roomId, user]);

    // Lobby join
    const handleLobbyJoin = ({ micOn, camOn, stream }) => {
        // Stop the lobby preview stream NOW — LiveKit opens its own camera/mic tracks.
        // Without this, the preview stream runs in parallel and the camera light
        // stays on even after leaving the meeting.
        if (stream) stream.getTracks().forEach(t => t.stop());
        setMicEnabled(micOn);
        setCamEnabled(camOn);
        initialMic.current = micOn;
        initialCam.current = camOn;
        setJoined(true);
        fetchToken();
    };

    // Breakout room: student switches to sub-room LiveKit token
    const handleLiveKitSwitch = (tokenData) => {
        if (!tokenData) {
            // Return to main room
            fetchToken();
            return;
        }
        setLkToken(tokenData.token);
        setLkUrl(tokenData.url);
    };

    // Sync host events
    useEffect(() => {
        if (!events.length) return;
        const last = events[events.length - 1];
        if (last.from === sessionId) return;
        if (last.type === 'whiteboard_permission' && !isHost) {
            setWhiteboardOpen(!!last.payload?.allowed);
            if (!last.payload?.allowed) setMainView('video');
        }
        if (last.type === 'view_change' && !isHost) setMainView(last.payload?.view);
    }, [events]); // eslint-disable-line

    const switchView = (view) => {
        setMainView(view);
        if (isHost) send('view_change', { view });
    };

    const toggleWhiteboardPermission = () => {
        const next = !whiteboardOpen;
        setWhiteboardOpen(next);
        send('whiteboard_permission', { allowed: next });
        if (!next) switchView('video');
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setFullscreen(true); }
        else { document.exitFullscreen(); setFullscreen(false); }
    };

    const leavingRef = useRef(false);
    const leaveRoom = useCallback(() => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        send('room_leave', {});
        navigate(-1);
    }, [send, navigate]);

    // Only navigate away on LiveKit disconnect if we actually connected once.
    // A connection failure fires onDisconnected immediately — without this guard
    // clicking "Join Meeting" would navigate back to the previous page.
    const handleLkDisconnected = useCallback(() => {
        if (hasConnectedRef.current) {
            leaveRoom();
        } else {
            setLkError('Could not connect to the classroom (server unreachable). Please try again.');
        }
    }, [leaveRoom]);

    // Counts for toolbar badges
    const chatCount  = events.filter(e => e.type === 'chat_message').length;
    const handCount  = (() => {
        const s = new Set();
        events.forEach(e => {
            if (e.type === 'hand_raise') s.add(e.from);
            if (e.type === 'hand_lower') s.delete(e.from);
            if (e.type === 'hand_call' && e.payload?.userId) s.delete(e.payload.userId);
        });
        return s.size;
    })();
    const activePoll = events.some(e => e.type === 'poll_create') &&
                       !events.some(e => e.type === 'poll_close');
    const activeQuiz = events.some(e => e.type === 'quiz_start') &&
                       !events.some(e => e.type === 'quiz_end');
    const activeFocus= events.some(e => e.type === 'focus_check') &&
                       !events.some(e => e.type === 'focus_close');

    // ── Pre-join lobby ──
    if (!joined) {
        return <PreJoinLobby roomId={roomId} user={user} onJoin={handleLobbyJoin} />;
    }

    // ── LiveKit error ──
    if (lkError) {
        return (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:'1rem', color:'var(--text)' }}>
                <h2>Could not connect to meeting</h2>
                <p style={{ color:'var(--text-muted)' }}>{lkError}</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    // ── Waiting for token ──
    if (!lkToken) {
        return (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)', flexDirection:'column', gap:'1rem' }}>
                <FaCircle style={{ animation:'pulse 1s infinite', color:'var(--green-light)' }} />
                Connecting to classroom…
            </div>
        );
    }

    return (
        <LiveKitRoom
            token={lkToken}
            serverUrl={lkUrl}
            audio={initialMic.current}
            video={initialCam.current}
            connect={true}
            onConnected={() => { hasConnectedRef.current = true; }}
            onDisconnected={handleLkDisconnected}
            options={{
                peerConnectionTimeout: 30_000,
                publishDefaults: {
                    screenShareEncoding: { maxBitrate: 3_000_000, maxFramerate: 15 },
                    screenShareSimulcastLayers: [],
                },
            }}
            connectOptions={{
                peerConnectionTimeout: 30_000,
            }}
        >
            {/* Spatial audio renderer — renders all remote audio */}
            <RoomAudioRenderer />

            {/* Floating emoji reactions layer */}
            <ReactionsOverlay events={events} send={send} user={user} />

            <div className={`edm-classroom ${fullscreen ? 'edm-fullscreen' : ''}`}>

                {/* ── Toolbar ── */}
                <div className="edm-toolbar">
                    <div className="edm-toolbar-left">
                        <FaCircle className={`edm-status ${connected ? 'online' : 'offline'}`} />
                        <h2 className="edm-room-title">{roomId.replace(/-/g, ' ')}</h2>
                        <span className="edm-badge">{participants.length} in room</span>
                        {activePoll  && <span className="edm-live-badge poll">🗳 Poll Live</span>}
                        {activeQuiz  && <span className="edm-live-badge quiz">🧠 Quiz Active</span>}
                        {activeFocus && <span className="edm-live-badge focus">👁 Focus Check</span>}
                    </div>

                    <div className="edm-toolbar-right">
                        {/* Media controls — delegated to LiveKit local participant */}
                        <MediaControls micEnabled={micEnabled} camEnabled={camEnabled}
                            onMicToggle={setMicEnabled} onCamToggle={setCamEnabled} />

                        {/* Screen share */}
                        <ScreenShareButton />

                        <span className="edm-tb-sep-v" />

                        {/* View toggles */}
                        <button className={`edm-tb-btn ${mainView==='video' ? 'active':''}`} onClick={() => switchView('video')} title="Video">
                            <FaVideo />
                        </button>
                        <button className={`edm-tb-btn ${mainView==='whiteboard' ? 'active':''}`} onClick={() => switchView('whiteboard')} title="Whiteboard">
                            <FaChalkboard />
                        </button>
                        {isHost && (
                            <button className={`edm-tb-btn ${whiteboardOpen ? 'active':''}`} onClick={toggleWhiteboardPermission}
                                title={whiteboardOpen ? 'Lock whiteboard' : 'Unlock whiteboard'}>
                                {whiteboardOpen ? <FaLockOpen /> : <FaLock />}
                            </button>
                        )}

                        <span className="edm-tb-sep-v" />

                        {/* Feature panel toggles */}
                        <PanelBtn icon={<FaHandPaper />} badge={handCount} panel="hands"    active={sidePanel} onClick={setSidePanel} title="Hand Queue" />
                        <PanelBtn icon={<FaComments />}  badge={chatCount}  panel="chat"     active={sidePanel} onClick={setSidePanel} title="Chat" />
                        <PanelBtn icon={<FaUsers />}                         panel="participants" active={sidePanel} onClick={setSidePanel} title="Participants" />
                        <PanelBtn icon={<FaDoorOpen />}                      panel="breakout" active={sidePanel} onClick={setSidePanel} title="Breakout Rooms" />
                        {isHost && <PanelBtn icon={<FaPoll />}  badge={activePoll  ? '●' : 0} panel="polls"  active={sidePanel} onClick={setSidePanel} title="Live Poll" />}
                        {isHost && <PanelBtn icon={<FaBrain />} badge={activeQuiz  ? '●' : 0} panel="quiz"   active={sidePanel} onClick={setSidePanel} title="Quiz Mode" />}
                        {isHost && <PanelBtn icon={<FaEye />}   badge={activeFocus ? '●' : 0} panel="focus"  active={sidePanel} onClick={setSidePanel} title="Focus Check" />}
                        <PanelBtn icon={<FaClock />}                          panel="pomodoro" active={sidePanel} onClick={setSidePanel} title="Pomodoro Timer" />
                        <PanelBtn icon={<FaStickyNote />}                     panel="notes"    active={sidePanel} onClick={setSidePanel} title="Class Notes" />

                        <button className="edm-tb-btn" onClick={toggleFullscreen} title="Fullscreen">
                            {fullscreen ? <FaCompress /> : <FaExpand />}
                        </button>
                        <LeaveButton onLeave={leaveRoom} />
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="edm-body">
                    <div className="edm-main">

                        {/* Late join summary card */}
                        {lateJoin && (
                            <div className="edm-late-join">
                                <strong>You joined late.</strong> Check the chat and class notes for what you missed.
                                <button onClick={() => setLateJoin(false)}>✕</button>
                            </div>
                        )}

                        {mainView === 'video' ? (
                            <VideoGridErrorBoundary>
                                <LiveKitVideoGrid pinnedId={pinnedId} onPin={setPinnedId} />
                            </VideoGridErrorBoundary>
                        ) : (
                            <div style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', position:'relative' }}>
                                <button className="edm-wb-close-btn"
                                    onClick={() => isHost ? switchView('video') : setMainView('video')}>
                                    ← {isHost ? 'End Whiteboard' : 'Back to Video'}
                                </button>
                                <Whiteboard events={events} send={send} disabled={!wbAllowed} sessionId={sessionId} />
                                {!wbAllowed && (
                                    <div className="edm-wb-locked"><FaLock /> Whiteboard locked by teacher</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Side panels ── */}
                    {sidePanel && (
                        <div className="edm-side">
                            {sidePanel === 'chat'         && <ChatPanel events={events} send={send} user={user} />}
                            {sidePanel === 'participants'  && <ParticipantList participants={participants} events={events} isHost={isHost} send={send} sessionId={sessionId} />}
                            {sidePanel === 'hands'        && <HandQueue events={events} send={send} isHost={isHost} sessionId={sessionId} participants={participants} />}
                            {sidePanel === 'breakout'     && <BreakoutRooms send={send} events={events} participants={participants} isHost={isHost} currentRoomId={roomId} onLiveKitSwitch={handleLiveKitSwitch} />}
                            {sidePanel === 'polls'        && <LivePoll events={events} send={send} isHost={isHost} sessionId={sessionId} />}
                            {sidePanel === 'quiz'         && <QuizMode events={events} send={send} isHost={isHost} sessionId={sessionId} />}
                            {sidePanel === 'focus'        && <FocusCheck events={events} send={send} isHost={isHost} sessionId={sessionId} />}
                            {sidePanel === 'pomodoro'     && <PomodoroTimer events={events} send={send} isHost={isHost} />}
                            {sidePanel === 'notes'        && <ClassNotes events={events} send={send} isHost={isHost} sessionId={sessionId} />}
                        </div>
                    )}
                </div>

                {/* Student panels (non-host): polls and quizzes appear automatically when active */}
                {!isHost && activePoll && sidePanel !== 'polls' && (
                    <div className="edm-auto-panel">
                        <LivePoll events={events} send={send} isHost={false} sessionId={sessionId} />
                    </div>
                )}
                {!isHost && activeQuiz && sidePanel !== 'quiz' && (
                    <div className="edm-auto-panel">
                        <QuizMode events={events} send={send} isHost={false} sessionId={sessionId} />
                    </div>
                )}
                {!isHost && activeFocus && sidePanel !== 'focus' && (
                    <div className="edm-auto-panel">
                        <FocusCheck events={events} send={send} isHost={false} sessionId={sessionId} />
                    </div>
                )}
            </div>
        </LiveKitRoom>
    );
}

/** Mic/cam toggle buttons wired to the LiveKit local participant */
function MediaControls({ micEnabled, camEnabled, onMicToggle, onCamToggle }) {
    const { localParticipant } = useLocalParticipant();

    const toggleMic = () => {
        localParticipant?.setMicrophoneEnabled(!micEnabled);
        onMicToggle(!micEnabled);
    };
    const toggleCam = () => {
        localParticipant?.setCameraEnabled(!camEnabled);
        onCamToggle(!camEnabled);
    };

    return (
        <>
            <button className={`edm-tb-btn ${micEnabled ? 'active' : 'edm-tb-off'}`} onClick={toggleMic} title={micEnabled ? 'Mute' : 'Unmute'}>
                {micEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </button>
            <button className={`edm-tb-btn ${camEnabled ? 'active' : 'edm-tb-off'}`} onClick={toggleCam} title={camEnabled ? 'Camera off' : 'Camera on'}>
                {camEnabled ? <FaCamera /> : <FaVideoSlash />}
            </button>
        </>
    );
}

/** Screen share toggle wired to LiveKit */
function ScreenShareButton() {
    const { localParticipant } = useLocalParticipant();
    // Track sharing state from the actual publication, not local toggle
    const sharing = !!localParticipant?.getTrackPublication(Track.Source.ScreenShare)?.track;

    const toggle = async () => {
        try {
            await localParticipant?.setScreenShareEnabled(!sharing, {
                audio: true,
                resolution: { width: 1920, height: 1080, frameRate: 15 },
                contentHint: 'detail',
            }, {
                videoEncoding: { maxBitrate: 3_000_000, maxFramerate: 15 },
            });
        } catch {
            // user cancelled the share dialog or permission denied
        }
    };

    return (
        <button className={`edm-tb-btn ${sharing ? 'active' : ''}`} onClick={toggle} title={sharing ? 'Stop sharing' : 'Share screen'}>
            {sharing ? <FaStop /> : <FaDesktop />}
        </button>
    );
}

/** Leave button — stops all LiveKit tracks before navigating away */
function LeaveButton({ onLeave }) {
    const { localParticipant } = useLocalParticipant();

    const handleLeave = () => {
        // setCameraEnabled(false) only mutes — it does NOT stop the MediaStreamTrack,
        // so the camera light stays on. Stop the underlying tracks directly.
        try {
            [Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare].forEach(src => {
                localParticipant?.getTrackPublication(src)?.track?.mediaStreamTrack?.stop();
            });
        } catch {}
        // Also nuke any tracks still attached to video/audio DOM elements
        document.querySelectorAll('video, audio').forEach(el => {
            el.srcObject?.getTracks?.().forEach(t => t.stop());
            el.srcObject = null;
        });
        onLeave();
    };

    return (
        <button className="edm-tb-btn edm-leave" onClick={handleLeave} title="Leave">
            <FaSignOutAlt /> Leave
        </button>
    );
}

/** Error boundary — stops video grid crashes from taking down the whole room */
class VideoGridErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { crashed: false, msg: '' }; }
    static getDerivedStateFromError(err) { return { crashed: true, msg: err.message }; }
    render() {
        if (this.state.crashed) {
            return (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#999', gap:'.5rem', fontSize:'.85rem' }}>
                    <FaVideoSlash style={{ fontSize:'2rem' }} />
                    <span>Video grid error — refreshing tracks…</span>
                    <button className="btn btn-sm" onClick={() => this.setState({ crashed: false })} style={{ marginTop:'.5rem' }}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/** Reusable side-panel toggle button with optional badge */
function PanelBtn({ icon, badge, panel, active, onClick, title }) {
    const isActive = active === panel;
    return (
        <button
            className={`edm-tb-btn ${isActive ? 'active' : ''}`}
            onClick={() => onClick(p => p === panel ? null : panel)}
            title={title}
        >
            {icon}
            {badge > 0 && <span className="edm-tb-count">{badge}</span>}
        </button>
    );
}
