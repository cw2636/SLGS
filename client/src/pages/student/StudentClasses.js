import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBook, FaPlus, FaCheckCircle } from 'react-icons/fa';
import { SUBJECTS, ENROLLED_CLASSES } from '../../data/mockData';

export default function StudentClasses() {
    const { user } = useAuth();
    const initEnrolled = ENROLLED_CLASSES[user?.studentId] || [];
    const [enrolled, setEnrolled] = useState(initEnrolled);
    const [toast, setToast] = useState('');

    const toggle = (id, name) => {
        if (enrolled.includes(id)) {
            setEnrolled(p => p.filter(e => e !== id));
            showToast(`Dropped: ${name}`);
        } else {
            setEnrolled(p => [...p, id]);
            showToast(`Registered: ${name}`);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2800);
    };

    const mySubjects = SUBJECTS.filter(s => enrolled.includes(s.id));
    const available  = SUBJECTS.filter(s => !enrolled.includes(s.id));

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">My Classes</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" />{enrolled.length} Enrolled</div>
                    </div>
                </div>

                {toast && (
                    <div style={{ position:'fixed', top:'80px', right:'2rem', background:'var(--green)', color:'var(--text)', padding:'.75rem 1.25rem', borderRadius:'var(--r)', boxShadow:'var(--sh-md)', zIndex:999, fontSize:'.9rem', fontWeight:600, display:'flex', gap:'8px', alignItems:'center', animation:'fadeDown .3s ease' }}>
                        <FaCheckCircle /> {toast}
                    </div>
                )}

                <div className="portal-content">
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.3rem' }}>Class Registration</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', marginBottom:'2rem' }}>{user?.form} · Academic Year 2025/2026</p>

                    {/* Enrolled subjects */}
                    <div className="d-card" style={{ marginBottom:'1.75rem' }}>
                        <div className="d-card-title"><FaCheckCircle style={{ color:'var(--green-light)' }} /> My Enrolled Subjects ({mySubjects.length})</div>
                        {mySubjects.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.93rem', padding:'.5rem 0' }}>No subjects enrolled. Add subjects below.</p>
                        ) : (
                            <table className="portal-table">
                                <thead><tr><th>Code</th><th>Subject</th><th>Teacher</th><th>Credits</th><th>Action</th></tr></thead>
                                <tbody>
                                    {mySubjects.map(s => (
                                        <tr key={s.id}>
                                            <td><span className="tag tag-gold">{s.id}</span></td>
                                            <td style={{ fontWeight:600 }}>{s.name}</td>
                                            <td style={{ color:'var(--text-muted)' }}>{s.teacher}</td>
                                            <td>{s.credits}</td>
                                            <td>
                                                <button className="btn btn-sm" style={{ background:'rgba(239,68,68,.12)', color:'#fca5a5', border:'1px solid rgba(239,68,68,.3)' }} onClick={() => toggle(s.id, s.name)}>
                                                    Drop
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Available subjects */}
                    <div className="d-card">
                        <div className="d-card-title"><FaPlus style={{ color:'var(--gold)' }} /> Available Subjects</div>
                        {available.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.93rem', padding:'.5rem 0' }}>You are enrolled in all available subjects.</p>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
                                {available.map(s => (
                                    <div key={s.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.2rem', transition:'var(--t)' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.5rem' }}>
                                            <span className="tag tag-gold">{s.id}</span>
                                            <span style={{ fontSize:'.78rem', color:'var(--text-dim)' }}>{s.credits} credits</span>
                                        </div>
                                        <h4 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:'.3rem' }}>{s.name}</h4>
                                        <p style={{ fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'1rem' }}>{s.teacher}</p>
                                        <button className="btn btn-primary btn-sm btn-block" onClick={() => toggle(s.id, s.name)}>
                                            <FaPlus /> Register
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
