import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBook, FaCalendarAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import { COURSES, MODULES, SUBMISSIONS } from '../../data/mockData';

export default function StudentCourseList() {
    const { user } = useAuth();

    // Student sees courses for their form + section
    const myCourses = COURSES.filter(c => c.form === user?.form);

    const getProgress = (courseId) => {
        const mods  = MODULES.filter(m => m.courseId === courseId && m.published);
        const total = mods.flatMap(m => m.items.filter(i => (i.type === 'assignment' || i.type === 'exam') && i.published)).length;
        const done  = SUBMISSIONS.filter(s => s.studentId === user?.studentId && s.courseId === courseId).length;
        return total === 0 ? 0 : Math.round((done / total) * 100);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">My Courses</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" />{myCourses.length} enrolled</div>
                    </div>
                </div>
                <div className="portal-content">
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.3rem' }}>Course Dashboard</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', marginBottom:'2rem' }}>
                        {user?.form} · {user?.classSection} · Academic Year 2025/2026
                    </p>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
                        {myCourses.map(c => {
                            const pct = getProgress(c.id);
                            const modCount = MODULES.filter(m => m.courseId === c.id && m.published).length;
                            return (
                                <Link key={c.id} to={`/student/courses/${c.id}`} style={{ textDecoration:'none' }}>
                                    <div className="d-card" style={{ padding:0, overflow:'hidden', transition:'transform .2s, box-shadow .2s', cursor:'pointer' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--sh-md)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}>
                                        {/* Colour header */}
                                        <div style={{ background: c.color, padding:'1.25rem 1.25rem .9rem', position:'relative' }}>
                                            <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%',
                                                background:'rgba(255,255,255,.05)', borderLeft:'1px solid rgba(255,255,255,.09)' }} />
                                            <div style={{ fontSize:'.78rem', color:'rgba(255,255,255,.65)', marginBottom:'.4rem', fontWeight:600 }}>{c.code}</div>
                                            <h3 style={{ color:'#fff', margin:0, fontFamily:"'Playfair Display',serif", fontSize:'1.15rem' }}>{c.title}</h3>
                                        </div>
                                        {/* Body */}
                                        <div style={{ padding:'1rem 1.25rem' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--text-muted)', fontSize:'.83rem', marginBottom:'.75rem' }}>
                                                <FaUsers /> {c.teacherName}
                                            </div>
                                            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--text-muted)', fontSize:'.83rem', marginBottom:'1rem' }}>
                                                <FaBook /> {modCount} module{modCount !== 1 ? 's' : ''}
                                                <span style={{ margin:'0 .4rem', opacity:.4 }}>·</span>
                                                <FaCalendarAlt /> {c.schedule.length} sessions/week
                                            </div>
                                            {/* Progress bar */}
                                            <div>
                                                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', marginBottom:'.3rem' }}>
                                                    <span style={{ color:'var(--text-muted)' }}>Submissions</span>
                                                    <span style={{ fontWeight:700, color: pct === 100 ? 'var(--green-light)' : 'var(--gold)' }}>{pct}%</span>
                                                </div>
                                                <div style={{ height:'5px', borderRadius:'999px', background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
                                                    <div style={{ height:'100%', width:`${pct}%`, background: c.color, borderRadius:'999px', transition:'width .6s' }} />
                                                </div>
                                            </div>
                                            <div style={{ marginTop:'1rem', display:'flex', justifyContent:'flex-end', color: c.color, fontSize:'.83rem', fontWeight:700, alignItems:'center', gap:'5px' }}>
                                                Open Course <FaArrowRight />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
