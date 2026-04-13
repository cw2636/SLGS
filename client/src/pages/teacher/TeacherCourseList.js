import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBook, FaCalendarAlt, FaUsers, FaArrowRight, FaBullhorn } from 'react-icons/fa';
import { COURSES, MODULES, COURSE_ANNOUNCEMENTS, SUBMISSIONS } from '../../data/mockData';

export default function TeacherCourseList() {
    const { user } = useAuth();
    const myCourses = COURSES.filter(c => c.teacherId === user?.staffId);

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">My Courses</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" />{myCourses.length} courses</div>
                    </div>
                </div>
                <div className="portal-content">
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:'.3rem' }}>Course Management</h2>
                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', marginBottom:'2rem' }}>
                        {user?.name} · {user?.subject} · Academic Year 2025/2026
                    </p>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
                        {myCourses.map(c => {
                            const modCount = MODULES.filter(m => m.courseId === c.id).length;
                            const annCount = COURSE_ANNOUNCEMENTS.filter(a => a.courseId === c.id).length;
                            const subCount = SUBMISSIONS.filter(s => s.courseId === c.id).length;
                            return (
                                <Link key={c.id} to={`/teacher/courses/${c.id}`} style={{ textDecoration:'none' }}>
                                    <div className="d-card" style={{ padding:0, overflow:'hidden', transition:'transform .2s, box-shadow .2s', cursor:'pointer' }}
                                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--sh-md)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=''; }}>
                                        <div style={{ background: c.color, padding:'1.25rem 1.25rem .9rem', position:'relative' }}>
                                            <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'40%',
                                                background:'rgba(255,255,255,.05)', borderLeft:'1px solid rgba(255,255,255,.09)' }} />
                                            <div style={{ fontSize:'.78rem', color:'rgba(255,255,255,.65)', marginBottom:'.4rem', fontWeight:600 }}>{c.code}</div>
                                            <h3 style={{ color:'#fff', margin:0, fontFamily:"'Playfair Display',serif", fontSize:'1.15rem' }}>{c.title}</h3>
                                            <p style={{ color:'rgba(255,255,255,.65)', fontSize:'.8rem', margin:'.4rem 0 0' }}>{c.form} {c.section}</p>
                                        </div>
                                        <div style={{ padding:'1rem 1.25rem' }}>
                                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.5rem', marginBottom:'1rem' }}>
                                                {[
                                                    [<FaBook />, modCount, 'Modules'],
                                                    [<FaBullhorn />, annCount, 'Announcements'],
                                                    [<FaUsers />, subCount, 'Submissions'],
                                                ].map(([icon, val, label]) => (
                                                    <div key={label} style={{ textAlign:'center', padding:'.6rem .4rem',
                                                        background:'var(--bg)', borderRadius:'var(--r)' }}>
                                                        <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)' }}>{val}</div>
                                                        <div style={{ fontSize:'.72rem', color:'var(--text-muted)', marginTop:'2px' }}>{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.9rem', display:'flex', alignItems:'center', gap:'6px' }}>
                                                <FaCalendarAlt /> {c.schedule.map(s => s.day).join(' · ')}
                                            </div>
                                            <div style={{ display:'flex', justifyContent:'flex-end', color: c.color, fontSize:'.83rem', fontWeight:700, alignItems:'center', gap:'5px' }}>
                                                Manage Course <FaArrowRight />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                        {myCourses.length === 0 && (
                            <div className="d-card" style={{ gridColumn:'1/-1', textAlign:'center', padding:'2.5rem', color:'var(--text-muted)' }}>
                                <FaBook style={{ fontSize:'2.5rem', marginBottom:'1rem' }} />
                                <p>No courses assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
