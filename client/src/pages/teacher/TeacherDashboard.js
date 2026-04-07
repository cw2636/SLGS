import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBell, FaUsers, FaPen, FaCalendarAlt, FaEnvelope, FaArrowRight, FaTrophy } from 'react-icons/fa';
import { GRADE_BOOK, MEETINGS, MESSAGES, ANNOUNCEMENTS } from '../../data/mockData';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const myMessages = MESSAGES.filter(m => m.fromRole === 'teacher');
    const upcoming = MEETINGS.filter(m => m.status === 'upcoming');
    const avg = GRADE_BOOK.length ? (GRADE_BOOK.reduce((s, g) => s + g.score, 0) / GRADE_BOOK.length).toFixed(1) : '—';
    const passing = GRADE_BOOK.filter(g => g.score >= 50).length;

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Teacher Dashboard</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(82,183,136,.3)', color:'var(--green-light)' }}>
                            <div className="pt-dot" /> {user?.subject}
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            Welcome, {user?.name} 👋
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.93rem' }}>
                            {user?.staffId} · {user?.subject} · {user?.qualification}
                        </p>
                    </div>

                    <div className="dash-stats">
                        <div className="ds-card">
                            <div className="ds-icon green"><FaUsers /></div>
                            <div className="ds-info"><h3>{GRADE_BOOK.length}</h3><span>Students</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaTrophy /></div>
                            <div className="ds-info"><h3>{avg}%</h3><span>Class Average</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaCalendarAlt /></div>
                            <div className="ds-info"><h3>{upcoming.length}</h3><span>Upcoming Meetings</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaEnvelope /></div>
                            <div className="ds-info"><h3>{passing}</h3><span>Students Passing</span></div>
                        </div>
                    </div>

                    <div className="dash-grid">
                        {/* Grade book preview */}
                        <div className="d-card">
                            <div className="d-card-title"><FaPen /> Grade Book ({user?.subject})</div>
                            <table className="portal-table">
                                <thead><tr><th>Student</th><th>Form</th><th>Score</th><th>Grade</th></tr></thead>
                                <tbody>
                                    {GRADE_BOOK.slice(0,5).map((g, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight:600 }}>{g.studentName}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{g.form}</td>
                                            <td>{g.score}%</td>
                                            <td>
                                                <span className="grade-badge" style={{ background:gradeBg(g.grade), color:gradeCol(g.grade) }}>{g.grade}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-outline btn-sm" style={{ marginTop:'1rem' }} onClick={() => navigate('/teacher/grades')}>
                                Manage Grades <FaArrowRight />
                            </button>
                        </div>

                        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                            {/* Upcoming meetings */}
                            <div className="d-card">
                                <div className="d-card-title"><FaCalendarAlt /> Upcoming Meetings</div>
                                {upcoming.map(m => (
                                    <div key={m.id} style={{ padding:'.7rem 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }} onClick={() => navigate('/teacher/meetings')}>
                                        <div style={{ fontSize:'.88rem', fontWeight:600 }}>{m.title}</div>
                                        <div style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>{m.date} · {m.time}</div>
                                    </div>
                                ))}
                                <button className="btn btn-outline btn-sm" style={{ marginTop:'.75rem', width:'100%', justifyContent:'center' }} onClick={() => navigate('/teacher/meetings')}>
                                    All Meetings <FaArrowRight />
                                </button>
                            </div>

                            {/* Announcements */}
                            <div className="d-card">
                                <div className="d-card-title"><FaBell /> Announcements</div>
                                {ANNOUNCEMENTS.slice(0,2).map(a => (
                                    <div key={a.id} style={{ padding:'.65rem 0', borderBottom:'1px solid var(--border)' }}>
                                        <div style={{ fontSize:'.84rem', fontWeight:600 }}>{a.title}</div>
                                        <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{a.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const gradeBg  = g => { if (g==='A*') return 'rgba(34,197,94,.15)'; if (g==='A') return 'rgba(132,204,22,.15)'; if (g==='B') return 'rgba(234,179,8,.15)'; return 'rgba(239,68,68,.1)'; };
const gradeCol = g => { if (g==='A*') return '#86efac'; if (g==='A') return '#bef264'; if (g==='B') return '#fde047'; return '#fca5a5'; };
