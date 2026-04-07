import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBell, FaGraduationCap, FaBook, FaEnvelope, FaCalendarAlt, FaArrowRight, FaTrophy } from 'react-icons/fa';
import { STUDENT_GRADES, ENROLLED_CLASSES, SUBJECTS, MESSAGES, ANNOUNCEMENTS } from '../../data/mockData';

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const grades = STUDENT_GRADES[user?.studentId] || [];
    const enrolled = ENROLLED_CLASSES[user?.studentId] || [];
    const myMessages = MESSAGES.filter(m => m.to === user?.username) || [];
    const recent = grades.slice(-4);
    const avg = grades.length ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) : '—';

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Student Dashboard</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" /> {user?.form || 'Student'}</div>
                        <div className="pt-bell" title="Notifications">
                            <FaBell />
                            {myMessages.length > 0 && <div className="pt-notif">{myMessages.length}</div>}
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    {/* Welcome */}
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontSize:'1.6rem', fontFamily:"'Playfair Display',serif", marginBottom:'.3rem' }}>
                            Welcome back, {user?.name?.split(' ')[0]} 👋
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.93rem' }}>
                            {user?.studentId} · {user?.form} · House: {user?.house || 'N/A'} · SLGS
                        </p>
                    </div>

                    {/* Stats cards */}
                    <div className="dash-stats">
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaGraduationCap /></div>
                            <div className="ds-info"><h3>{avg}%</h3><span>Average Grade</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaBook /></div>
                            <div className="ds-info"><h3>{enrolled.length}</h3><span>Enrolled Subjects</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaEnvelope /></div>
                            <div className="ds-info"><h3>{myMessages.length}</h3><span>New Messages</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon red"><FaTrophy /></div>
                            <div className="ds-info"><h3>{grades.filter(g => g.grade === 'A*' || g.grade === 'A').length}</h3><span>A/A* Grades</span></div>
                        </div>
                    </div>

                    {/* Main grid */}
                    <div className="dash-grid">
                        {/* Recent Grades */}
                        <div className="d-card">
                            <div className="d-card-title"><FaGraduationCap /> Recent Grades</div>
                            <table className="portal-table">
                                <thead><tr><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th></tr></thead>
                                <tbody>
                                    {recent.map((g, i) => (
                                        <tr key={i}>
                                            <td>{g.subject}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{g.term}</td>
                                            <td>{g.score}%</td>
                                            <td><span className="grade-badge" style={{ background:gradeBg(g.grade), color:gradeColor(g.grade) }}>{g.grade}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-outline btn-sm" style={{ marginTop:'1rem' }} onClick={() => navigate('/student/grades')}>
                                View All Grades <FaArrowRight />
                            </button>
                        </div>

                        {/* Messages & Announcements */}
                        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                            <div className="d-card">
                                <div className="d-card-title"><FaEnvelope /> Messages</div>
                                {myMessages.slice(0,3).map(m => (
                                    <div key={m.id} style={{ padding:'.75rem 0', borderBottom:'1px solid var(--border)', cursor:'pointer' }} onClick={() => navigate('/student/messages')}>
                                        <div style={{ fontSize:'.87rem', fontWeight:600 }}>{m.from}</div>
                                        <div style={{ fontSize:'.82rem', color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.subject}</div>
                                        <div style={{ fontSize:'.74rem', color:'var(--text-dim)', marginTop:'2px' }}>{m.date}</div>
                                    </div>
                                ))}
                                <button className="btn btn-outline btn-sm" style={{ marginTop:'.75rem', width:'100%', justifyContent:'center' }} onClick={() => navigate('/student/messages')}>
                                    All Messages <FaArrowRight />
                                </button>
                            </div>

                            <div className="d-card">
                                <div className="d-card-title"><FaBell /> Announcements</div>
                                {ANNOUNCEMENTS.slice(0,2).map(a => (
                                    <div key={a.id} style={{ padding:'.65rem 0', borderBottom:'1px solid var(--border)' }}>
                                        <div style={{ fontSize:'.84rem', fontWeight:600, marginBottom:'2px' }}>{a.title}</div>
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
const gradeColor = g => { if (g==='A*') return '#86efac'; if (g==='A') return '#bef264'; if (g==='B') return '#fde047'; return '#fca5a5'; };
