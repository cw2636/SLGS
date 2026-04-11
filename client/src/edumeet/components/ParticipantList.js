import React from 'react';
import { FaUser, FaChalkboardTeacher, FaHandPaper } from 'react-icons/fa';

/**
 * Participant sidebar — shows who's in the room with role badges and hand-raise indicators.
 */
export default function ParticipantList({ participants, events }) {
    // Track raised hands
    const raisedHands = new Set();
    events.forEach(e => {
        if (e.type === 'hand_raise') raisedHands.add(e.from);
        if (e.type === 'hand_lower') raisedHands.delete(e.from);
    });

    return (
        <div className="edm-participants">
            <div className="edm-part-header">
                Participants ({participants.length})
            </div>
            <div className="edm-part-list">
                {participants.map((p, i) => (
                    <div key={p.user_id || i} className="edm-part-item">
                        <span className="edm-part-icon">
                            {p.role === 'teacher' || p.role === 'principal' ? <FaChalkboardTeacher /> : <FaUser />}
                        </span>
                        <span className="edm-part-name">{p.name}</span>
                        <span className={`edm-part-role ${p.role}`}>{p.role}</span>
                        {raisedHands.has(p.user_id) && (
                            <span className="edm-hand-raised" title="Hand raised"><FaHandPaper /></span>
                        )}
                    </div>
                ))}
                {participants.length === 0 && (
                    <p className="edm-part-empty">Waiting for participants...</p>
                )}
            </div>
        </div>
    );
}
