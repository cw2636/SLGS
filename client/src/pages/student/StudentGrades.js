import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBell, FaGraduationCap, FaFilter } from 'react-icons/fa';
import { STUDENT_GRADES, gradeColor, scoreToGrade } from '../../data/mockData';

const gradeBg = g => {
    if (g === 'A*') return 'rgba(34,197,94,.15)';
    if (g === 'A')  return 'rgba(132,204,22,.15)';
    if (g === 'B')  return 'rgba(234,179,8,.15)';
    if (g === 'C')  return 'rgba(249,115,22,.12)';
    return 'rgba(239,68,68,.1)';
};

export default function StudentGrades() {
    const { user } = useAuth();
    const all = STUDENT_GRADES[user?.studentId] || [];
    const terms = [...new Set(all.map(g => g.term))];
    const [term, setTerm] = useState('All');

    const filtered = term === 'All' ? all : all.filter(g => g.term === term);
    const avg = filtered.length ? (filtered.reduce((s, g) => s + g.score, 0) / filtered.length).toFixed(1) : '—';
    const best = filtered.length ? filtered.reduce((a, g) => g.score > a.score ? g : a, filtered[0]) : null;

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">My Grades</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" />{user?.form}</div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.2rem' }}>Academic Results</h2>
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>SLGS · {user?.studentId} · {user?.form}</p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
                            <FaFilter style={{ color:'var(--text-muted)', fontSize:'.9rem' }} />
                            <select style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'7px 12px', color:'var(--text)', fontFamily:'inherit', fontSize:'.87rem', cursor:'pointer' }}
                                value={term} onChange={e => setTerm(e.target.value)}>
                                <option value="All">All Terms</option>
                                {terms.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Summary cards */}
                    <div className="dash-stats" style={{ marginBottom:'1.75rem' }}>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaGraduationCap /></div>
                            <div className="ds-info"><h3>{avg}%</h3><span>Average Score</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><span style={{ fontWeight:800, fontSize:'1.1rem' }}>A*</span></div>
                            <div className="ds-info"><h3>{filtered.filter(g => g.grade === 'A*').length}</h3><span>A* Grades</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><span style={{ fontWeight:800, fontSize:'1.1rem' }}>A</span></div>
                            <div className="ds-info"><h3>{filtered.filter(g => g.grade === 'A').length}</h3><span>A Grades</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><span style={{ fontWeight:700, fontSize:'.85rem', color:'var(--text-muted)' }}>Best</span></div>
                            <div className="ds-info"><h3>{best?.score || '—'}%</h3><span>{best?.subject || 'N/A'}</span></div>
                        </div>
                    </div>

                    {/* Grades table */}
                    <div className="d-card">
                        <div className="d-card-title"><FaGraduationCap /> Grades — {term}</div>
                        {filtered.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', padding:'1rem 0', fontSize:'.93rem' }}>No grades recorded yet.</p>
                        ) : (
                            <table className="portal-table">
                                <thead>
                                    <tr><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Teacher's Comments</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map((g, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight:600 }}>{g.subject}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{g.term}</td>
                                            <td>
                                                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                                    {g.score}%
                                                    <div style={{ flex:1, maxWidth:'80px', height:'6px', borderRadius:'9999px', background:'var(--border)', overflow:'hidden' }}>
                                                        <div style={{ width:`${g.score}%`, height:'100%', background:`linear-gradient(90deg,var(--green-mid),var(--green-light))`, borderRadius:'9999px' }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="grade-badge" style={{ background:gradeBg(g.grade), color:gradeColor(g.grade) }}>{g.grade}</span>
                                            </td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.86rem', maxWidth:'300px' }}>{g.comments}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
