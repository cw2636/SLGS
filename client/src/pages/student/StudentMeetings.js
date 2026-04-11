import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaCalendarAlt, FaVideo, FaClock, FaCheckCircle } from 'react-icons/fa';
import { MEETINGS } from '../../data/mockData';

/** Generate a URL-friendly room ID from the meeting title. */
function toRoomId(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'classroom';
}

export default function StudentMeetings() {
    const navigate = useNavigate();

    const upcoming  = MEETINGS.filter(m => m.status === 'upcoming');
    const completed = MEETINGS.filter(m => m.status !== 'upcoming');

    const joinRoom = (meeting) => {
        const roomId = meeting.roomId || toRoomId(meeting.title);
        navigate(`/classroom/${roomId}`);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Live Meetings</span>
                </div>

                <div className="portal-content">
                    {/* Upcoming */}
                    <div style={{ marginBottom:'2rem' }}>
                        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <FaClock style={{ color:'var(--gold)' }} /> Upcoming Meetings ({upcoming.length})
                        </h3>
                        {upcoming.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>No upcoming meetings scheduled.</p>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1.25rem' }}>
                                {upcoming.map(m => (
                                    <div key={m.id} className="mtg-card">
                                        <div className="mtg-card-head">
                                            <span className="mtg-badge upcoming">Upcoming</span>
                                            <span style={{ fontSize:'.8rem', color:'var(--text-dim)' }}>{m.duration}</span>
                                        </div>
                                        <h4 className="mtg-title">{m.title}</h4>
                                        <p className="mtg-meta"><FaCalendarAlt /> {m.date} at {m.time}</p>
                                        {m.host && <p style={{ fontSize:'.78rem', color:'var(--text-dim)', marginBottom:'.9rem' }}>Host: {m.host}</p>}
                                        {m.attendees?.length > 0 && <p style={{ fontSize:'.78rem', color:'var(--text-dim)', marginBottom:'.9rem' }}>Attendees: {m.attendees.join(', ')}</p>}
                                        <button onClick={() => joinRoom(m)} className="btn btn-primary btn-sm">
                                            <FaVideo /> Join Classroom
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed */}
                    {completed.length > 0 && (
                        <div>
                            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                                <FaCheckCircle style={{ color:'var(--green-light)' }} /> Past Meetings ({completed.length})
                            </h3>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1.25rem' }}>
                                {completed.map(m => (
                                    <div key={m.id} className="mtg-card" style={{ opacity:.7 }}>
                                        <div className="mtg-card-head">
                                            <span className="mtg-badge done">Completed</span>
                                            <span style={{ fontSize:'.8rem', color:'var(--text-dim)' }}>{m.duration}</span>
                                        </div>
                                        <h4 className="mtg-title">{m.title}</h4>
                                        <p className="mtg-meta"><FaCalendarAlt /> {m.date} at {m.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
