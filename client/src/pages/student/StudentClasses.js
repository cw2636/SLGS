import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBook, FaPlus, FaCheckCircle, FaLock, FaExclamationTriangle, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { SUBJECTS, ENROLLED_CLASSES, HOLDS, COURSES } from '../../data/mockData';

export default function StudentClasses() {
    const { user } = useAuth();
    const initEnrolled = ENROLLED_CLASSES[user?.studentId] || [];
    const [enrolled, setEnrolled] = useState(initEnrolled);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    // ── Hold check ────────────────────────────────────────────
    const activeHold = HOLDS.find(h => h.studentId === user?.studentId && h.active);
    const hasHold = !!activeHold;

    // ── Match subject → LMS course ────────────────────────────
    // COURSES use id pattern like 'MTH-SS3'; form 'SS 3' → 'SS3'
    const formCode = (user?.form || '').replace(' ', '');
    const getCourse = subId => COURSES.find(c => c.id === `${subId}-${formCode}`);

    // ── Class toggle ──────────────────────────────────────────
    const toggle = (id, name) => {
        if (hasHold) {
            showToast('Registration locked — resolve your account hold first.', 'error');
            return;
        }
        if (enrolled.includes(id)) {
            setEnrolled(p => p.filter(e => e !== id));
            showToast(`Dropped: ${name}`);
        } else {
            setEnrolled(p => [...p, id]);
            showToast(`Registered: ${name}`);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 2800);
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
                        <div className="pt-badge">
                            <div className="pt-dot" />{enrolled.length} Enrolled
                        </div>
                    </div>
                </div>

                {/* Toast */}
                {toast.msg && (
                    <div style={{
                        position:'fixed', top:'80px', right:'2rem', zIndex:999,
                        background: toast.type === 'error' ? 'rgba(239,68,68,.15)' : 'var(--green)',
                        border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,.4)' : 'transparent'}`,
                        color: toast.type === 'error' ? '#f87171' : 'var(--text)',
                        padding:'.75rem 1.25rem', borderRadius:'var(--r)',
                        boxShadow:'var(--sh-md)', fontSize:'.9rem', fontWeight:600,
                        display:'flex', gap:'8px', alignItems:'center',
                    }}>
                        {toast.type === 'error' ? <FaLock /> : <FaCheckCircle />}
                        {toast.msg}
                    </div>
                )}

                <div className="portal-content">
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.3rem' }}>
                        Class Registration
                    </h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', marginBottom:'1.5rem' }}>
                        {user?.form} · {user?.classSection} · Academic Year 2025/2026
                    </p>

                    {/* ── Hold banner ── */}
                    {hasHold && (
                        <div style={{
                            background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)',
                            borderLeft:'4px solid #ef4444', borderRadius:'var(--r)',
                            padding:'1rem 1.25rem', marginBottom:'1.5rem',
                            display:'flex', gap:'12px', alignItems:'flex-start',
                        }}>
                            <FaLock style={{ color:'#ef4444', flexShrink:0, marginTop:'2px', fontSize:'1rem' }} />
                            <div>
                                <div style={{ fontWeight:700, color:'#f87171', marginBottom:'.3rem', fontSize:'.95rem' }}>
                                    Account Hold — Class Registration Suspended
                                </div>
                                <div style={{ fontSize:'.87rem', color:'var(--text-muted)', marginBottom:'.3rem' }}>
                                    <strong>{activeHold.type} Hold</strong> placed by {activeHold.placedBy} on {activeHold.placedDate}.
                                </div>
                                <div style={{ fontSize:'.85rem', color:'var(--text-muted)', marginBottom:'.3rem' }}>
                                    {activeHold.consequence}
                                </div>
                                <div style={{ fontSize:'.82rem', color:'rgba(248,113,113,.7)', fontWeight:600 }}>
                                    You cannot add or drop classes until this hold is resolved. Visit the Bursar's Office or contact{' '}
                                    <span style={{ textDecoration:'underline' }}>{activeHold.placedBy}</span>.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Enrolled Subjects ── */}
                    <div className="d-card" style={{ marginBottom:'1.75rem' }}>
                        <div className="d-card-title">
                            <FaCheckCircle style={{ color:'var(--green-light)' }} />
                            My Enrolled Subjects ({mySubjects.length})
                        </div>
                        {mySubjects.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.93rem', padding:'.5rem 0' }}>
                                No subjects enrolled. Add subjects below.
                            </p>
                        ) : (
                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Subject</th>
                                        <th>Teacher</th>
                                        <th>Credits</th>
                                        <th>Course Page</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mySubjects.map(s => {
                                        const course = getCourse(s.id);
                                        return (
                                            <tr key={s.id}>
                                                <td><span className="tag tag-gold">{s.id}</span></td>
                                                <td style={{ fontWeight:600 }}>{s.name}</td>
                                                <td style={{ color:'var(--text-muted)' }}>{s.teacher}</td>
                                                <td>{s.credits}</td>
                                                <td>
                                                    {course ? (
                                                        <Link to={`/student/courses/${course.id}`}
                                                            style={{ display:'inline-flex', alignItems:'center', gap:'5px',
                                                                color:'var(--gold)', fontWeight:600, fontSize:'.85rem', textDecoration:'none' }}>
                                                            Open <FaArrowRight style={{ fontSize:'.75rem' }} />
                                                        </Link>
                                                    ) : (
                                                        <span style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => toggle(s.id, s.name)}
                                                        disabled={hasHold}
                                                        style={{
                                                            background: hasHold ? 'rgba(255,255,255,.05)' : 'rgba(239,68,68,.12)',
                                                            color: hasHold ? 'var(--text-muted)' : '#fca5a5',
                                                            border: hasHold ? '1px solid rgba(255,255,255,.1)' : '1px solid rgba(239,68,68,.3)',
                                                            borderRadius:'var(--r)', padding:'.3rem .85rem', cursor: hasHold ? 'not-allowed' : 'pointer',
                                                            fontSize:'.82rem', fontWeight:700, display:'flex', alignItems:'center', gap:'5px',
                                                        }}>
                                                        {hasHold && <FaLock style={{ fontSize:'.7rem' }} />} Drop
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── Available Subjects ── */}
                    <div className="d-card" style={{ opacity: hasHold ? .6 : 1 }}>
                        <div className="d-card-title">
                            {hasHold
                                ? <><FaLock style={{ color:'#ef4444' }} /> Registration Locked</>
                                : <><FaPlus style={{ color:'var(--gold)' }} /> Available Subjects</>
                            }
                        </div>
                        {hasHold && (
                            <p style={{ color:'rgba(248,113,113,.8)', fontSize:'.88rem', marginBottom:'1rem', fontWeight:600 }}>
                                <FaExclamationTriangle style={{ marginRight:'6px' }} />
                                Resolve your account hold to register new subjects.
                            </p>
                        )}
                        {available.length === 0 ? (
                            <p style={{ color:'var(--text-muted)', fontSize:'.93rem', padding:'.5rem 0' }}>
                                You are enrolled in all available subjects.
                            </p>
                        ) : (
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
                                {available.map(s => {
                                    const course = getCourse(s.id);
                                    return (
                                        <div key={s.id} style={{
                                            background:'var(--bg-card)', border:'1px solid var(--border)',
                                            borderRadius:'var(--r)', padding:'1.2rem', transition:'var(--t)',
                                        }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.5rem' }}>
                                                <span className="tag tag-gold">{s.id}</span>
                                                <span style={{ fontSize:'.78rem', color:'var(--text-dim)' }}>{s.credits} credits</span>
                                            </div>
                                            <h4 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:'.3rem' }}>{s.name}</h4>
                                            <p style={{ fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.75rem' }}>{s.teacher}</p>
                                            {course && (
                                                <div style={{ fontSize:'.78rem', color:'var(--gold)', marginBottom:'.6rem',
                                                    display:'flex', alignItems:'center', gap:'4px' }}>
                                                    <FaBook style={{ fontSize:'.7rem' }} /> LMS course available
                                                </div>
                                            )}
                                            <button
                                                className="btn btn-primary btn-sm btn-block"
                                                onClick={() => toggle(s.id, s.name)}
                                                disabled={hasHold}
                                                style={{ cursor: hasHold ? 'not-allowed' : 'pointer', opacity: hasHold ? .5 : 1 }}>
                                                {hasHold ? <><FaLock /> Locked</> : <><FaPlus /> Register</>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
