import React from 'react';
import { FaUser, FaChalkboardTeacher, FaHandPaper, FaMicrophoneSlash, FaUserSlash, FaCrown } from 'react-icons/fa';

/**
 * Participant sidebar — shows who's in the room with role badges,
 * hand-raise indicators, and host controls (mute/remove).
 */
export default function ParticipantList({ participants, events, isHost, send, sessionId }) {
    // Track raised hands
    const raisedHands = new Set();
    events.forEach(e => {
        if (e.type === 'hand_raise') raisedHands.add(e.from);
        if (e.type === 'hand_lower') raisedHands.delete(e.from);
    });

    const muteParticipant = (userId) => {
        if (send) send('host_mute', { target_user: userId });
    };

    const removeParticipant = (userId) => {
        if (send) send('host_remove', { target_user: userId });
    };

    const muteAll = () => {
        if (send) send('host_mute_all', {});
    };

    return (
        <div className="edm-participants">
            <div className="edm-part-header">
                <span>Participants ({participants.length})</span>
                {isHost && (
                    <button className="edm-part-mute-all" onClick={muteAll} title="Mute all participants">
                        <FaMicrophoneSlash /> Mute All
                    </button>
                )}
            </div>
            <div className="edm-part-list">
                {participants.map((p, i) => {
                    const isMe = p.user_id === sessionId;
                    const isParticipantHost = p.role === 'teacher' || p.role === 'principal';
                    return (
                        <div key={p.user_id || i} className={`edm-part-item ${isMe ? 'edm-part-me' : ''}`}>
                            <span className="edm-part-icon">
                                {isParticipantHost ? <FaChalkboardTeacher /> : <FaUser />}
                            </span>
                            <span className="edm-part-name">
                                {p.name}
                                {isMe && <span className="edm-part-you">(You)</span>}
                            </span>
                            <span className={`edm-part-role ${p.role}`}>
                                {isParticipantHost && <FaCrown style={{ marginRight: 3, fontSize: '.6rem' }} />}
                                {p.role}
                            </span>
                            {raisedHands.has(p.user_id) && (
                                <span className="edm-hand-raised" title="Hand raised"><FaHandPaper /></span>
                            )}
                            {/* Host controls — don't show on self or other hosts */}
                            {isHost && !isMe && !isParticipantHost && (
                                <div className="edm-part-actions">
                                    <button onClick={() => muteParticipant(p.user_id)} title="Mute participant">
                                        <FaMicrophoneSlash />
                                    </button>
                                    <button onClick={() => removeParticipant(p.user_id)} className="edm-part-remove" title="Remove from meeting">
                                        <FaUserSlash />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {participants.length === 0 && (
                    <p className="edm-part-empty">Waiting for participants...</p>
                )}
            </div>
        </div>
    );
}
