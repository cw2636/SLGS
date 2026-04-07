import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaCalendarAlt, FaPlus, FaVideo, FaCheckCircle, FaClock } from 'react-icons/fa';
import { MEETINGS } from '../../data/mockData';

const EMPTY = { title:'', date:'', time:'', duration:'60', link:'', description:'' };

export default function TeacherMeetings() {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState(MEETINGS);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [saved, setSaved] = useState(false);

    const addMeeting = (e) => {
        e.preventDefault();
        setMeetings(p => [{ id: Date.now(), ...form, duration: parseInt(form.duration), status:'upcoming', teacher: user?.name, attendees:[] }, ...p]);
        setForm(EMPTY);
        setShow(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const upcoming  = meetings.filter(m => m.status === 'upcoming');
    const completed = meetings.filter(m => m.status !== 'upcoming');

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Live Meetings</span>
                    <div className="pt-right">
                        <button className="btn btn-primary btn-sm" onClick={() => setShow(p => !p)}>
                            <FaPlus /> {show ? 'Cancel' : 'Schedule Meeting'}
                        </button>
                    </div>
                </div>

                <div className="portal-content">
                    {saved && (
                        <div style={{ marginBottom:'1rem', padding:'.8rem 1rem', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.88rem' }}>
                            <FaCheckCircle style={{ marginRight:'6px' }} />Meeting scheduled successfully.
                        </div>
                    )}

                    {/* Schedule form */}
                    {show && (
                        <div className="d-card" style={{ marginBottom:'1.75rem' }}>
                            <div className="d-card-title"><FaPlus /> New Meeting</div>
                            <form onSubmit={addMeeting} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                                <div className="fg" style={{ gridColumn:'1/-1' }}><label>Meeting Title</label><input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                                <div className="fg"><label>Date</label><input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                                <div className="fg"><label>Time</label><input required type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
                                <div className="fg">
                                    <label>Duration (minutes)</label>
                                    <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}>
                                        {['30','45','60','90','120'].map(d => <option key={d} value={d}>{d} mins</option>)}
                                    </select>
                                </div>
                                <div className="fg"><label>Meet Link (Google / Zoom)</label><input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://meet.google.com/…" /></div>
                                <div className="fg" style={{ gridColumn:'1/-1' }}><label>Description / Agenda</label>
                                    <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        style={{ resize:'vertical', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 14px', color:'var(--text)', fontFamily:'inherit', fontSize:'.9rem', outline:'none' }} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ gridColumn:'1/-1', justifySelf:'flex-start' }}><FaCheckCircle /> Save Meeting</button>
                            </form>
                        </div>
                    )}

                    {/* Upcoming */}
                    <div style={{ marginBottom:'2rem' }}>
                        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <FaClock style={{ color:'var(--gold)' }} /> Upcoming Meetings ({upcoming.length})
                        </h3>
                        {upcoming.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>No upcoming meetings. Schedule one above.</p>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'1.25rem' }}>
                                {upcoming.map(m => (
                                    <div key={m.id} className="mtg-card">
                                        <div className="mtg-card-head">
                                            <span className="mtg-badge upcoming">Upcoming</span>
                                            <span style={{ fontSize:'.8rem', color:'var(--text-dim)' }}>{m.duration} min</span>
                                        </div>
                                        <h4 className="mtg-title">{m.title}</h4>
                                        <p className="mtg-meta"><FaCalendarAlt /> {m.date} at {m.time}</p>
                                        {m.description && <p style={{ fontSize:'.84rem', color:'var(--text-muted)', marginBottom:'.9rem' }}>{m.description}</p>}
                                        {m.attendees?.length > 0 && <p style={{ fontSize:'.78rem', color:'var(--text-dim)', marginBottom:'.9rem' }}>Attendees: {m.attendees.join(', ')}</p>}
                                        {m.link && (
                                            <a href={m.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                                <FaVideo /> Join Meeting
                                            </a>
                                        )}
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
                                            <span style={{ fontSize:'.8rem', color:'var(--text-dim)' }}>{m.duration} min</span>
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
