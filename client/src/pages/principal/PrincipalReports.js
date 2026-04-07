import React, { useState } from 'react';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaChartBar, FaTrophy, FaGraduationCap } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { SUBJECTS, GRADE_BOOK, USERS, SCHOOL_STATS } from '../../data/mockData';

function gradeColor(grade) {
    if (grade === 'A') return { bg:'rgba(34,197,94,.15)', color:'#86efac' };
    if (grade === 'B') return { bg:'rgba(59,130,246,.15)', color:'#93c5fd' };
    if (grade === 'C') return { bg:'rgba(234,179,8,.15)', color:'#fde047' };
    return { bg:'rgba(239,68,68,.15)', color:'#fca5a5' };
}

function scoreToGrade(s) {
    if (s >= 80) return 'A';
    if (s >= 65) return 'B';
    if (s >= 50) return 'C';
    return 'D';
}

export default function PrincipalReports() {
    const teachers = USERS.filter(u => u.role === 'teacher');
    const students = USERS.filter(u => u.role === 'student');
    const [term, setTerm] = useState('Term 1');

    const subjectRows = SUBJECTS.map(s => {
        const rows = GRADE_BOOK.filter(g => g.subject === s.name);
        const avg  = rows.length ? rows.reduce((a, g) => a + g.score, 0) / rows.length : null;
        const top  = rows.length ? Math.max(...rows.map(g => g.score)) : null;
        const grade = avg !== null ? scoreToGrade(avg) : null;
        const teacher = teachers.find(t => t.subject === s.name);
        return { ...s, avg, top, grade, teacherName: teacher?.name || '—' };
    });

    const overallAvg = subjectRows.filter(r => r.avg !== null).reduce((a, r) => a + r.avg, 0) / (subjectRows.filter(r => r.avg !== null).length || 1);

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Academic Reports</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                                Academic Performance Reports
                            </h2>
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                                Academic Year 2025/2026 · {term}
                            </p>
                        </div>
                        <div style={{ display:'flex', gap:'.4rem' }}>
                            {['Term 1','Term 2','Term 3'].map(t => (
                                <button key={t} className={`tab-btn ${term === t ? 'act' : ''}`} onClick={() => setTerm(t)}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* School-wide summary */}
                    <div className="dash-stats" style={{ marginBottom:'2rem' }}>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaTrophy /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.passRate}%</h3><span>WASSCE Pass Rate</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaChartBar /></div>
                            <div className="ds-info"><h3>{overallAvg.toFixed(1)}%</h3><span>Overall Avg Score</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaGraduationCap /></div>
                            <div className="ds-info"><h3>{students.length}</h3><span>Students Assessed</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaChartBar /></div>
                            <div className="ds-info"><h3>{SCHOOL_STATS.scholarships}</h3><span>Scholarships Awarded</span></div>
                        </div>
                    </div>

                    {/* Subject performance table */}
                    <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                        <div className="d-card-title"><FaChartBar /> Subject Performance — {term}</div>
                        <table className="portal-table">
                            <thead>
                                <tr><th>Subject</th><th>Teacher</th><th>Avg Score</th><th>Top Score</th><th>Grade</th></tr>
                            </thead>
                            <tbody>
                                {subjectRows.map(s => {
                                    const gc = s.grade ? gradeColor(s.grade) : {};
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight:600 }}>{s.name}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{s.teacherName}</td>
                                            <td>{s.avg !== null ? `${s.avg.toFixed(1)}%` : <span style={{ color:'var(--text-dim)' }}>—</span>}</td>
                                            <td>{s.top !== null ? `${s.top}%` : <span style={{ color:'var(--text-dim)' }}>—</span>}</td>
                                            <td>
                                                {s.grade ? (
                                                    <span className="grade-badge" style={{ background: gc.bg, color: gc.color, fontSize:'.72rem', padding:'2px 10px', borderRadius:'6px' }}>
                                                        {s.grade}
                                                    </span>
                                                ) : <span style={{ color:'var(--text-dim)' }}>—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Per-student breakdown */}
                    <div className="d-card">
                        <div className="d-card-title"><FaGraduationCap /> Student Grade Breakdown</div>
                        {students.map(s => {
                            const grades = GRADE_BOOK.filter(g =>
                                USERS.find(u => u.id === s.id && u.role === 'student') &&
                                g.studentId === s.studentId
                            );
                            const avg = grades.length ? grades.reduce((a, g) => a + g.score, 0) / grades.length : null;
                            return (
                                <div key={s.id} style={{ padding:'.9rem 0', borderBottom:'1px solid var(--border)' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.4rem' }}>
                                        <div>
                                            <span style={{ fontWeight:700 }}>{s.name}</span>
                                            <span style={{ color:'var(--text-muted)', fontSize:'.82rem', marginLeft:'8px' }}>{s.form} · {s.house} House</span>
                                        </div>
                                        {avg !== null && (
                                            <span style={{ fontWeight:700, color:'var(--gold)', fontSize:'.9rem' }}>{avg.toFixed(1)}% avg</span>
                                        )}
                                    </div>
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:'.35rem' }}>
                                        {grades.length === 0 ? (
                                            <span style={{ fontSize:'.8rem', color:'var(--text-dim)' }}>No grades recorded yet</span>
                                        ) : grades.map(g => {
                                            const gc = gradeColor(g.grade);
                                            return (
                                                <span key={g.subject} style={{ fontSize:'.78rem', padding:'2px 9px', borderRadius:'6px', background: gc.bg, color: gc.color }}>
                                                    {g.subject}: {g.score}% ({g.grade})
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
