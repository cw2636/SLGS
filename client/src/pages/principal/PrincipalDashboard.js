import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaUsers, FaChalkboardTeacher, FaTrophy, FaAward, FaBell, FaPlus, FaCheck, FaGraduationCap, FaChartBar } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { USERS, SCHOOL_STATS, ANNOUNCEMENTS, GRADE_BOOK, SUBJECTS } from '../../data/mockData';

export default function PrincipalDashboard() {
    const { user } = useAuth();
    const teachers  = USERS.filter(u => u.role === 'teacher');
    const students  = USERS.filter(u => u.role === 'student');
    const [announcements, setAnn] = useState(ANNOUNCEMENTS);
    const [newAnn, setNewAnn] = useState({ title:'', body:'' });
    const [showForm, setShowForm] = useState(false);
    const [saved, setSaved] = useState(false);

    const addAnn = (e) => {
        e.preventDefault();
        setAnn(p => [{ id: Date.now(), date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }), category:'General', ...newAnn }, ...p]);
        setNewAnn({ title:'', body:'' });
        setShowForm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Principal's Office</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            Welcome, {user?.name}
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                            Sierra Leone Grammar School · Academic Year 2025/2026
                        </p>
                    </div>

                    {/* School-wide stats */}
                    <div className="dash-stats" style={{ marginBottom:'2rem' }}>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaUsers /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.totalStudents.toLocaleString()}</h3><span>Total Students</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaChalkboardTeacher /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.totalTeachers}</h3><span>Teaching Staff</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaTrophy /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.passRate}%</h3><span>WASSCE Pass Rate</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaAward /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.scholarships}</h3><span>Scholarships</span></div>
                        </div>
                    </div>

                    {/* Main grid */}
                    <div className="dash-grid" style={{ gridTemplateColumns:'3fr 2fr', gap:'1.5rem' }}>

                        {/* Teacher management */}
                        <div>
                            <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                                <div className="d-card-title"><FaChalkboardTeacher /> Teaching Staff ({teachers.length})</div>
                                <table className="portal-table">
                                    <thead><tr><th>Name</th><th>Subject</th><th>Staff ID</th><th>Qualification</th></tr></thead>
                                    <tbody>
                                        {teachers.map(t => (
                                            <tr key={t.username}>
                                                <td style={{ fontWeight:600 }}>{t.name}</td>
                                                <td style={{ color:'var(--text-muted)' }}>{t.subject}</td>
                                                <td><span className="tag tag-gold">{t.staffId}</span></td>
                                                <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{t.qualification}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Student management */}
                            <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                                <div className="d-card-title"><FaGraduationCap /> Enrolled Students ({students.length})</div>
                                <table className="portal-table">
                                    <thead><tr><th>Name</th><th>Form</th><th>Student ID</th><th>Email</th></tr></thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.username}>
                                                <td style={{ fontWeight:600 }}>{s.name}</td>
                                                <td style={{ color:'var(--text-muted)' }}>{s.form}</td>
                                                <td><span className="tag tag-green">{s.studentId}</span></td>
                                                <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{s.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Academic overview */}
                            <div className="d-card">
                                <div className="d-card-title"><FaChartBar /> Academic Performance Overview</div>
                                <table className="portal-table">
                                    <thead><tr><th>Subject</th><th>Teacher</th><th>Avg Score</th><th>Top Grade</th></tr></thead>
                                    <tbody>
                                        {SUBJECTS.slice(0,6).map(s => {
                                            const rows = GRADE_BOOK.filter(g => g.subject === s.name);
                                            const avg = rows.length ? (rows.reduce((a, g) => a + g.score, 0) / rows.length).toFixed(1) : '—';
                                            return (
                                                <tr key={s.id}>
                                                    <td style={{ fontWeight:600 }}>{s.name}</td>
                                                    <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{s.teacher}</td>
                                                    <td>{avg}{avg !== '—' ? '%' : ''}</td>
                                                    <td><span className="grade-badge" style={{ fontSize:'.72rem', padding:'2px 8px', background:'rgba(34,197,94,.15)', color:'#86efac' }}>A</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar: Announcements */}
                        <div>
                            <div className="d-card" style={{ marginBottom:'1.25rem' }}>
                                <div className="d-card-title" style={{ justifyContent:'space-between', display:'flex', alignItems:'center' }}>
                                    <span><FaBell /> Announcements</span>
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(p => !p)}><FaPlus /> {showForm ? 'Cancel' : 'New'}</button>
                                </div>

                                {saved && (
                                    <div style={{ margin:'.5rem 0 .75rem', padding:'.65rem .9rem', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.84rem' }}>
                                        <FaCheck style={{ marginRight:'6px' }} /> Announcement published.
                                    </div>
                                )}

                                {showForm && (
                                    <form onSubmit={addAnn} style={{ marginBottom:'1rem', display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                        <div className="fg"><label>Title</label><input required value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} /></div>
                                        <div className="fg"><label>Body</label>
                                            <textarea rows={3} required value={newAnn.body} onChange={e => setNewAnn(p => ({ ...p, body: e.target.value }))}
                                                style={{ resize:'vertical', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'8px 12px', color:'var(--text)', fontFamily:'inherit', fontSize:'.87rem', outline:'none' }} />
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }}><FaCheck /> Publish</button>
                                    </form>
                                )}

                                {announcements.map(a => (
                                    <div key={a.id} style={{ padding:'.75rem 0', borderBottom:'1px solid var(--border)' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'2px' }}>
                                            <div style={{ fontSize:'.87rem', fontWeight:700 }}>{a.title}</div>
                                            <span style={{ fontSize:'.73rem', padding:'2px 8px', background:'rgba(201,162,39,.12)', color:'var(--gold)', borderRadius:'999px', border:'1px solid rgba(201,162,39,.25)', whiteSpace:'nowrap' }}>{a.category}</span>
                                        </div>
                                        <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{a.date}</div>
                                        {a.body && <div style={{ fontSize:'.83rem', color:'var(--text-dim)', marginTop:'4px' }}>{a.body}</div>}
                                    </div>
                                ))}
                            </div>

                            {/* School stats card */}
                            <div className="d-card">
                                <div className="d-card-title"><FaChartBar /> Quick Metrics</div>
                                {[
                                    { label:'Forms/Years', val: '7 (Form 1 – Upper Sixth)' },
                                    { label:'Subjects Offered', val: `${SUBJECTS.length} subjects` },
                                    { label:'WASSCE Class', val: 'Upper Sixth 2026' },
                                    { label:'Motto', val: 'Διωκω — To Pursue' },
                                    { label:'Founded', val: '1845, Murray Town' },
                                    { label:'Type', val: 'Anglican Grammar School' },
                                ].map(({ label, val }) => (
                                    <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'.55rem 0', borderBottom:'1px solid var(--border)', fontSize:'.84rem' }}>
                                        <span style={{ color:'var(--text-muted)' }}>{label}</span>
                                        <span style={{ fontWeight:600, textAlign:'right', maxWidth:'55%' }}>{val}</span>
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
