import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useEdumeetSocket from './hooks/useEdumeetSocket';
import useWebRTC from './hooks/useWebRTC';
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
 * EduMeet Classroom v2 — full virtual classroom with:
 * - WebRTC video/audio (mesh topology)
 * - Screen sharing
 * - Collaborative whiteboard with teacher-controlled permissions
 * - Chat, breakout rooms, hand raise
 */
export default function EduMeet() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { events, participants, send, connected, sessionId } = useEdumeetSocket(roomId, user);
    const {
        localStream, remoteStreams, screenStream,
        startMedia, stopMedia, startScreenShare, stopScreenShare,
        toggleMic, toggleCam, micOn, camOn,
    } = useWebRTC(send, events, sessionId);

    // UI state
    const [sidePanel, setSidePanel] = useState('chat');
    const [mainView, setMainView] = useState('video'); // 'video' | 'whiteboard'
    const [handRaised, setHandRaised] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);

    const isHost = user?.role === 'teacher' || user?.role === 'principal';
    const wbAllowed = whiteboardOpen || isHost;

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

    // Listen for whiteboard permission broadcast from host
    React.useEffect(() => {
        const last = events[events.length - 1];
        if (last?.type === 'whiteboard_permission' && !isHost) {
            setWhiteboardOpen(last.payload?.allowed ?? false);
        }
    }, [events, isHost]);

    // Counts
    const raisedHands = new Set();
    events.forEach(e => {
        if (e.type === 'hand_raise') raisedHands.add(e.from);
        if (e.type === 'hand_lower') raisedHands.delete(e.from);
    });
    const handCount = raisedHands.size;
    const chatCount = events.filter(e => e.type === 'chat_message').length;

    return (
        <div className={`edm-classroom ${fullscreen ? 'edm-fullscreen' : ''}`}>
            {/* ── Toolbar ── */}
            <div className="edm-toolbar">
                <div className="edm-toolbar-left">
                    <FaCircle className={`edm-status ${connected ? 'online' : 'offline'}`} />
                    <h2 className="edm-room-title">{roomId.replace(/-/g, ' ')}</h2>
                    <span className="edm-badge">{participants.length} in room</span>
                </div>
                <div className="edm-toolbar-right">
                    {/* Video / Audio */}
                    {!localStream ? (
                        <button className="edm-tb-btn edm-tb-join" onClick={() => startMedia()} title="Join with camera & mic">
                            <FaVideo /> Join
                        </button>
                    ) : (
                        <>
                            <button className={`edm-tb-btn ${micOn ? 'active' : 'edm-tb-off'}`} onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'}>
                                {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                            </button>
                            <button className={`edm-tb-btn ${camOn ? 'active' : 'edm-tb-off'}`} onClick={toggleCam} title={camOn ? 'Camera off' : 'Camera on'}>
                                {camOn ? <FaVideo /> : <FaVideoSlash />}
                            </button>
                            <button className="edm-tb-btn edm-tb-off" onClick={stopMedia} title="Leave video">
                                <FaVideoSlash />
                            </button>
                        </>
                    )}

                    {/* Screen share */}
                    <button className={`edm-tb-btn ${screenStream ? 'active' : ''}`} onClick={screenStream ? stopScreenShare : startScreenShare} title={screenStream ? 'Stop sharing' : 'Share screen'}>
                        {screenStream ? <FaStop /> : <FaDesktop />}
                    </button>

                    <span className="edm-tb-sep-v" />

                    {/* View toggles */}
                    <button className={`edm-tb-btn ${mainView === 'video' ? 'active' : ''}`} onClick={() => setMainView('video')} title="Video view">
                        <FaVideo />
                    </button>
                    <button className={`edm-tb-btn ${mainView === 'whiteboard' ? 'active' : ''}`} onClick={() => setMainView('whiteboard')} title="Whiteboard">
                        <FaChalkboard />
                    </button>

                    {/* Whiteboard lock (host only) */}
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

            {/* ── Body ── */}
            <div className="edm-body">
                <div className="edm-main">
                    {mainView === 'video' ? (
                        <VideoGrid
                            localStream={localStream}
                            remoteStreams={remoteStreams}
                            screenStream={screenStream}
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
                        {sidePanel === 'participants' && <ParticipantList participants={participants} events={events} />}
                        {sidePanel === 'breakout' && (
                            <BreakoutRooms send={send} events={events} participants={participants} isHost={isHost} currentRoomId={roomId} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
