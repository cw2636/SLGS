import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome, FaBook, FaBullhorn, FaTasks, FaComments, FaGraduationCap,
    FaUsers, FaCalendarAlt, FaArrowLeft, FaBars, FaTimes,
    FaVideo, FaLink, FaFilePdf, FaClipboardList, FaPlay,
    FaChevronDown, FaChevronUp, FaExternalLinkAlt,
    FaCheckCircle, FaClock, FaExclamationCircle, FaThumbtack,
    FaReply, FaChalkboardTeacher, FaPaperPlane, FaUpload, FaFileAlt,
} from 'react-icons/fa';
import { COURSES, MODULES, COURSE_ANNOUNCEMENTS, SUBMISSIONS, DISCUSSIONS, ASSIGNMENT_DETAILS } from '../../data/mockData';

// ── Helpers ──────────────────────────────────────────────────
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const isPast  = d => new Date(d) < new Date();
const daysLeft = d => {
    const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    return `${diff} day${diff !== 1 ? 's' : ''} left`;
};
const ITEM_ICONS = {
    video: <FaVideo style={{ color: '#ef4444' }} />,
    link:  <FaLink  style={{ color: '#3b82f6' }} />,
    file:  <FaFilePdf style={{ color: '#f59e0b' }} />,
    assignment: <FaTasks style={{ color: '#8b5cf6' }} />,
    exam:  <FaClipboardList style={{ color: '#c9a227' }} />,
};

const Avatar = ({ initials, color, size = 36 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', background: color || '#1a4731',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
        letterSpacing: '.03em',
    }}>{initials}</div>
);

