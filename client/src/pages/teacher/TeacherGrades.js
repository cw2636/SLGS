import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaPen, FaPlus, FaCheck } from 'react-icons/fa';
import { GRADE_BOOK, scoreToGrade, gradeColor } from '../../data/mockData';

const gradeBg = g => {
    if (g==='A*') return 'rgba(34,197,94,.15)';  if (g==='A') return 'rgba(132,204,22,.15)';
    if (g==='B')  return 'rgba(234,179,8,.15)';   if (g==='C') return 'rgba(249,115,22,.12)';
    return 'rgba(239,68,68,.1)';
};

export default function TeacherGrades() {
    const { user } = useAuth();
    const [grades, setGrades] = useState(GRADE_BOOK);
    const [editing, setEditing] = useState(null);
    const [editVal, setEditVal] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [newG, setNewG] = useState({ studentName:'', form:'', term:'Term 1 2025', score:'', comments:'' });
    const [saved, setSaved] = useState(null);

    const startEdit = (i, score) => { setEditing(i); setEditVal(score); };
    const saveEdit  = (i) => {
        const s = Math.min(100, Math.max(0, parseInt(editVal) || 0));
        setGrades(prev => {
            const g2 = [...prev];
            g2[i] = { ...g2[i], score: s, grade: scoreToGrade(s) };
            return g2;
        });
        setEditing(null);
        setSaved(i);
        setTimeout(() => setSaved(null), 2500);
    };

    const addNew = (e) => {
        e.preventDefault();
        const s = Math.min(100, Math.max(0, parseInt(newG.score) || 0));
        setGrades(prev => [...prev, { ...newG, score: s, grade: scoreToGrade(s), subject: user?.subject || 'Mathematics' }]);
        setNewG({ studentName:'', form:'', term:'Term 1 2025', score:'', comments:'' });
        setShowNew(false);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Grade Management</span>
                    <div className="pt-right">
                        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(p => !p)}>
                            <FaPlus /> {showNew ? 'Cancel' : 'New Entry'}
                        </button>
                    </div>
                </div>

                <div className="portal-content">
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.3rem' }}>
                        Grade Book — {user?.subject || 'Mathematics'}
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', marginBottom:'2rem' }}>Term 1 & Term 2 · 2025/2026</p>

                    {/* New Grade Form */}
                    {showNew && (
                        <div className="d-card" style={{ marginBottom:'1.75rem' }}>
                            <div className="d-card-title"><FaPlus /> New Grade Entry</div>
                            <form onSubmit={addNew} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                                <div className="fg"><label>Student Name</label><input required value={newG.studentName} onChange={e => setNewG(p => ({ ...p, studentName: e.target.value }))} /></div>
                                <div className="fg"><label>Form/Class</label>
                                    <select value={newG.form} onChange={e => setNewG(p => ({ ...p, form: e.target.value }))}>
                                        {['Form 1','Form 2','Form 3','Form 4','Form 5','Lower Sixth','Upper Sixth'].map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="fg"><label>Term</label>
                                    <select value={newG.term} onChange={e => setNewG(p => ({ ...p, term: e.target.value }))}>
                                        <option>Term 1 2025</option><option>Term 2 2025</option><option>Term 1 2026</option>
                                    </select>
                                </div>
                                <div className="fg"><label>Score (0–100)</label><input required type="number" min="0" max="100" value={newG.score} onChange={e => setNewG(p => ({ ...p, score: e.target.value }))} /></div>
                                <div className="fg" style={{ gridColumn:'1/-1' }}><label>Comments</label><input value={newG.comments} onChange={e => setNewG(p => ({ ...p, comments: e.target.value }))} /></div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ gridColumn:'1/-1', justifySelf:'flex-start' }}><FaCheck /> Save Entry</button>
                            </form>
                        </div>
                    )}

                    {/* Grade table */}
                    <div className="d-card">
                        <div className="d-card-title"><FaPen /> Student Grades ({grades.length})</div>
                        <table className="portal-table">
                            <thead><tr><th>Student</th><th>Form</th><th>Term</th><th>Score</th><th>Grade</th><th>Comments</th><th>Actions</th></tr></thead>
                            <tbody>
                                {grades.map((g, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight:600 }}>{g.studentName}</td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{g.form}</td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{g.term}</td>
                                        <td>
                                            {editing === i ? (
                                                <input type="number" min="0" max="100" value={editVal}
                                                    onChange={e => setEditVal(e.target.value)}
                                                    style={{ width:'62px', background:'var(--bg)', border:'1.5px solid var(--gold)', borderRadius:'4px', color:'var(--text)', padding:'4px 6px', fontSize:'.9rem' }}
                                                    autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(i)} />
                                            ) : (
                                                <span>{g.score}%</span>
                                            )}
                                        </td>
                                        <td>
                                            {saved === i
                                                ? <FaCheck style={{ color:'var(--green-light)', marginLeft:'4px' }} />
                                                : <span className="grade-badge" style={{ background:gradeBg(g.grade), color:gradeColor(g.grade) }}>{g.grade}</span>
                                            }
                                        </td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.84rem', maxWidth:'200px' }}>{g.comments}</td>
                                        <td>
                                            {editing === i
                                                ? <button className="btn btn-sm btn-primary" onClick={() => saveEdit(i)}>Save</button>
                                                : <button className="btn btn-outline btn-sm" title="Edit score" onClick={() => startEdit(i, g.score)}><FaPen /></button>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
