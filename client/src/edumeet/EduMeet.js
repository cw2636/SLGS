import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useEdumeetSocket from '../hooks/useEdumeetSocket';
import ChatPanel from '../components/ChatPanel';
import Whiteboard from '../components/Whiteboard';
import ParticipantList from '../components/ParticipantList';
import {
    FaComments, FaChalkboard, FaUsers, FaHandPaper, FaSignOutAlt,
    FaCircle, FaExpand, FaCompress
} from 'react-icons/fa';

/**
 * EduMeet Classroom — the main virtual classroom view.
 *
 * Layout:
 *   [Toolbar]
 *   [Main area — whiteboard or placeholder]  [Side panel — chat / participants]
 *
 * Teachers get host controls (clear whiteboard, end session).
 * All users get chat, hand raise, and whiteboard access.
 */
export default function EduMeet() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { events, participants, send, connected } = useEdumeetSocket(roomId, user);

    const [sidePanel, setSidePanel] = useState('chat'); // 'chat' | 'participants' | null
    const [showWhiteboard, setShowWhiteboard] = useState(true);
    const [handRaised, setHandRaised] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const isHost = user?.role === 'teacher' || user?.role === 'principal';

    const toggleHand = () => {
        if (handRaised) {
            send('hand_lower', { raised: false });
        } else {
            send('hand_raise', { raised: true });
        }
        setHandRaised(!handRaised);
    };

    const leaveRoom = () => {
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

    // Count raised hands
    const raisedHands = new Set();
    events.forEach(e => {
        if (e.type === 'hand_raise') raisedHands.add(e.from);
        if (e.type === 'hand_lower') raisedHands.delete(e.from);
    });
    const handCount = raisedHands.size;

    // Unread chat count
    const chatCount = events.filter(e => e.type === 'chat_message').length;

    return (
        <div className={`edm-classroom ${fullscreen ? 'edm-fullscreen' : ''}`}>
            {/* Top toolbar */}
            <div className="edm-toolbar">
                <div className="edm-toolbar-left">
                    <FaCircle className={`edm-status ${connected ? 'online' : 'offline'}`} />
                    <h2 className="edm-room-title">{roomId.replace(/-/g, ' ')}</h2>
                    <span className="edm-badge">{participants.length} in room</span>
                </div>
                <div className="edm-toolbar-right">
                    <button
                        className={`edm-tb-btn ${handRaised ? 'active' : ''}`}
                        onClick={toggleHand}
                        title={handRaised ? 'Lower hand' : 'Raise hand'}
                    >
                        <FaHandPaper />
                        {handCount > 0 && <span className="edm-tb-count">{handCount}</span>}
                    </button>
                    <button
                        className={`edm-tb-btn ${sidePanel === 'chat' ? 'active' : ''}`}
                        onClick={() => setSidePanel(p => p === 'chat' ? null : 'chat')}
                        title="Chat"
                    >
                        <FaComments />
                        {chatCount > 0 && <span className="edm-tb-count">{chatCount}</span>}
                    </button>
                    <button
                        className={`edm-tb-btn ${sidePanel === 'participants' ? 'active' : ''}`}
                        onClick={() => setSidePanel(p => p === 'participants' ? null : 'participants')}
                        title="Participants"
                    >
                        <FaUsers />
                    </button>
                    <button
                        className={`edm-tb-btn ${showWhiteboard ? 'active' : ''}`}
                        onClick={() => setShowWhiteboard(p => !p)}
                        title="Whiteboard"
                    >
                        <FaChalkboard />
                    </button>
                    <button className="edm-tb-btn" onClick={toggleFullscreen} title="Fullscreen">
                        {fullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                    <button className="edm-tb-btn edm-leave" onClick={leaveRoom} title="Leave">
                        <FaSignOutAlt /> Leave
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="edm-body">
                <div className="edm-main">
                    {showWhiteboard ? (
                        <Whiteboard events={events} send={send} />
                    ) : (
                        <div className="edm-placeholder">
                            <h3>🎓 Classroom Session</h3>
                            <p>Room: <strong>{roomId}</strong></p>
                            <p>{participants.length} participant{participants.length !== 1 ? 's' : ''} connected</p>
                            {isHost && <p className="edm-host-note">You are the host. Use the toolbar to manage the session.</p>}
                            <p style={{ marginTop: '1rem', fontSize: '.85rem', opacity: .6 }}>
                                Toggle the whiteboard, chat, or participant list using the toolbar above.
                            </p>
                        </div>
                    )}
                </div>

                {/* Side panel */}
                {sidePanel && (
                    <div className="edm-side">
                        {sidePanel === 'chat' && (
                            <ChatPanel events={events} send={send} user={user} />
                        )}
                        {sidePanel === 'participants' && (
                            <ParticipantList participants={participants} events={events} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