export default function StudentCourse() {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [page, setPage]           = useState('home');
    const [sidebarOpen, setSidebar] = useState(false);
    const [openModules, setOpenMods] = useState({});
    const [videoModal, setVideoModal] = useState(null);
    const [activeDisc, setActiveDisc] = useState(null);   // discussion id
    const [replyText, setReplyText]   = useState({});     // discId|replyId → text
    const [localDiscs, setLocalDiscs] = useState(null);   // patched after post
    const [activeAssignment, setActiveAssignment] = useState(null);  // item object
    const [prevPage, setPrevPage]   = useState('assignments');
    const [subForms, setSubForms]   = useState({});  // itemId → {mode, text, fileName}
    const [localSubs, setLocalSubs] = useState([]);  // in-session submissions

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
    const baseDiscs = useMemo(() => DISCUSSIONS.filter(d => d.courseId === courseId), [courseId]);
    const discussions = localDiscs !== null ? localDiscs : baseDiscs;

    const mySubs = useMemo(() => [...SUBMISSIONS, ...localSubs].filter(s => s.studentId === user?.studentId && s.courseId === courseId), [courseId, user, localSubs]);
    const allItems = useMemo(() => modules.flatMap(m => m.items.filter(i => i.published)), [modules]);
    const upcoming = useMemo(() => allItems.filter(i => i.type === 'assignment' || i.type === 'exam')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)), [allItems]);
    const getSubForItem = itemId => mySubs.find(s => s.itemId === itemId);

    // Discussion reply
    const postReply = (discId, parentReplyId = null) => {
        const key = parentReplyId ? `${discId}_${parentReplyId}` : discId;
        const text = (replyText[key] || '').trim();
        if (!text) return;
        const newReply = {
            id: `r_${Date.now()}`, author: user?.name || 'Student',
            authorId: user?.studentId, role: 'student',
            avatar: (user?.name || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            date: 'Just now', body: text, replies: [],
        };
        setLocalDiscs(prev => {
            const discs = prev || baseDiscs;
            return discs.map(d => {
                if (d.id !== discId) return d;
                if (!parentReplyId) return { ...d, replies: [...d.replies, newReply] };
                return {
                    ...d, replies: d.replies.map(r =>
                        r.id === parentReplyId ? { ...r, replies: [...(r.replies || []), newReply] } : r
                    ),
                };
            });
        });
        setReplyText(p => ({ ...p, [key]: '' }));
    };

    const submitAssignment = itemId => {
        const form = subForms[itemId] || { mode: 'text', text: '', fileName: '' };
        const content = form.mode === 'text' ? form.text : form.fileName;
        if (!content.trim()) return;
        const newSub = {
            id: `sub_${Date.now()}`, itemId, courseId,
            studentId: user?.studentId, studentName: user?.name,
            submittedAt: new Date().toLocaleString(), status: 'submitted',
            grade: null, feedback: '',
            textContent: form.mode === 'text' ? form.text : '',
            filePath:    form.mode === 'file' ? form.fileName : '',
        };
        setLocalSubs(p => [...p.filter(s => s.itemId !== itemId), newSub]);
    };

    // ── Course colour used throughout ─────────────────────────
    const CC = course?.color || '#1a4731';

    const NAV = [
        { id: 'home',          label: 'Home',          icon: <FaHome /> },
        { id: 'modules',       label: 'Modules',        icon: <FaBook /> },
        { id: 'announcements', label: 'Announcements',  icon: <FaBullhorn /> },
        { id: 'discussions',   label: 'Discussions',    icon: <FaComments /> },
        { id: 'assignments',   label: 'Assignments',    icon: <FaTasks /> },
        { id: 'grades',        label: 'Grades',         icon: <FaGraduationCap /> },
        { id: 'people',        label: 'People',         icon: <FaUsers /> },
    ];

    if (!course) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:'1rem' }}>
            <FaBook style={{ fontSize:'3rem', color:'var(--text-muted)' }} />
            <h3 style={{ color:'var(--text)' }}>Course not found</h3>
            <Link to="/student/courses" style={{ color:'var(--gold)' }}>← Back to Courses</Link>
        </div>
    );

    // ── Sidebar component ─────────────────────────────────────
    const Sidebar = () => (
        <aside style={{
            width: 220, flexShrink: 0, background: '#1c1c1e', borderRight: '1px solid rgba(255,255,255,.08)',
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            position: 'sticky', top: 0, overflowY: 'auto',
        }}>
            {/* Course title in sidebar */}
            <div style={{ padding: '1.1rem 1rem .9rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.45)', fontWeight: 600, letterSpacing: '.08em', textTransform:'uppercase', marginBottom:'.3rem' }}>Course</div>
                <div style={{ fontSize: '.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{course.title}</div>
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', marginTop:'.25rem' }}>{course.code} · {course.form}</div>
            </div>

            {/* Nav links */}
            <nav style={{ padding: '.5rem 0', flex: 1 }}>
                {NAV.map(n => (
                    <button key={n.id} onClick={() => { setPage(n.id); setActiveDisc(null); setActiveAssignment(null); setSidebar(false); }} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '.65rem 1.1rem', border: 'none', background: page === n.id ? CC : 'transparent',
                        color: page === n.id ? '#fff' : 'rgba(255,255,255,.65)',
                        cursor: 'pointer', fontSize: '.88rem', fontWeight: page === n.id ? 700 : 500,
                        textAlign: 'left', transition: 'background .15s, color .15s',
                        borderLeft: page === n.id ? `3px solid rgba(255,255,255,.3)` : '3px solid transparent',
                    }}>
                        <span style={{ fontSize: '.9rem', flexShrink: 0, opacity: page === n.id ? 1 : .7 }}>{n.icon}</span>
                        {n.label}
                    </button>
                ))}
            </nav>

            {/* Back link */}
            <div style={{ padding: '.75rem 1rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                <Link to="/student/courses" style={{ display:'flex', alignItems:'center', gap:'7px', color:'rgba(255,255,255,.5)', fontSize:'.82rem', textDecoration:'none' }}>
                    <FaArrowLeft /> All Courses
                </Link>
            </div>
        </aside>
    );

    // ── Top bar ───────────────────────────────────────────────
    const TopBar = ({ title }) => (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '.75rem 1.5rem', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)', flexShrink: 0,
        }}>
            <button onClick={() => setSidebar(s => !s)} style={{ display:'none', background:'none', border:'none', color:'var(--text)', cursor:'pointer', fontSize:'1.1rem' }}>
                <FaBars />
            </button>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.15rem' }}>
                    <Link to="/student/courses" style={{ color:'var(--text-muted)', textDecoration:'none' }}>My Courses</Link>
                    <span style={{ margin:'0 .4rem' }}>›</span>
                    <span style={{ color:'var(--text)' }}>{course.title}</span>
                    {title && <><span style={{ margin:'0 .4rem' }}>›</span><span style={{ color:'var(--text-muted)' }}>{title}</span></>}
                </div>
            </div>
        </div>
    );

    // ── HOME PAGE ─────────────────────────────────────────────
    const HomePage = () => (
        <>
            <TopBar />
            {/* Course banner */}
            <div style={{ background: CC, padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,.15) 0%, transparent 60%)' }} />
                <div style={{ position:'relative' }}>
                    <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.65)', marginBottom: '.5rem', fontWeight: 600, letterSpacing:'.06em' }}>
                        {course.code} · {course.form} {course.section}
                    </div>
                    <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#fff', margin: '0 0 .6rem', lineHeight:1.2 }}>
                        {course.title}
                    </h1>
                    <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
                        <span><FaChalkboardTeacher style={{ marginRight:'6px' }} />{course.teacherName}</span>
                        <span><FaCalendarAlt style={{ marginRight:'6px' }} />{course.schedule.map(s => `${s.day} ${s.time}`).join(' · ')}</span>
                        <span>{course.credits} Credits</span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: pinned announcements + about */}
                <div>
                    {announcements.filter(a => a.pinned).map(a => (
                        <div key={a.id} style={{ background:'var(--bg-card)', border:`1px solid var(--border)`, borderLeft:`4px solid ${CC}`,
                            borderRadius:'var(--r)', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
                            <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'.5rem' }}>
                                <FaThumbtack style={{ color: CC, fontSize:'.8rem' }} />
                                <span style={{ fontWeight:700, fontSize:'.95rem' }}>{a.title}</span>
                            </div>
                            <p style={{ color:'var(--text-muted)', fontSize:'.88rem', lineHeight:1.7, margin:'0 0 .4rem' }}>{a.body}</p>
                            <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{a.author} · {fmtDate(a.date)}</span>
                        </div>
                    ))}
                    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                        <div style={{ fontWeight:700, fontSize:'.95rem', marginBottom:'.6rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <FaBook style={{ color:CC }} /> About This Course
                        </div>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.75, margin:0 }}>{course.description}</p>
                    </div>
                </div>

                {/* Right: upcoming */}
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                        <div style={{ fontWeight:700, fontSize:'.88rem', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'8px' }}>
                            <FaCalendarAlt style={{ color:'var(--gold)' }} /> Coming Up
                        </div>
                        {upcoming.length === 0
                            ? <p style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>Nothing due soon.</p>
                            : upcoming.slice(0, 5).map(i => (
                                <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                                    padding:'.55rem 0', borderBottom:'1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight:600, fontSize:'.85rem' }}>{i.title}</div>
                                        <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>
                                            {i.type === 'exam' ? '📋 Exam' : '📝 Assignment'} · {i.points} pts
                                        </div>
                                    </div>
                                    <span style={{ fontSize:'.75rem', fontWeight:700, whiteSpace:'nowrap', marginLeft:'.5rem',
                                        color: isPast(i.dueDate) ? '#ef4444' : daysLeft(i.dueDate)==='Due Today' ? '#f59e0b' : 'var(--green-light)' }}>
                                        {daysLeft(i.dueDate)}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                        <div style={{ fontWeight:700, fontSize:'.88rem', marginBottom:'.75rem' }}>Schedule</div>
                        {course.schedule.map((s, i) => (
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'.4rem 0',
                                borderBottom: i < course.schedule.length-1 ? '1px solid var(--border)' : 'none', fontSize:'.85rem' }}>
                                <strong>{s.day}</strong>
                                <span style={{ color:'var(--text-muted)' }}>{s.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    // ── MODULES PAGE ──────────────────────────────────────────
    const ModulesPage = () => (
        <>
            <TopBar title="Modules" />
            <div style={{ padding:'1.5rem 2rem' }}>
                {modules.length === 0
                    ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No modules published yet.</div>
                    : modules.map(mod => (
                        <div key={mod.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
                            borderRadius:'var(--r)', marginBottom:'1rem', overflow:'hidden' }}>
                            <button onClick={() => setOpenMods(p => ({ ...p, [mod.id]: !p[mod.id] }))} style={{
                                width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
                                padding:'1rem 1.25rem', border:'none', background: openModules[mod.id] ? `${CC}18` : 'transparent',
                                cursor:'pointer', color:'var(--text)', borderBottom: openModules[mod.id] ? '1px solid var(--border)' : 'none',
                            }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                    <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:CC, flexShrink:0 }} />
                                    <span style={{ fontWeight:700, fontSize:'1rem' }}>{mod.title}</span>
                                    <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>
                                        {mod.items.filter(i=>i.published).length} items
                                    </span>
                                </div>
                                {openModules[mod.id] ? <FaChevronUp style={{ color:'var(--text-muted)' }} /> : <FaChevronDown style={{ color:'var(--text-muted)' }} />}
                            </button>

                            {openModules[mod.id] && mod.items.filter(i=>i.published).map((item, idx) => {
                                const sub = getSubForItem(item.id);
                                return (
                                    <div key={item.id}
                                        onClick={(item.type==='assignment'||item.type==='exam') ? () => { setActiveAssignment(item); setPrevPage('modules'); } : undefined}
                                        style={{
                                            display:'flex', alignItems:'center', justifyContent:'space-between',
                                            padding:'.7rem 1.25rem .7rem 2.5rem',
                                            borderBottom: idx < mod.items.length-1 ? '1px solid var(--border)' : 'none',
                                            background: idx%2===0 ? 'rgba(255,255,255,.012)' : 'transparent',
                                            cursor: (item.type==='assignment'||item.type==='exam') ? 'pointer' : 'default',
                                        }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'10px', flex:1 }}>
                                            <span>{ITEM_ICONS[item.type]}</span>
                                            <div style={{ flex:1 }}>
                                                <div style={{ fontWeight:600, fontSize:'.88rem' }}>
                                                    {item.type === 'video' ? (
                                                        <button onClick={() => setVideoModal(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text)', fontWeight:600, fontSize:'.88rem', padding:0, display:'flex', alignItems:'center', gap:'6px' }}>
                                                            <FaPlay style={{ fontSize:'.7rem', color:'#ef4444' }} />{item.title}
                                                        </button>
                                                    ) : item.type==='link' ? (
                                                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color:'var(--text)', display:'flex', alignItems:'center', gap:'5px' }}>
                                                            {item.title} <FaExternalLinkAlt style={{ fontSize:'.65rem', color:'var(--text-muted)' }} />
                                                        </a>
                                                    ) : item.title}
                                                </div>
                                                {(item.type==='assignment'||item.type==='exam') && (
                                                    <div style={{ fontSize:'.75rem', color:'var(--text-muted)', marginTop:'2px' }}>
                                                        Due {fmtDate(item.dueDate)} · {item.points} pts
                                                        <span style={{ marginLeft:'8px', fontWeight:700,
                                                            color: isPast(item.dueDate) ? '#ef4444' : '#f59e0b' }}>
                                                            {daysLeft(item.dueDate)}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.type==='video' && <div style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{item.duration}</div>}
                                            </div>
                                        </div>
                                        {(item.type==='assignment'||item.type==='exam') && (
                                            sub ? (
                                                <span style={{ padding:'.22rem .7rem', borderRadius:'999px', fontSize:'.76rem', fontWeight:700,
                                                    background: sub.status==='graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                                    color: sub.status==='graded' ? 'var(--green-light)' : '#93c5fd', display:'flex', alignItems:'center', gap:'4px' }}>
                                                    {sub.status==='graded' ? <FaCheckCircle /> : <FaClock />}
                                                    {sub.status==='graded' ? `${sub.grade}/${item.points}` : 'Submitted'}
                                                </span>
                                            ) : (
                                                <span style={{ padding:'.22rem .7rem', borderRadius:'999px', fontSize:'.76rem', fontWeight:700,
                                                    background: isPast(item.dueDate) ? 'rgba(239,68,68,.12)' : 'rgba(201,162,39,.12)',
                                                    color: isPast(item.dueDate) ? '#ef4444' : 'var(--gold)', display:'flex', alignItems:'center', gap:'4px' }}>
                                                    {isPast(item.dueDate) ? <><FaExclamationCircle /> Missing</> : <>Not Submitted</>}
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
        </>
    );

    // ── ANNOUNCEMENTS PAGE ────────────────────────────────────
    const AnnouncementsPage = () => (
        <>
            <TopBar title="Announcements" />
            <div style={{ padding:'1.5rem 2rem', maxWidth:'860px' }}>
                {announcements.length === 0
                    ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No announcements yet.</div>
                    : announcements.map(a => (
                        <div key={a.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
                            borderLeft: a.pinned ? `4px solid ${CC}` : '4px solid transparent',
                            borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1rem' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.6rem' }}>
                                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                                    {a.pinned && <FaThumbtack style={{ color:CC, fontSize:'.8rem' }} />}
                                    <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{a.title}</span>
                                </div>
                                <span style={{ fontSize:'.78rem', color:'var(--text-muted)', whiteSpace:'nowrap', marginLeft:'1rem' }}>{fmtDate(a.date)}</span>
                            </div>
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.75, margin:'0 0 .8rem', whiteSpace:'pre-line' }}>{a.body}</p>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <Avatar initials={a.author.split(' ').map(w=>w[0]).join('').slice(0,2)} color={CC} size={28} />
                                <span style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>{a.author}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    );

    // ── DISCUSSIONS PAGE ──────────────────────────────────────
    const DiscussionsPage = () => {
        // Thread view
        if (activeDisc) {
            const disc = discussions.find(d => d.id === activeDisc);
            if (!disc) return null;
            const ROLE_COLORS = { teacher: CC, student: '#475569' };

            const ReplyBlock = ({ r, discId, depth = 0 }) => (
                <div style={{ marginLeft: depth > 0 ? '48px' : 0 }}>
                    <div style={{ display:'flex', gap:'12px', padding:'1rem 0', borderBottom:'1px solid var(--border)' }}>
                        <Avatar initials={r.avatar} color={ROLE_COLORS[r.role] || '#555'} size={38} />
                        <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'.35rem', flexWrap:'wrap' }}>
                                <span style={{ fontWeight:700, fontSize:'.9rem' }}>{r.author}</span>
                                {r.role==='teacher' && (
                                    <span style={{ fontSize:'.72rem', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                                        padding:'.15rem .55rem', borderRadius:'999px', fontWeight:700 }}>TEACHER</span>
                                )}
                                <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{r.date}</span>
                            </div>
                            <div style={{ color:'var(--text)', fontSize:'.9rem', lineHeight:1.75, whiteSpace:'pre-line', marginBottom:'.6rem' }}>{r.body}</div>
                            <button onClick={() => setReplyText(p => ({ ...p, [`${discId}_${r.id}`]: p[`${discId}_${r.id}`] === undefined ? '' : undefined }))}
                                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'.82rem', display:'flex', alignItems:'center', gap:'5px', padding:0 }}>
                                <FaReply /> Reply
                            </button>
                            {replyText[`${discId}_${r.id}`] !== undefined && (
                                <div style={{ marginTop:'.75rem', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                                    <Avatar initials={(user?.name||'S').split(' ').map(w=>w[0]).join('').slice(0,2)} color={CC} size={30} />
                                    <div style={{ flex:1 }}>
                                        <textarea value={replyText[`${discId}_${r.id}`] || ''}
                                            onChange={e => setReplyText(p => ({ ...p, [`${discId}_${r.id}`]: e.target.value }))}
                                            placeholder="Write a reply…" rows={3}
                                            style={{ width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                                padding:'.6rem .9rem', color:'var(--text)', fontSize:'.88rem', resize:'vertical', boxSizing:'border-box' }} />
                                        <button onClick={() => postReply(discId, r.id)} style={{
                                            marginTop:'.4rem', padding:'.45rem 1rem', borderRadius:'var(--r)',
                                            background: CC, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'.82rem',
                                            display:'flex', alignItems:'center', gap:'6px' }}>
                                            <FaPaperPlane /> Post Reply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {(r.replies || []).map(rr => <ReplyBlock key={rr.id} r={rr} discId={discId} depth={depth+1} />)}
                </div>
            );

            return (
                <>
                    <TopBar title="Discussions" />
                    {/* Thread top bar */}
                    <div style={{ padding:'.7rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', gap:'1rem', alignItems:'center', background:'var(--bg-card)', flexShrink:0 }}>
                        <button onClick={() => setActiveDisc(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)',
                            color:'var(--text-muted)', cursor:'pointer', padding:'.35rem .8rem', fontSize:'.82rem', display:'flex', alignItems:'center', gap:'6px' }}>
                            <FaArrowLeft /> All Discussions
                        </button>
                        <span style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>All Sections Available through {fmtDate(disc.dueDate)}</span>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:0, flex:1, overflow:'hidden' }}>
                        {/* Thread list */}
                        <div style={{ padding:'1.25rem 1.5rem', overflowY:'auto', borderRight:'1px solid var(--border)' }}>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', marginBottom:'.4rem' }}>{disc.title}</h2>
                            <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'1.25rem' }}>
                                Due {fmtDate(disc.dueDate)} · {disc.replies.length} {disc.replies.length === 1 ? 'entry' : 'entries'}
                            </div>

                            {/* Prompt (teacher's post) */}
                            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderLeft:`4px solid ${CC}`, borderRadius:'var(--r)',
                                padding:'1.25rem', marginBottom:'1.5rem' }}>
                                <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'.6rem' }}>
                                    <Avatar initials={course.teacherName.split(' ').map(w=>w[0]).join('').slice(0,2)} color={CC} size={36} />
                                    <div>
                                        <span style={{ fontWeight:700, fontSize:'.9rem' }}>{course.teacherName}</span>
                                        <span style={{ fontSize:'.72rem', background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.65)',
                                            padding:'.12rem .5rem', borderRadius:'999px', fontWeight:700, marginLeft:'8px' }}>AUTHOR | TEACHER</span>
                                    </div>
                                </div>
                                <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.75, whiteSpace:'pre-line', margin:0 }}>{disc.prompt}</p>
                            </div>

                            {/* Replies */}
                            {disc.replies.map(r => <ReplyBlock key={r.id} r={r} discId={disc.id} />)}

                            {/* Reply box */}
                            <div style={{ marginTop:'1.5rem', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                                <Avatar initials={(user?.name||'S').split(' ').map(w=>w[0]).join('').slice(0,2)} color={CC} size={38} />
                                <div style={{ flex:1 }}>
                                    <textarea value={replyText[disc.id] || ''}
                                        onChange={e => setReplyText(p => ({ ...p, [disc.id]: e.target.value }))}
                                        placeholder="Add your reply to the discussion…" rows={5}
                                        style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                            padding:'.75rem 1rem', color:'var(--text)', fontSize:'.9rem', resize:'vertical', boxSizing:'border-box' }} />
                                    <button onClick={() => postReply(disc.id)} style={{
                                        marginTop:'.5rem', padding:'.55rem 1.25rem', borderRadius:'var(--r)',
                                        background: CC, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'.88rem',
                                        display:'flex', alignItems:'center', gap:'8px' }}>
                                        <FaPaperPlane /> Post Reply
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right rail — sort/filter */}
                        <div style={{ padding:'1rem', overflowY:'auto' }}>
                            <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.6rem', textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Filter
                            </div>
                            {['All','Unread','My Posts'].map(f => (
                                <button key={f} style={{ display:'block', width:'100%', textAlign:'left', padding:'.45rem .75rem',
                                    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                    color:'var(--text)', cursor:'pointer', fontSize:'.85rem', marginBottom:'.4rem' }}>{f}</button>
                            ))}
                            <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--text-muted)', margin:'1rem 0 .6rem', textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Sort By
                            </div>
                            {['Oldest First','Newest First','Most Activity'].map(f => (
                                <button key={f} style={{ display:'block', width:'100%', textAlign:'left', padding:'.45rem .75rem',
                                    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                    color:'var(--text)', cursor:'pointer', fontSize:'.85rem', marginBottom:'.4rem' }}>{f}</button>
                            ))}
                        </div>
                    </div>
                </>
            );
        }

        // Discussion list view
        return (
            <>
                <TopBar title="Discussions" />
                <div style={{ padding:'1.5rem 2rem', maxWidth:'860px' }}>
                    {discussions.length === 0
                        ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No discussions yet for this course.</div>
                        : discussions.map(d => (
                            <button key={d.id} onClick={() => setActiveDisc(d.id)} style={{
                                width:'100%', textAlign:'left', background:'var(--bg-card)', border:'1px solid var(--border)',
                                borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1rem', cursor:'pointer', color:'var(--text)',
                                transition:'border-color .2s, box-shadow .2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = CC; e.currentTarget.style.boxShadow = `0 0 0 2px ${CC}22`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.4rem', flexWrap:'wrap', gap:'.5rem' }}>
                                    <span style={{ fontWeight:700, fontSize:'1rem' }}>{d.title}</span>
                                    <span style={{ fontSize:'.8rem', background:'rgba(255,255,255,.06)', padding:'.2rem .7rem', borderRadius:'999px', color:'var(--text-muted)' }}>
                                        {d.replies.length} {d.replies.length===1 ? 'reply' : 'replies'}
                                    </span>
                                </div>
                                <p style={{ color:'var(--text-muted)', fontSize:'.85rem', margin:'0 0 .6rem', lineHeight:1.5,
                                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                    {d.prompt.replace(/\n/g,' ')}
                                </p>
                                <div style={{ display:'flex', gap:'1rem', fontSize:'.78rem', color:'var(--text-muted)' }}>
                                    <span><FaCalendarAlt style={{ marginRight:'4px' }} />Due {fmtDate(d.dueDate)}</span>
                                    <span style={{ color: isPast(d.dueDate) ? '#ef4444' : 'var(--gold)', fontWeight:700 }}>{daysLeft(d.dueDate)}</span>
                                </div>
                            </button>
                        ))
                    }
                </div>
            </>
        );
    };

    // ── ASSIGNMENTS PAGE ──────────────────────────────────────
    const AssignmentsPage = () => (
        <>
            <TopBar title="Assignments" />
            <div style={{ padding:'1.5rem 2rem', maxWidth:'860px' }}>
                {upcoming.length === 0
                    ? <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No assignments or exams yet.</div>
                    : upcoming.map(i => {
                        const sub = getSubForItem(i.id);
                        return (
                            <div key={i.id} onClick={() => setActiveAssignment(i)} style={{ background:'var(--bg-card)', border:'1px solid var(--border)',
                                borderLeft: `4px solid ${i.type==='exam' ? 'var(--gold)' : CC}`,
                                borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1rem', cursor:'pointer',
                                display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
                                <div>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'.3rem' }}>
                                        {ITEM_ICONS[i.type]}
                                        <span style={{ fontWeight:700, fontSize:'.95rem' }}>{i.title}</span>
                                    </div>
                                    <div style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>
                                        Due {fmtDate(i.dueDate)} · {i.points} pts
                                        <span style={{ marginLeft:'8px', fontWeight:700,
                                            color: isPast(i.dueDate) ? '#ef4444' : '#f59e0b' }}>{daysLeft(i.dueDate)}</span>
                                    </div>
                                </div>
                                {sub ? (
                                    <span style={{ padding:'.3rem .9rem', borderRadius:'999px', fontSize:'.8rem', fontWeight:700, whiteSpace:'nowrap',
                                        background: sub.status==='graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                        color: sub.status==='graded' ? 'var(--green-light)' : '#93c5fd' }}>
                                        {sub.status==='graded' ? `Graded: ${sub.grade}/${i.points}` : 'Submitted'}
                                    </span>
                                ) : (
                                    <span style={{ padding:'.3rem .9rem', borderRadius:'999px', fontSize:'.8rem', fontWeight:700, whiteSpace:'nowrap',
                                        background: isPast(i.dueDate) ? 'rgba(239,68,68,.12)' : 'rgba(201,162,39,.12)',
                                        color: isPast(i.dueDate) ? '#ef4444' : 'var(--gold)' }}>
                                        {isPast(i.dueDate) ? 'Missing' : 'Not Submitted'}
                                    </span>
                                )}
                            </div>
                        );
                    })
                }
            </div>
        </>
    );

    // ── GRADES PAGE ───────────────────────────────────────────
    const GradesPage = () => {
        const totalPts = upcoming.reduce((s, i) => s + (i.points || 0), 0);
        const earnedPts = mySubs.filter(s=>s.grade!==null).reduce((acc, s) => {
            const item = allItems.find(i => i.id === s.itemId);
            return acc + (s.grade || 0);
        }, 0);
        const pct = totalPts ? Math.round((earnedPts/totalPts)*100) : null;
        return (
            <>
                <TopBar title="Grades" />
                <div style={{ padding:'1.5rem 2rem' }}>
                    {pct !== null && (
                        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                            padding:'1.5rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'2rem' }}>
                            <div style={{ width:80, height:80, borderRadius:'50%', border:`5px solid ${CC}`,
                                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:800, color:CC }}>{pct}%</span>
                            </div>
                            <div>
                                <div style={{ fontWeight:700, fontSize:'1rem' }}>Current Grade</div>
                                <div style={{ color:'var(--text-muted)', fontSize:'.88rem' }}>{earnedPts} / {totalPts} pts from graded work</div>
                            </div>
                        </div>
                    )}
                    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>
                        <table className="portal-table">
                            <thead><tr><th>Assignment</th><th>Due</th><th>Status</th><th>Score</th><th>Feedback</th></tr></thead>
                            <tbody>
                                {upcoming.map(item => {
                                    const sub = getSubForItem(item.id);
                                    return (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight:600 }}>{item.title}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{fmtDate(item.dueDate)}</td>
                                            <td>
                                                <span style={{ padding:'.2rem .7rem', borderRadius:'999px', fontSize:'.76rem', fontWeight:700,
                                                    background: !sub ? (isPast(item.dueDate) ? 'rgba(239,68,68,.12)' : 'rgba(201,162,39,.12)')
                                                        : sub.status==='graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                                    color: !sub ? (isPast(item.dueDate) ? '#ef4444' : 'var(--gold)')
                                                        : sub.status==='graded' ? 'var(--green-light)' : '#93c5fd' }}>
                                                    {!sub ? (isPast(item.dueDate) ? 'Missing' : 'Not Submitted') : sub.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight:700 }}>{sub?.grade !== null && sub?.grade !== undefined ? `${sub.grade}/${item.points}` : `—/${item.points}`}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem', maxWidth:'200px' }}>{sub?.feedback || '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
    };

    // ── PEOPLE PAGE ───────────────────────────────────────────
    const PeoplePage = () => (
        <>
            <TopBar title="People" />
            <div style={{ padding:'1.5rem 2rem', maxWidth:'600px' }}>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1rem' }}>
                    <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.75rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Instructor</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <Avatar initials={course.teacherName.split(' ').map(w=>w[0]).join('').slice(0,2)} color={CC} size={44} />
                        <div>
                            <div style={{ fontWeight:700 }}>{course.teacherName}</div>
                            <div style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>{course.code} Instructor</div>
                        </div>
                    </div>
                </div>
                <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                    <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.75rem', textTransform:'uppercase', letterSpacing:'.06em' }}>You</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <Avatar initials={(user?.name||'S').split(' ').map(w=>w[0]).join('').slice(0,2)} color='#475569' size={44} />
                        <div>
                            <div style={{ fontWeight:700 }}>{user?.name}</div>
                            <div style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>{user?.classSection} · {user?.studentId}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    // ── ASSIGNMENT DETAIL PAGE ────────────────────────────────
    const AssignmentDetailPage = () => {
        const item = activeAssignment;
        if (!item) return null;
        const detail = (ASSIGNMENT_DETAILS || {})[item.id] || {};
        const sub = getSubForItem(item.id);
        const form = subForms[item.id] || { mode: 'text', text: '', fileName: '' };
        const isGraded = sub?.status === 'graded';
        const canResubmit = !!sub && !isGraded;
        const backLabel = prevPage === 'modules' ? 'Modules' : 'Assignments';

        return (
            <>
                <TopBar title={item.title} />
                {/* Back nav */}
                <div style={{ padding:'.6rem 1.5rem', borderBottom:'1px solid var(--border)', background:'var(--bg-card)', display:'flex', gap:'1rem', alignItems:'center', flexShrink:0 }}>
                    <button onClick={() => { setActiveAssignment(null); setPage(prevPage); }} style={{
                        background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)',
                        color:'var(--text-muted)', cursor:'pointer', padding:'.35rem .85rem', fontSize:'.82rem',
                        display:'flex', alignItems:'center', gap:'6px' }}>
                        <FaArrowLeft /> {backLabel}
                    </button>
                    <span style={{ fontSize:'.82rem', color:'var(--text-muted)' }}>
                        {course.title} › {backLabel} › {item.title}
                    </span>
                </div>

                <div style={{ padding:'1.5rem 2rem', display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.75rem', alignItems:'start' }}>
                    {/* ── Left column ── */}
                    <div>
                        {/* Title + meta */}
                        <div style={{ marginBottom:'1.5rem' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'.6rem' }}>
                                {ITEM_ICONS[item.type]}
                                <span style={{ fontSize:'.76rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em',
                                    color: item.type==='exam' ? 'var(--gold)' : CC,
                                    background: item.type==='exam' ? 'rgba(201,162,39,.12)' : `${CC}20`,
                                    padding:'.18rem .55rem', borderRadius:'999px' }}>
                                    {item.type==='exam' ? 'Exam' : 'Assignment'}
                                </span>
                            </div>
                            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', margin:'0 0 .5rem', lineHeight:1.2 }}>{item.title}</h1>
                            <div style={{ fontSize:'.85rem', color:'var(--text-muted)', display:'flex', gap:'1.25rem', flexWrap:'wrap' }}>
                                <span>Due: {fmtDate(item.dueDate)}</span>
                                <span style={{ fontWeight:700, color: isPast(item.dueDate) ? '#ef4444' : 'var(--gold)' }}>{daysLeft(item.dueDate)}</span>
                                <span>{item.points} points</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1.25rem' }}>
                            <div style={{ fontWeight:700, fontSize:'.82rem', marginBottom:'.7rem', textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-muted)' }}>Description</div>
                            <p style={{ color:'var(--text)', fontSize:'.92rem', lineHeight:1.85, margin:0, whiteSpace:'pre-line' }}>
                                {detail.description || 'Complete this assignment as instructed. See your teacher for details.'}
                            </p>
                            {detail.passage && (
                                <div style={{ borderLeft:`3px solid ${CC}`, marginTop:'1rem', background:`${CC}0a`, borderRadius:'0 var(--r) var(--r) 0', padding:'.75rem 1rem .75rem 1.25rem' }}>
                                    <div style={{ fontSize:'.75rem', fontWeight:700, color:CC, marginBottom:'.5rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Passage</div>
                                    <p style={{ color:'var(--text-muted)', fontSize:'.88rem', lineHeight:1.85, margin:0, fontStyle:'italic' }}>{detail.passage}</p>
                                </div>
                            )}
                        </div>

                        {/* Questions / Instructions */}
                        {detail.instructions && detail.instructions.length > 0 && (
                            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1.25rem' }}>
                                <div style={{ fontWeight:700, fontSize:'.82rem', marginBottom:'.75rem', textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-muted)' }}>
                                    Questions / Instructions
                                </div>
                                <ol style={{ margin:0, padding:'0 0 0 1.4rem', lineHeight:2 }}>
                                    {detail.instructions.map((q, idx) => (
                                        <li key={idx} style={{ color:'var(--text)', fontSize:'.9rem', paddingBottom:'.4rem',
                                            borderBottom: idx < detail.instructions.length-1 ? '1px solid var(--border)' : 'none', marginBottom:'.4rem' }}>
                                            {q}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* ── Submission area ── */}
                        {isGraded ? (
                            <div style={{ background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700, color:'var(--green-light)', marginBottom:'.75rem' }}>
                                    <FaCheckCircle /> Graded · {sub.grade}/{item.points} pts
                                </div>
                                {sub.feedback && <p style={{ color:'var(--text-muted)', fontSize:'.88rem', margin:'0 0 .75rem', lineHeight:1.7 }}>{sub.feedback}</p>}
                                {sub.textContent && (
                                    <div style={{ background:'var(--bg)', borderRadius:'var(--r)', padding:'.85rem 1rem', border:'1px solid var(--border)' }}>
                                        <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.5rem' }}>Your Submission</div>
                                        <pre style={{ margin:0, color:'var(--text)', fontSize:'.88rem', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit' }}>{sub.textContent}</pre>
                                    </div>
                                )}
                                {sub.filePath && (
                                    <div style={{ marginTop:'.75rem', display:'flex', alignItems:'center', gap:'8px', fontSize:'.88rem', color:'var(--text-muted)' }}>
                                        <FaFileAlt style={{ color:'var(--gold)' }} /> {sub.filePath}
                                    </div>
                                )}
                            </div>
                        ) : canResubmit ? (
                            <div style={{ background:'rgba(59,130,246,.07)', border:'1px solid rgba(59,130,246,.25)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1rem' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem', marginBottom:'.75rem' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700, color:'#93c5fd' }}>
                                        <FaClock /> Submitted · {sub.submittedAt}
                                    </div>
                                    <button onClick={() => setLocalSubs(p => p.filter(s => s.itemId !== item.id))} style={{
                                        background:'rgba(255,255,255,.06)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                        color:'var(--text-muted)', cursor:'pointer', padding:'.35rem .85rem', fontSize:'.82rem' }}>
                                        Resubmit
                                    </button>
                                </div>
                                {sub.textContent && (
                                    <div style={{ background:'var(--bg)', borderRadius:'var(--r)', padding:'.85rem 1rem', border:'1px solid var(--border)' }}>
                                        <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.5rem' }}>Your Submission</div>
                                        <pre style={{ margin:0, color:'var(--text)', fontSize:'.88rem', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit' }}>{sub.textContent}</pre>
                                    </div>
                                )}
                                {sub.filePath && (
                                    <div style={{ marginTop:'.75rem', display:'flex', alignItems:'center', gap:'8px', fontSize:'.88rem', color:'var(--text-muted)' }}>
                                        <FaFileAlt style={{ color:'var(--gold)' }} /> {sub.filePath}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                                <div style={{ fontWeight:700, fontSize:'.9rem', marginBottom:'1rem' }}>
                                    Submit {item.type==='exam' ? 'Exam' : 'Assignment'}
                                </div>
                                {/* Mode tabs */}
                                {detail.allowText !== false && detail.allowFile !== false && (
                                    <div style={{ display:'flex', gap:'8px', marginBottom:'1rem' }}>
                                        <button onClick={() => setSubForms(p => ({ ...p, [item.id]: { ...(p[item.id]||{}), mode:'text' } }))} style={{
                                            padding:'.38rem 1rem', borderRadius:'var(--r)', border:'1px solid var(--border)', cursor:'pointer', fontWeight:700, fontSize:'.82rem',
                                            background: (form.mode||'text')==='text' ? CC : 'transparent',
                                            color: (form.mode||'text')==='text' ? '#fff' : 'var(--text-muted)',
                                            display:'flex', alignItems:'center', gap:'6px' }}>
                                            <FaFileAlt /> Text Entry
                                        </button>
                                        <button onClick={() => setSubForms(p => ({ ...p, [item.id]: { ...(p[item.id]||{}), mode:'file' } }))} style={{
                                            padding:'.38rem 1rem', borderRadius:'var(--r)', border:'1px solid var(--border)', cursor:'pointer', fontWeight:700, fontSize:'.82rem',
                                            background: form.mode==='file' ? CC : 'transparent',
                                            color: form.mode==='file' ? '#fff' : 'var(--text-muted)',
                                            display:'flex', alignItems:'center', gap:'6px' }}>
                                            <FaUpload /> Upload File
                                        </button>
                                    </div>
                                )}
                                {/* Text entry */}
                                {(form.mode !== 'file' || detail.allowFile === false) && detail.allowText !== false && (
                                    <textarea value={form.text || ''} rows={10}
                                        onChange={e => setSubForms(p => ({ ...p, [item.id]: { ...(p[item.id]||{}), text: e.target.value } }))}
                                        placeholder={`Type your ${item.type==='exam' ? 'answers' : 'submission'} here…`}
                                        style={{ width:'100%', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                            padding:'.75rem 1rem', color:'var(--text)', fontSize:'.9rem', resize:'vertical',
                                            boxSizing:'border-box', fontFamily:'inherit', lineHeight:1.75 }} />
                                )}
                                {/* File upload */}
                                {form.mode === 'file' && detail.allowFile !== false && (
                                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                        border:`2px dashed ${form.fileName ? CC : 'var(--border)'}`, borderRadius:'var(--r)',
                                        padding:'2.5rem 1.5rem', cursor:'pointer', gap:'10px',
                                        background: form.fileName ? `${CC}0a` : 'transparent', transition:'border-color .2s' }}>
                                        <FaUpload style={{ fontSize:'1.6rem', color: form.fileName ? CC : 'var(--text-muted)' }} />
                                        <span style={{ fontWeight:700, fontSize:'.95rem', color: form.fileName ? CC : 'var(--text-muted)' }}>
                                            {form.fileName || 'Click to choose a file'}
                                        </span>
                                        <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>
                                            {form.fileName ? 'File selected – click to change' : 'PDF, DOCX, JPG, PNG – up to 20 MB'}
                                        </span>
                                        <input type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                            onChange={e => setSubForms(p => ({ ...p, [item.id]: { ...(p[item.id]||{}), fileName: e.target.files[0]?.name || '' } }))} />
                                    </label>
                                )}
                                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginTop:'1rem', flexWrap:'wrap' }}>
                                    <button onClick={() => submitAssignment(item.id)} style={{
                                        padding:'.6rem 1.5rem', borderRadius:'var(--r)', background: CC, color:'#fff',
                                        border:'none', cursor:'pointer', fontWeight:700, fontSize:'.9rem',
                                        display:'flex', alignItems:'center', gap:'8px',
                                        opacity: ((form.mode !== 'file' && !form.text?.trim()) || (form.mode === 'file' && !form.fileName)) ? .45 : 1 }}>
                                        <FaPaperPlane /> Submit {item.type==='exam' ? 'Exam' : 'Assignment'}
                                    </button>
                                    {isPast(item.dueDate) && (
                                        <span style={{ fontSize:'.82rem', color:'#f87171', fontWeight:600 }}>
                                            ⚠ Due date passed — this will count as late
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                            <div style={{ fontWeight:700, fontSize:'.8rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>
                                Assignment Details
                            </div>
                            {[
                                ['Due Date',  fmtDate(item.dueDate)],
                                ['Points',    `${item.points} pts`],
                                ['Type',      item.type==='exam' ? 'Examination' : 'Assignment'],
                                ['Status',    !sub ? (isPast(item.dueDate) ? 'Missing' : 'Not Submitted') : sub.status==='graded' ? `Graded (${sub.grade}/${item.points})` : 'Submitted'],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.42rem 0',
                                    borderBottom:'1px solid var(--border)', fontSize:'.85rem', gap:'.5rem' }}>
                                    <span style={{ color:'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontWeight:700,
                                        color: label==='Status' && !sub && isPast(item.dueDate) ? '#ef4444'
                                            : label==='Status' && sub?.status==='graded' ? 'var(--green-light)'
                                            : label==='Status' && sub ? '#93c5fd'
                                            : 'var(--text)' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem' }}>
                            <div style={{ fontWeight:700, fontSize:'.8rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>
                                Allowed Formats
                            </div>
                            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                                {detail.allowText !== false && (
                                    <span style={{ fontSize:'.78rem', padding:'.22rem .65rem', borderRadius:'999px',
                                        background:'rgba(255,255,255,.06)', border:'1px solid var(--border)',
                                        display:'flex', alignItems:'center', gap:'5px', color:'var(--text-muted)' }}>
                                        <FaFileAlt style={{ fontSize:'.68rem' }} /> Text Entry
                                    </span>
                                )}
                                {detail.allowFile && (
                                    <span style={{ fontSize:'.78rem', padding:'.22rem .65rem', borderRadius:'999px',
                                        background:'rgba(255,255,255,.06)', border:'1px solid var(--border)',
                                        display:'flex', alignItems:'center', gap:'5px', color:'var(--text-muted)' }}>
                                        <FaUpload style={{ fontSize:'.68rem' }} /> File Upload
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const PAGES = { home: <HomePage />, modules: <ModulesPage />, announcements: <AnnouncementsPage />,
        discussions: <DiscussionsPage />, assignments: <AssignmentsPage />, grades: <GradesPage />, people: <PeoplePage /> };

    return (
        <>
            {/* Full-window layout: fixed sidebar + scrollable main */}
            <div style={{ display:'flex', height:'100vh', overflow:'hidden', position:'fixed', inset:0, zIndex:999, background:'var(--bg)' }}>
                <Sidebar />
                <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                    <div style={{ flex:1, overflowY:'auto' }}>
                        {activeAssignment ? <AssignmentDetailPage /> : (PAGES[page] || <HomePage />)}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {videoModal && (
                <div onClick={() => setVideoModal(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.88)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div onClick={e => e.stopPropagation()} style={{ width:'min(860px,95vw)', background:'#111', borderRadius:'var(--r)', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,.6)' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 1.25rem', borderBottom:'1px solid rgba(255,255,255,.1)' }}>
                            <span style={{ fontWeight:700, color:'#fff', fontSize:'.95rem' }}>{videoModal.title}</span>
                            <button onClick={() => setVideoModal(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.6)', cursor:'pointer', fontSize:'1.3rem' }}>✕</button>
                        </div>
                        <div style={{ aspectRatio:'16/9' }}>
                            <iframe src={videoModal.url} title={videoModal.title} width="100%" height="100%"
                                style={{ border:'none', display:'block' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
