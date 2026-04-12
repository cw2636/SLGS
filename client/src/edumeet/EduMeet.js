import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useEdumeetSocket from './hooks/useEdumeetSocket';
import useWebRTC from './hooks/useWebRTC';
import PreJoinLobby from './components/PreJoinLobby';
import ChatPanel from './components/ChatPanel';
import Whiteboard from './components/Whiteboard';
import ParticipantList from './components/ParticipantList';
import VideoGrid from './components/VideoGrid';
import BreakoutRooms from './components/BreakoutRooms';
import {
    FaComments, FaChalkboard, FaUsers, FaHandPaper, FaSignOutAlt,
    FaCircle, FaExpand, FaCompress, FaVideo, FaVideoSlash,
    FaMicrophone, FaMicrophoneSlash, FaDesktop, FaStop,
    FaDoorOpen, FaLock, FaLockOpen
} from 'react-icons/fa';

/**
 * EduMeet Classroom v3 — Pre-join lobby → immediate media connection.
 */
export default function EduMeet() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [joined, setJoined] = useState(false);

    const { events, participants, send, connected, sessionId } = useEdumeetSocket(roomId, user);
    const {
        localStream, remoteStreams, screenStream, remoteScreenStream,
        startMedia, stopMedia, startScreenShare, stopScreenShare,
        toggleMic, toggleCam, micOn, camOn, closePeer,
    } = useWebRTC(send, events, sessionId);

    // UI state
    const [sidePanel, setSidePanel] = useState('chat');
    const [mainView, setMainView] = useState('video');
    const [handRaised, setHandRaised] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);

    const isHost = user?.role === 'teacher' || user?.role === 'principal';
    const wbAllowed = whiteboardOpen || isHost;

    // When user clicks "Join Meeting" from the lobby, start media immediately
    const handleLobbyJoin = ({ micOn: wantMic, camOn: wantCam, bgId: chosenBg, stream }) => {
        setJoined(true);
        // Reuse the lobby preview stream — pass bgId for virtual background
        startMedia({ micOn: wantMic, camOn: wantCam, stream, bgId: chosenBg });
    };

    // Clean up remote peers instantly when participant_list shrinks
    useEffect(() => {
        const currentPeerIds = new Set(participants.map(p => p.user_id));
        Object.keys(remoteStreams).forEach(peerId => {
            if (!currentPeerIds.has(peerId)) {
                closePeer(peerId);
            }
        });
    }, [participants, remoteStreams, closePeer]);

    // Listen for host actions directed at us
    useEffect(() => {
        if (!events.length) return;
        const last = events[events.length - 1];
        if (last.from === sessionId) return; // ignore own events
        if (last.type === 'whiteboard_permission' && !isHost) {
            setWhiteboardOpen(last.payload?.allowed ?? false);
        }
        // Sync view when another user switches (whiteboard ↔ video)
        if (last.type === 'view_change' && last.payload?.view) {
            setMainView(last.payload.view);
        }
        // Host muted us
        if (last.type === 'host_mute' && last.payload?.target_user === sessionId) {
            toggleMic(); // force mute
        }
        // Host removed us
        if (last.type === 'host_remove' && last.payload?.target_user === sessionId) {
            leaveRoom();
        }
    }, [events]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleHand = () => {
        send(handRaised ? 'hand_lower' : 'hand_raise', { raised: !handRaised });
        setHandRaised(!handRaised);
    };

    const leaveRoom = () => {
        stopMedia();
        stopScreenShare();
        send('room_leave', {});
        navigate(-1);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const toggleWhiteboardPermission = () => {
        const newState = !whiteboardOpen;
        setWhiteboardOpen(newState);
        send('whiteboard_permission', { allowed: newState });
    };

    // Counts
    const raisedHands = new Set();
    events.forEach(e => {
        if (e.type === 'hand_raise') raisedHands.add(e.from);
        if (e.type === 'hand_lower') raisedHands.delete(e.from);
    });
    const handCount = raisedHands.size;
    const chatCount = events.filter(e => e.type === 'chat_message').length;

    // ── Pre-join Lobby ──
    if (!joined) {
        return <PreJoinLobby roomId={roomId} user={user} onJoin={handleLobbyJoin} />;
    }

    // ── Meeting Room ──
    return (
        <div className={`edm-classroom ${fullscreen ? 'edm-fullscreen' : ''}`}>
            <div className="edm-toolbar">
                <div className="edm-toolbar-left">
                    <FaCircle className={`edm-status ${connected ? 'online' : 'offline'}`} />
                    <h2 className="edm-room-title">{roomId.replace(/-/g, ' ')}</h2>
                    <span className="edm-badge">{participants.length} in room</span>
                </div>
                <div className="edm-toolbar-right">
                    {/* Mic / Cam */}
                    <button className={`edm-tb-btn ${micOn ? 'active' : 'edm-tb-off'}`} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
                        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>
                    <button className={`edm-tb-btn ${camOn ? 'active' : 'edm-tb-off'}`} onClick={toggleCam} title={camOn ? 'Camera off' : 'Camera on'}>
                        {camOn ? <FaVideo /> : <FaVideoSlash />}
                    </button>

                    {/* Screen share */}
                    <button className={`edm-tb-btn ${screenStream ? 'active' : ''}`} onClick={screenStream ? stopScreenShare : startScreenShare} title={screenStream ? 'Stop sharing' : 'Share screen'}>
                        {screenStream ? <FaStop /> : <FaDesktop />}
                    </button>

                    <span className="edm-tb-sep-v" />

                    {/* View toggles */}
                    <button className={`edm-tb-btn ${mainView === 'video' ? 'active' : ''}`} onClick={() => { setMainView('video'); send('view_change', { view: 'video' }); }} title="Video view">
                        <FaVideo />
                    </button>
                    <button className={`edm-tb-btn ${mainView === 'whiteboard' ? 'active' : ''}`} onClick={() => { setMainView('whiteboard'); send('view_change', { view: 'whiteboard' }); }} title="Whiteboard">
                        <FaChalkboard />
                    </button>
                    {isHost && (
                        <button className={`edm-tb-btn ${whiteboardOpen ? 'active' : ''}`} onClick={toggleWhiteboardPermission}
                            title={whiteboardOpen ? 'Lock whiteboard' : 'Unlock whiteboard for students'}>
                            {whiteboardOpen ? <FaLockOpen /> : <FaLock />}
                        </button>
                    )}

                    <span className="edm-tb-sep-v" />

                    <button className={`edm-tb-btn ${handRaised ? 'active' : ''}`} onClick={toggleHand} title={handRaised ? 'Lower hand' : 'Raise hand'}>
                        <FaHandPaper />
                        {handCount > 0 && <span className="edm-tb-count">{handCount}</span>}
                    </button>
                    <button className={`edm-tb-btn ${sidePanel === 'chat' ? 'active' : ''}`} onClick={() => setSidePanel(p => p === 'chat' ? null : 'chat')} title="Chat">
                        <FaComments />
                        {chatCount > 0 && <span className="edm-tb-count">{chatCount}</span>}
                    </button>
                    <button className={`edm-tb-btn ${sidePanel === 'participants' ? 'active' : ''}`} onClick={() => setSidePanel(p => p === 'participants' ? null : 'participants')} title="Participants">
                        <FaUsers />
                    </button>
                    <button className={`edm-tb-btn ${sidePanel === 'breakout' ? 'active' : ''}`} onClick={() => setSidePanel(p => p === 'breakout' ? null : 'breakout')} title="Breakout Rooms">
                        <FaDoorOpen />
                    </button>

                    <button className="edm-tb-btn" onClick={toggleFullscreen} title="Fullscreen">
                        {fullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                    <button className="edm-tb-btn edm-leave" onClick={leaveRoom} title="Leave">
                        <FaSignOutAlt /> Leave
                    </button>
                </div>
            </div>

            <div className="edm-body">
                <div className="edm-main">
                    {mainView === 'video' ? (
                        <VideoGrid
                            localStream={localStream}
                            remoteStreams={remoteStreams}
                            screenStream={screenStream}
                            remoteScreenStream={remoteScreenStream}
                            micOn={micOn}
                            camOn={camOn}
                            participants={participants}
                        />
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', width:'100%', height:'100%', position:'relative' }}>
                            <Whiteboard events={events} send={send} disabled={!wbAllowed} />
                            {!wbAllowed && (
                                <div className="edm-wb-locked">
                                    <FaLock /> Whiteboard is locked by the teacher
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {sidePanel && (
                    <div className="edm-side">
                        {sidePanel === 'chat' && <ChatPanel events={events} send={send} user={user} />}
                        {sidePanel === 'participants' && (
                            <ParticipantList
                                participants={participants}
                                events={events}
                                isHost={isHost}
                                send={send}
                                sessionId={sessionId}
                            />
                        )}
                        {sidePanel === 'breakout' && (
                            <BreakoutRooms send={send} events={events} participants={participants} isHost={isHost} currentRoomId={roomId} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
