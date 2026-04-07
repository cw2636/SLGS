import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import {
    FaBullhorn, FaBook, FaCalendarAlt, FaVideo, FaLink, FaFilePdf,
    FaTasks, FaClipboardList, FaChevronDown, FaChevronUp, FaExternalLinkAlt,
    FaCheckCircle, FaClock, FaExclamationCircle, FaArrowLeft, FaUsers,
    FaLock, FaPlay, FaThumbtack,
} from 'react-icons/fa';
import { COURSES, MODULES, COURSE_ANNOUNCEMENTS, SUBMISSIONS } from '../../data/mockData';

const ITEM_ICONS = {
    video:      <FaVideo      style={{ color: '#ef4444' }} />,
    link:       <FaLink       style={{ color: '#3b82f6' }} />,
    file:       <FaFilePdf    style={{ color: '#f59e0b' }} />,
    assignment: <FaTasks      style={{ color: '#8b5cf6' }} />,
    exam:       <FaClipboardList style={{ color: '#c9a227' }} />,
};

const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const isPast  = d => new Date(d) < new Date();
const daysLeft= d => {
    const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    return `${diff} day${diff !== 1 ? 's' : ''} left`;
};

export default function StudentCourse() {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [tab, setTab] = useState('home');
    const [openModules, setOpenModules] = useState({});
    const [videoModal, setVideoModal] = useState(null);

    const course = useMemo(() => COURSES.find(c => c.id === courseId), [courseId]);
    const modules = useMemo(() => MODULES.filter(m => m.courseId === courseId && m.published)
        .sort((a, b) => a.order - b.order), [courseId]);
    const announcements = useMemo(() => COURSE_ANNOUNCEMENTS
        .filter(a => a.courseId === courseId)
        .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        }), [courseId]);

    const upcomingItems = useMemo(() => {
        const items = [];
        modules.forEach(m => m.items.filter(i => (i.type === 'assignment' || i.type === 'exam') && i.published)
            .forEach(i => items.push({ ...i, moduleTitle: m.title })));
        return items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [modules]);

    const mySubs = useMemo(() => SUBMISSIONS.filter(s => s.studentId === user?.studentId && s.courseId === courseId), [courseId, user]);

    const getSubForItem = itemId => mySubs.find(s => s.itemId === itemId);

    const toggleModule = id => setOpenModules(p => ({ ...p, [id]: !p[id] }));

    const TAB_STYLE = active => ({
        padding: '.55rem 1.2rem', border: 'none', borderRadius: '999px',
        cursor: 'pointer', fontWeight: 600, fontSize: '.85rem', transition: 'all .2s',
        background: active ? course?.color || '#1a4731' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
    });

    if (!course) return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ textAlign:'center' }}>
                    <FaBook style={{ fontSize:'3rem', color:'var(--text-muted)', marginBottom:'1rem' }} />
                    <h3>Course not found</h3>
                    <Link to="/student/classes" style={{ color:'var(--gold)' }}>← Back to My Classes</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                {/* Course Header Banner */}
                <div style={{ background: course.color, padding: '2rem 2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'35%',
                        background:'rgba(255,255,255,.04)', borderLeft:'1px solid rgba(255,255,255,.08)' }} />
                    <Link to="/student/classes" style={{ color:'rgba(255,255,255,.7)', fontSize:'.85rem', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'.75rem', textDecoration:'none' }}>
                        <FaArrowLeft /> My Classes
                    </Link>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'#fff', margin:'0 0 .3rem' }}>{course.title}</h1>
                    <p style={{ color:'rgba(255,255,255,.75)', fontSize:'.9rem', margin:'0 0 .6rem' }}>{course.code} · {course.form} {course.section} · {course.credits} Credits</p>
                    <p style={{ color:'rgba(255,255,255,.6)', fontSize:'.85rem', margin:0 }}>
                        <FaUsers style={{ marginRight:'6px' }} />{course.teacherName}
                        <span style={{ margin:'0 .75rem', opacity:.4 }}>|</span>
                        <FaCalendarAlt style={{ marginRight:'6px' }} />
                        {course.schedule.map(s => `${s.day} ${s.time}`).join(' · ')}
                    </p>
                </div>

                {/* Tab Bar */}
                <div style={{ borderBottom:'1px solid var(--border)', padding:'.75rem 2rem', display:'flex', gap:'.5rem', background:'var(--bg-card)' }}>
                    {[['home','Home'], ['modules','Modules'], ['announcements','Announcements'], ['grades','My Grades'], ['agenda','Agenda']].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)} style={TAB_STYLE(tab === k)}>{l}</button>
                    ))}
                </div>

                <div className="portal-content">

                    {/* ── HOME ── */}
                    {tab === 'home' && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.5rem', alignItems:'start' }}>
                            <div>
                                {/* Pinned announcements */}
                                {announcements.filter(a => a.pinned).map(a => (
                                    <div key={a.id} className="d-card" style={{ borderLeft:`4px solid ${course.color}`, marginBottom:'1rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'.5rem' }}>
                                            <FaThumbtack style={{ color: course.color, fontSize:'.85rem' }} />
                                            <span style={{ fontWeight:700, fontSize:'.95rem' }}>{a.title}</span>
                                        </div>
                                        <p style={{ color:'var(--text-muted)', fontSize:'.88rem', margin:'0 0 .4rem', lineHeight:1.6 }}>{a.body}</p>
                                        <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{a.author} · {fmtDate(a.date)}</span>
                                    </div>
                                ))}

                                {/* About */}
                                <div className="d-card">
                                    <div className="d-card-title"><FaBook /> About This Course</div>
                                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.7 }}>{course.description}</p>
                                </div>
                            </div>

                            {/* Right column */}
                            <div>
                                {/* Upcoming due dates */}
                                <div className="d-card" style={{ marginBottom:'1rem' }}>
                                    <div className="d-card-title"><FaCalendarAlt style={{ color:'var(--gold)' }} /> Coming Up</div>
                                    {upcomingItems.length === 0
                                        ? <p style={{ color:'var(--text-muted)', fontSize:'.88rem' }}>Nothing due soon.</p>
                                        : upcomingItems.slice(0, 5).map(i => (
                                            <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                                                padding:'.6rem 0', borderBottom:'1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontWeight:600, fontSize:'.88rem' }}>{i.title}</div>
                                                    <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{i.type === 'exam' ? '📋 Exam' : '📝 Assignment'} · {i.points} pts</div>
                                                </div>
                                                <span style={{ fontSize:'.78rem', fontWeight:700,
                                                    color: isPast(i.dueDate) ? '#ef4444' : daysLeft(i.dueDate) === 'Due Today' ? '#f59e0b' : 'var(--green-light)' }}>
                                                    {daysLeft(i.dueDate)}
                                                </span>
                                            </div>
                                        ))
                                    }
                                </div>

                                {/* Schedule */}
                                <div className="d-card">
                                    <div className="d-card-title"><FaCalendarAlt /> Class Schedule</div>
                                    {course.schedule.map((s, i) => (
                                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'.45rem 0',
                                            borderBottom: i < course.schedule.length - 1 ? '1px solid var(--border)' : 'none', fontSize:'.88rem' }}>
                                            <strong>{s.day}</strong>
                                            <span style={{ color:'var(--text-muted)' }}>{s.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MODULES ── */}
                    {tab === 'modules' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>Course Modules</h2>
                            {modules.length === 0
                                ? <div className="d-card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No published modules yet.</div>
                                : modules.map(mod => (
                                    <div key={mod.id} className="d-card" style={{ marginBottom:'1rem', padding:0, overflow:'hidden' }}>
                                        {/* Module header */}
                                        <button onClick={() => toggleModule(mod.id)} style={{
                                            width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
                                            padding:'1rem 1.25rem', border:'none', background:'var(--bg-card)',
                                            cursor:'pointer', color:'var(--text)', borderBottom: openModules[mod.id] ? '1px solid var(--border)' : 'none',
                                        }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: course.color }} />
                                                <span style={{ fontWeight:700, fontSize:'1rem' }}>{mod.title}</span>
                                                <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>
                                                    {mod.items.filter(i => i.published).length} items
                                                </span>
                                            </div>
                                            {openModules[mod.id] ? <FaChevronUp style={{ color:'var(--text-muted)' }} /> : <FaChevronDown style={{ color:'var(--text-muted)' }} />}
                                        </button>

                                        {/* Module items */}
                                        {openModules[mod.id] && mod.items.filter(i => i.published).map((item, idx) => {
                                            const sub = getSubForItem(item.id);
                                            return (
                                                <div key={item.id} style={{
                                                    display:'flex', alignItems:'center', justifyContent:'space-between',
                                                    padding:'.75rem 1.25rem .75rem 2rem',
                                                    borderBottom: idx < mod.items.length - 1 ? '1px solid var(--border)' : 'none',
                                                    background: idx % 2 === 0 ? 'rgba(255,255,255,.015)' : 'transparent',
                                                }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1 }}>
                                                        <span style={{ fontSize:'1rem' }}>{ITEM_ICONS[item.type]}</span>
                                                        <div style={{ flex:1 }}>
                                                            <div style={{ fontWeight:600, fontSize:'.9rem' }}>
                                                                {item.type === 'video' ? (
                                                                    <button onClick={() => setVideoModal(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text)', fontWeight:600, fontSize:'.9rem', padding:0, display:'flex', alignItems:'center', gap:'6px' }}>
                                                                        <FaPlay style={{ fontSize:'.75rem', color:'#ef4444' }} />{item.title}
                                                                    </button>
                                                                ) : item.type === 'link' ? (
                                                                    <a href={item.url} target="_blank" rel="noreferrer" style={{ color:'var(--text)', display:'flex', alignItems:'center', gap:'6px' }}>
                                                                        {item.title} <FaExternalLinkAlt style={{ fontSize:'.7rem', color:'var(--text-muted)' }} />
                                                                    </a>
                                                                ) : item.title}
                                                            </div>
                                                            {(item.type === 'assignment' || item.type === 'exam') && (
                                                                <div style={{ fontSize:'.78rem', color:'var(--text-muted)', marginTop:'2px' }}>
                                                                    Due: {fmtDate(item.dueDate)} · {item.points} pts
                                                                    {item.dueDate && <span style={{ marginLeft:'8px', fontWeight:600,
                                                                        color: isPast(item.dueDate) ? '#ef4444' : '#f59e0b' }}>
                                                                        {daysLeft(item.dueDate)}
                                                                    </span>}
                                                                </div>
                                                            )}
                                                            {item.type === 'video' && <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{item.duration}</div>}
                                                            {item.type === 'file'  && <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{item.size}</div>}
                                                        </div>
                                                    </div>

                                                    {/* Submission status badge */}
                                                    {(item.type === 'assignment' || item.type === 'exam') && (
                                                        sub ? (
                                                            <span style={{
                                                                display:'inline-flex', alignItems:'center', gap:'5px',
                                                                padding:'.25rem .75rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700,
                                                                background: sub.status === 'graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                                                color: sub.status === 'graded' ? 'var(--green-light)' : '#93c5fd',
                                                            }}>
                                                                {sub.status === 'graded' ? <FaCheckCircle /> : <FaClock />}
                                                                {sub.status === 'graded' ? `${sub.grade}/${item.points}` : 'Submitted'}
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                display:'inline-flex', alignItems:'center', gap:'5px',
                                                                padding:'.25rem .75rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700,
                                                                background: isPast(item.dueDate) ? 'rgba(239,68,68,.12)' : 'rgba(201,162,39,.12)',
                                                                color: isPast(item.dueDate) ? '#ef4444' : 'var(--gold)',
                                                            }}>
                                                                {isPast(item.dueDate) ? <><FaExclamationCircle /> Missing</> : <><FaCalendarAlt /> Not Submitted</>}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* ── ANNOUNCEMENTS ── */}
                    {tab === 'announcements' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>Course Announcements</h2>
                            {announcements.length === 0
                                ? <div className="d-card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No announcements yet.</div>
                                : announcements.map(a => (
                                    <div key={a.id} className="d-card" style={{ marginBottom:'1rem', borderLeft: a.pinned ? `4px solid ${course.color}` : '4px solid transparent' }}>
                                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.5rem' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                                {a.pinned && <FaThumbtack style={{ color: course.color, fontSize:'.8rem', flexShrink:0 }} />}
                                                <span style={{ fontWeight:700, fontSize:'1rem' }}>{a.title}</span>
                                            </div>
                                            <span style={{ fontSize:'.78rem', color:'var(--text-muted)', whiteSpace:'nowrap', marginLeft:'1rem' }}>{fmtDate(a.date)}</span>
                                        </div>
                                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.7, margin:'0 0 .6rem' }}>{a.body}</p>
                                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: course.color,
                                                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'.75rem' }}>
                                                {a.author.split(' ').map(w => w[0]).join('').slice(0,2)}
                                            </div>
                                            <span style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>{a.author}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* ── GRADES ── */}
                    {tab === 'grades' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>My Grades</h2>
                            <div className="d-card">
                                {mySubs.length === 0
                                    ? <p style={{ color:'var(--text-muted)', fontSize:'.9rem', textAlign:'center', padding:'1.5rem 0' }}>No graded work yet.</p>
                                    : (
                                        <table className="portal-table">
                                            <thead><tr><th>Assignment</th><th>Submitted</th><th>Status</th><th>Grade</th><th>Feedback</th></tr></thead>
                                            <tbody>
                                                {mySubs.map(s => {
                                                    const allItems = modules.flatMap(m => m.items);
                                                    const item = allItems.find(i => i.id === s.itemId);
                                                    return (
                                                        <tr key={s.id}>
                                                            <td style={{ fontWeight:600 }}>{item?.title || s.itemId}</td>
                                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{s.submittedAt}</td>
                                                            <td>
                                                                <span style={{
                                                                    padding:'.2rem .7rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700,
                                                                    background: s.status === 'graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                                                    color: s.status === 'graded' ? 'var(--green-light)' : '#93c5fd',
                                                                }}>{s.status}</span>
                                                            </td>
                                                            <td style={{ fontWeight:700 }}>
                                                                {s.grade !== null ? `${s.grade} / ${item?.points || '?'}` : '—'}
                                                            </td>
                                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{s.feedback || '—'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )
                                }
                            </div>
                        </div>
                    )}

                    {/* ── AGENDA ── */}
                    {tab === 'agenda' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>Course Agenda</h2>
                            <div style={{ display:'grid', gap:'.75rem' }}>
                                {upcomingItems.map(i => (
                                    <div key={i.id} className="d-card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                            {ITEM_ICONS[i.type]}
                                            <div>
                                                <div style={{ fontWeight:600, fontSize:'.92rem' }}>{i.title}</div>
                                                <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>{i.moduleTitle} · {i.points} pts</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign:'right' }}>
                                            <div style={{ fontWeight:700, fontSize:'.88rem', color: isPast(i.dueDate) ? '#ef4444' : 'var(--gold)' }}>
                                                {daysLeft(i.dueDate)}
                                            </div>
                                            <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{fmtDate(i.dueDate)}</div>
                                        </div>
                                    </div>
                                ))}
                                {upcomingItems.length === 0 && (
                                    <div className="d-card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
                                        <FaCalendarAlt style={{ fontSize:'2rem', marginBottom:'.5rem' }} />
                                        <p>No upcoming assignments or exams.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Video Modal */}
            {videoModal && (
                <div onClick={() => setVideoModal(null)} style={{
                    position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:999,
                    display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                    <div onClick={e => e.stopPropagation()} style={{ width:'min(820px, 95vw)', background:'var(--bg-card)', borderRadius:'var(--r)', overflow:'hidden', boxShadow:'var(--sh-lg)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                            <span style={{ fontWeight:700 }}>{videoModal.title}</span>
                            <button onClick={() => setVideoModal(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
                        </div>
                        <div style={{ aspectRatio:'16/9' }}>
                            <iframe
                                src={videoModal.url}
                                title={videoModal.title}
                                width="100%"
                                height="100%"
                                style={{ border:'none', display:'block' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
