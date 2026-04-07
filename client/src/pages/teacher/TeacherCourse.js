import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome, FaBullhorn, FaBook, FaCalendarAlt, FaVideo, FaLink, FaFilePdf,
    FaTasks, FaClipboardList, FaChevronDown, FaChevronUp, FaExternalLinkAlt,
    FaCheckCircle, FaPlus, FaArrowLeft, FaUsers, FaThumbtack, FaSave,
    FaTrash, FaGraduationCap, FaEyeSlash, FaEye,
} from 'react-icons/fa';
import { COURSES, MODULES, COURSE_ANNOUNCEMENTS, SUBMISSIONS, CLASS_ROSTER } from '../../data/mockData';

const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const ITEM_TYPE_ICONS = {
    video:      <FaVideo      style={{ color: '#ef4444' }} />,
    link:       <FaLink       style={{ color: '#3b82f6' }} />,
    file:       <FaFilePdf    style={{ color: '#f59e0b' }} />,
    assignment: <FaTasks      style={{ color: '#8b5cf6' }} />,
    exam:       <FaClipboardList style={{ color: '#c9a227' }} />,
};

const genId = () => `_${Math.random().toString(36).slice(2,9)}`;

export default function TeacherCourse() {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [tab, setTab] = useState('overview');
    const [openMods, setOpenMods] = useState({});

    // Local copies so teacher can edit in-session
    const [announcements, setAnnouncements] = useState(() =>
        COURSE_ANNOUNCEMENTS.filter(a => a.courseId === courseId)
            .sort((a, b) => new Date(b.date) - new Date(a.date)));
    const [modules, setModules] = useState(() =>
        MODULES.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order));
    const [submissions, setSubmissions] = useState(() =>
        SUBMISSIONS.filter(s => s.courseId === courseId));

    // Forms
    const [annForm, setAnnForm] = useState({ title:'', body:'', pinned:false });
    const [annSuccess, setAnnSuccess] = useState('');
    const [modForm, setModForm]  = useState({ title:'' });
    const [itemForms, setItemForms] = useState({});   // modId → item form state
    const [openItemForm, setOpenItemForm] = useState(null); // modId showing add form
    const [gradeForm, setGradeForm] = useState({}); // subId → grade string
    const [gradesSuccess, setGradesSuccess] = useState({});

    const course = useMemo(() => COURSES.find(c => c.id === courseId), [courseId]);

    // Roster for this course's form/section
    const roster = useMemo(() => {
        if (!course) return [];
        const sectionKey = `${course.form} ${course.section}`;
        return CLASS_ROSTER[sectionKey] || [];
    }, [course]);

    const TAB_STYLE = active => ({
        padding: '.5rem 1.15rem', border: 'none', borderRadius:'999px',
        cursor:'pointer', fontWeight:700, fontSize:'.85rem', transition:'all .2s',
        background: active ? course?.color || '#1a4731' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
    });

    // ── Announcements ────────────────────────────────────────
    const postAnnouncement = () => {
        if (!annForm.title.trim() || !annForm.body.trim()) return;
        const newAnn = {
            id: genId(), courseId, authorId: user?.staffId || '',
            author: user?.name || 'Teacher', title: annForm.title,
            body: annForm.body, date: new Date().toISOString().slice(0,10),
            pinned: annForm.pinned,
        };
        setAnnouncements(p => [newAnn, ...p]);
        setAnnForm({ title:'', body:'', pinned:false });
        setAnnSuccess('Announcement posted successfully!');
        setTimeout(() => setAnnSuccess(''), 3000);
    };
    const deleteAnn = id => setAnnouncements(p => p.filter(a => a.id !== id));
    const togglePin = id => setAnnouncements(p => p.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

    // ── Modules ──────────────────────────────────────────────
    const addModule = () => {
        if (!modForm.title.trim()) return;
        const newMod = {
            id: genId(), courseId, order: modules.length + 1,
            title: modForm.title, published: true, items: [],
        };
        setModules(p => [...p, newMod]);
        setModForm({ title:'' });
    };

    const toggleModPublish = modId =>
        setModules(p => p.map(m => m.id === modId ? { ...m, published: !m.published } : m));

    const deleteMod = modId =>
        setModules(p => p.filter(m => m.id !== modId));

    const addItem = (modId) => {
        const f = itemForms[modId] || {};
        if (!f.title?.trim()) return;
        const newItem = {
            id: genId(), type: f.type || 'link', title: f.title,
            url: f.url || '', duration: f.duration || '',
            dueDate: f.dueDate || '', points: Number(f.points) || 0,
            size: '', published: true,
        };
        setModules(p => p.map(m => m.id === modId
            ? { ...m, items: [...m.items, newItem] }
            : m));
        setItemForms(p => ({ ...p, [modId]: {} }));
        setOpenItemForm(null);
    };

    const deleteItem = (modId, itemId) =>
        setModules(p => p.map(m => m.id === modId
            ? { ...m, items: m.items.filter(i => i.id !== itemId) }
            : m));

    // ── Grading ──────────────────────────────────────────────
    const saveGrade = (subId, maxPts) => {
        const g = Number(gradeForm[subId]);
        if (isNaN(g) || g < 0 || g > maxPts) return;
        setSubmissions(p => p.map(s => s.id === subId ? { ...s, grade: g, status:'graded' } : s));
        setGradesSuccess(p => ({ ...p, [subId]: true }));
        setTimeout(() => setGradesSuccess(p => ({ ...p, [subId]: false })), 2500);
    };

    // ── Course sidebar ──────────────────────────────────────
    const CC = course?.color || '#1a4731';
    const T_NAV = [
        { id:'overview',      label:'Overview',          icon:<FaHome /> },
        { id:'modules',       label:'Modules',           icon:<FaBook /> },
        { id:'announcements', label:'Announcements',     icon:<FaBullhorn /> },
        { id:'grades',        label:'Grade Assignments', icon:<FaGraduationCap /> },
        { id:'students',      label:'Students',          icon:<FaUsers /> },
    ];

    if (!course) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:'1rem' }}>
            <FaBook style={{ fontSize:'3rem', color:'var(--text-muted)' }} />
            <h3 style={{ color:'var(--text)' }}>Course not found</h3>
            <Link to="/teacher/courses" style={{ color:'var(--gold)' }}>← My Courses</Link>
        </div>
    );

    return (
        <div style={{ display:'flex', height:'100vh', overflow:'hidden', position:'fixed', inset:0, zIndex:999, background:'var(--bg)' }}>
            {/* Course sidebar */}
            <aside style={{ width:220, flexShrink:0, background:'#1c1c1e', borderRight:'1px solid rgba(255,255,255,.08)',
                display:'flex', flexDirection:'column', minHeight:'100vh', overflowY:'auto' }}>
                <div style={{ padding:'1.1rem 1rem .9rem', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.45)', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'.3rem' }}>Instructor</div>
                    <div style={{ fontSize:'.88rem', fontWeight:700, color:'#fff', lineHeight:1.3 }}>{course.title}</div>
                    <div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.45)', marginTop:'.25rem' }}>{course.code} · {course.form} {course.section}</div>
                </div>
                <nav style={{ padding:'.5rem 0', flex:1 }}>
                    {T_NAV.map(n => (
                        <button key={n.id} onClick={() => setTab(n.id)} style={{
                            width:'100%', display:'flex', alignItems:'center', gap:'10px',
                            padding:'.65rem 1.1rem', border:'none',
                            background: tab===n.id ? CC : 'transparent',
                            color: tab===n.id ? '#fff' : 'rgba(255,255,255,.65)',
                            cursor:'pointer', fontSize:'.88rem', fontWeight: tab===n.id ? 700 : 500,
                            textAlign:'left', transition:'background .15s',
                            borderLeft: tab===n.id ? '3px solid rgba(255,255,255,.3)' : '3px solid transparent',
                        }}>
                            <span style={{ fontSize:'.9rem', flexShrink:0 }}>{n.icon}</span>{n.label}
                        </button>
                    ))}
                </nav>
                <div style={{ padding:'.75rem 1rem', borderTop:'1px solid rgba(255,255,255,.08)' }}>
                    <Link to="/teacher/courses" style={{ display:'flex', alignItems:'center', gap:'7px', color:'rgba(255,255,255,.5)', fontSize:'.82rem', textDecoration:'none' }}>
                        <FaArrowLeft /> My Courses
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex:1, overflowY:'auto' }}>

                {/* Header Banner */}
                <div style={{ background: CC, padding:'1.5rem 2rem', position:'relative', overflow:'hidden', flexShrink:0 }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(0,0,0,.15) 0%,transparent 60%)' }} />
                    <div style={{ position:'relative' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', color:'#fff', margin:'0 0 .25rem' }}>{course.title}</h2>
                        <p style={{ color:'rgba(255,255,255,.7)', fontSize:'.85rem', margin:0 }}>
                            {course.code} · {course.form} {course.section} · {course.credits} Credits
                            <span style={{ margin:'0 .6rem', opacity:.5 }}>·</span>
                            <FaCalendarAlt style={{ marginRight:'5px' }} />{course.schedule.map(s=>`${s.day} ${s.time}`).join(' · ')}
                        </p>
                    </div>
                </div>

                <div style={{ padding:'1.5rem 2rem' }}>

                    {/* ── OVERVIEW ── */}
                    {tab === 'overview' && (
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.5rem', alignItems:'start' }}>
                            <div>
                                <div className="d-card" style={{ marginBottom:'1rem' }}>
                                    <div className="d-card-title"><FaBook /> Course Description</div>
                                    <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.7 }}>{course.description}</p>
                                </div>
                                {/* Quick stats */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                                    {[
                                        ['Modules', modules.length, course.color],
                                        ['Students', roster.length, '#7c3aed'],
                                        ['Submissions', submissions.length, '#f59e0b'],
                                    ].map(([l,v,c]) => (
                                        <div key={l} className="d-card" style={{ textAlign:'center', padding:'1.25rem' }}>
                                            <div style={{ fontSize:'2rem', fontWeight:800, color:c }}>{v}</div>
                                            <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginTop:'.3rem' }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                    )}

                    {/* ── MODULES ── */}
                    {tab === 'modules' && (
                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', margin:0 }}>Manage Modules</h2>
                            </div>

                            {/* Add module form */}
                            <div className="d-card" style={{ marginBottom:'1.25rem', display:'flex', gap:'.75rem', alignItems:'center' }}>
                                <FaPlus style={{ color:'var(--gold)', flexShrink:0 }} />
                                <input
                                    value={modForm.title}
                                    onChange={e => setModForm({ title: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && addModule()}
                                    placeholder="New module title…"
                                    style={{ flex:1, background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)',
                                        padding:'.55rem .9rem', color:'var(--text)', fontSize:'.9rem' }}
                                />
                                <button onClick={addModule} style={{ padding:'.55rem 1.1rem', borderRadius:'var(--r)',
                                    background: course.color, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, whiteSpace:'nowrap' }}>
                                    Add Module
                                </button>
                            </div>

                            {modules.map(mod => (
                                <div key={mod.id} className="d-card" style={{ marginBottom:'1rem', padding:0, overflow:'hidden', opacity: mod.published ? 1 : .65 }}>
                                    {/* Module header */}
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem',
                                        borderBottom: openMods[mod.id] ? '1px solid var(--border)' : 'none', background:'var(--bg-card)' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                            <button onClick={() => setOpenMods(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                                                style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:'2px' }}>
                                                {openMods[mod.id] ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                            <span style={{ fontWeight:700 }}>{mod.title}</span>
                                            <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{mod.items.length} items</span>
                                            {!mod.published && <span style={{ fontSize:'.72rem', background:'rgba(239,68,68,.15)', color:'#ef4444',
                                                padding:'.15rem .5rem', borderRadius:'999px', fontWeight:700 }}>Unpublished</span>}
                                        </div>
                                        <div style={{ display:'flex', gap:'8px' }}>
                                            <button onClick={() => toggleModPublish(mod.id)} title={mod.published ? 'Unpublish' : 'Publish'}
                                                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'.9rem' }}>
                                                {mod.published ? <FaEye /> : <FaEyeSlash />}
                                            </button>
                                            <button onClick={() => deleteMod(mod.id)} title="Delete module"
                                                style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'.9rem' }}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items list */}
                                    {openMods[mod.id] && (
                                        <div>
                                            {mod.items.map((item, idx) => (
                                                <div key={item.id} style={{
                                                    display:'flex', alignItems:'center', justifyContent:'space-between',
                                                    padding:'.7rem 1.5rem', borderBottom:'1px solid var(--border)',
                                                    background: idx % 2 === 0 ? 'rgba(255,255,255,.015)' : 'transparent',
                                                }}>
                                                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                                                        {ITEM_TYPE_ICONS[item.type]}
                                                        <div>
                                                            <div style={{ fontWeight:600, fontSize:'.88rem' }}>
                                                                {item.url && item.url !== '#'
                                                                    ? <a href={item.url} target="_blank" rel="noreferrer"
                                                                        style={{ color:'var(--text)', display:'flex', alignItems:'center', gap:'5px' }}>
                                                                        {item.title} <FaExternalLinkAlt style={{ fontSize:'.65rem', color:'var(--text-muted)' }} />
                                                                      </a>
                                                                    : item.title}
                                                            </div>
                                                            {(item.type==='assignment'||item.type==='exam') && item.dueDate &&
                                                                <div style={{ fontSize:'.76rem', color:'var(--text-muted)' }}>Due: {fmtDate(item.dueDate)} · {item.points} pts</div>}
                                                            {item.type==='video' && item.duration &&
                                                                <div style={{ fontSize:'.76rem', color:'var(--text-muted)' }}>{item.duration}</div>}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => deleteItem(mod.id, item.id)}
                                                        style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'.85rem' }}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add item form */}
                                            {openItemForm === mod.id ? (
                                                <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid var(--border)', background:'rgba(255,255,255,.03)' }}>
                                                    <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'.75rem', marginBottom:'.75rem' }}>
                                                        <select
                                                            value={(itemForms[mod.id] || {}).type || 'link'}
                                                            onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), type: e.target.value }}))}
                                                            style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem' }}>
                                                            <option value="link">🔗 Link</option>
                                                            <option value="video">🎥 Video</option>
                                                            <option value="file">📄 File/PDF</option>
                                                            <option value="assignment">📝 Assignment</option>
                                                            <option value="exam">📋 Exam</option>
                                                        </select>
                                                        <input placeholder="Title *"
                                                            value={(itemForms[mod.id] || {}).title || ''}
                                                            onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), title: e.target.value }}))}
                                                            style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem' }} />
                                                    </div>
                                                    {/* URL row */}
                                                    {['link','video','file'].includes((itemForms[mod.id]||{}).type||'link') && (
                                                        <input placeholder="URL / embed link"
                                                            value={(itemForms[mod.id] || {}).url || ''}
                                                            onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), url: e.target.value }}))}
                                                            style={{ width:'100%', marginBottom:'.75rem', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem', boxSizing:'border-box' }} />
                                                    )}
                                                    {/* Duration */}
                                                    {(itemForms[mod.id]||{}).type === 'video' && (
                                                        <input placeholder="Duration (e.g. 18 min)"
                                                            value={(itemForms[mod.id] || {}).duration || ''}
                                                            onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), duration: e.target.value }}))}
                                                            style={{ width:'100%', marginBottom:'.75rem', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem', boxSizing:'border-box' }} />
                                                    )}
                                                    {/* Due date + points */}
                                                    {['assignment','exam'].includes((itemForms[mod.id]||{}).type) && (
                                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:'.75rem', marginBottom:'.75rem' }}>
                                                            <input type="date"
                                                                value={(itemForms[mod.id] || {}).dueDate || ''}
                                                                onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), dueDate: e.target.value }}))}
                                                                style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem' }} />
                                                            <input type="number" placeholder="Points"
                                                                value={(itemForms[mod.id] || {}).points || ''}
                                                                onChange={e => setItemForms(p => ({ ...p, [mod.id]: { ...(p[mod.id]||{}), points: e.target.value }}))}
                                                                style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', padding:'.5rem .75rem', fontSize:'.88rem' }} />
                                                        </div>
                                                    )}
                                                    <div style={{ display:'flex', gap:'.75rem' }}>
                                                        <button onClick={() => addItem(mod.id)} style={{ padding:'.5rem 1.1rem', borderRadius:'var(--r)',
                                                            background: course.color, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'.85rem' }}>
                                                            <FaPlus style={{ marginRight:'5px' }} /> Add Item
                                                        </button>
                                                        <button onClick={() => { setOpenItemForm(null); setItemForms(p => ({ ...p, [mod.id]: {} })); }}
                                                            style={{ padding:'.5rem 1.1rem', borderRadius:'var(--r)', background:'var(--bg)', color:'var(--text-muted)',
                                                                border:'1px solid var(--border)', cursor:'pointer', fontWeight:600, fontSize:'.85rem' }}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setOpenItemForm(mod.id)}
                                                    style={{ display:'flex', alignItems:'center', gap:'7px', margin:'0 1.25rem 1rem', padding:'.45rem .9rem',
                                                        borderRadius:'var(--r)', background:'rgba(201,162,39,.1)', color:'var(--gold)',
                                                        border:'1px dashed rgba(201,162,39,.4)', cursor:'pointer', fontWeight:700, fontSize:'.82rem' }}>
                                                    <FaPlus /> Add Item
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── ANNOUNCEMENTS ── */}
                    {tab === 'announcements' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>Course Announcements</h2>

                            {/* Post form */}
                            <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                                <div className="d-card-title"><FaBullhorn /> Post New Announcement</div>
                                {annSuccess && (
                                    <div style={{ background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r)',
                                        padding:'.6rem 1rem', color:'var(--green-light)', fontSize:'.88rem', marginBottom:'1rem', display:'flex', gap:'8px' }}>
                                        <FaCheckCircle /> {annSuccess}
                                    </div>
                                )}
                                <input
                                    value={annForm.title}
                                    onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Announcement title…"
                                    style={{ width:'100%', marginBottom:'.75rem', background:'var(--bg)', border:'1px solid var(--border)', 
                                        borderRadius:'var(--r)', padding:'.6rem .9rem', color:'var(--text)', fontSize:'.9rem', boxSizing:'border-box' }}
                                />
                                <textarea
                                    value={annForm.body}
                                    onChange={e => setAnnForm(p => ({ ...p, body: e.target.value }))}
                                    placeholder="Write your announcement here…"
                                    rows={4}
                                    style={{ width:'100%', marginBottom:'.75rem', background:'var(--bg)', border:'1px solid var(--border)',
                                        borderRadius:'var(--r)', padding:'.6rem .9rem', color:'var(--text)', fontSize:'.9rem', resize:'vertical', boxSizing:'border-box' }}
                                />
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'.88rem', cursor:'pointer' }}>
                                        <input type="checkbox" checked={annForm.pinned} onChange={e => setAnnForm(p => ({ ...p, pinned: e.target.checked }))} />
                                        <FaThumbtack style={{ color:'var(--gold)' }} /> Pin this announcement
                                    </label>
                                    <button onClick={postAnnouncement} style={{ padding:'.55rem 1.25rem', borderRadius:'var(--r)',
                                        background: course.color, color:'#fff', border:'none', cursor:'pointer', fontWeight:700 }}>
                                        Post Announcement
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            {announcements.length === 0
                                ? <div className="d-card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No announcements yet.</div>
                                : announcements.map(a => (
                                    <div key={a.id} className="d-card" style={{ marginBottom:'1rem', borderLeft: a.pinned ? `4px solid ${course.color}` : '4px solid transparent' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                            <div style={{ flex:1 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'.5rem' }}>
                                                    {a.pinned && <FaThumbtack style={{ color: course.color, fontSize:'.8rem' }} />}
                                                    <span style={{ fontWeight:700 }}>{a.title}</span>
                                                </div>
                                                <p style={{ color:'var(--text-muted)', fontSize:'.9rem', lineHeight:1.7, margin:'0 0 .5rem' }}>{a.body}</p>
                                                <span style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{fmtDate(a.date)}</span>
                                            </div>
                                            <div style={{ display:'flex', gap:'8px', marginLeft:'1rem', flexShrink:0 }}>
                                                <button onClick={() => togglePin(a.id)} title={a.pinned ? 'Unpin' : 'Pin'}
                                                    style={{ background:'none', border:'none', cursor:'pointer', color: a.pinned ? 'var(--gold)' : 'var(--text-muted)', fontSize:'.9rem' }}>
                                                    <FaThumbtack />
                                                </button>
                                                <button onClick={() => deleteAnn(a.id)} title="Delete"
                                                    style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'.9rem' }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* ── GRADE ASSIGNMENTS ── */}
                    {tab === 'grades' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>
                                <FaGraduationCap style={{ marginRight:'10px', color:'var(--gold)' }} />
                                Grade Assignments & Exams
                            </h2>

                            {submissions.length === 0
                                ? <div className="d-card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
                                    No submissions yet for this course.
                                  </div>
                                : submissions.map(sub => {
                                    const allItems = modules.flatMap(m => m.items);
                                    const item = allItems.find(i => i.id === sub.itemId);
                                    return (
                                        <div key={sub.id} className="d-card" style={{ marginBottom:'1rem' }}>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight:700, fontSize:'.95rem', marginBottom:'.3rem' }}>
                                                        {item?.title || sub.itemId}
                                                    </div>
                                                    <div style={{ fontSize:'.83rem', color:'var(--text-muted)', marginBottom:'.3rem' }}>
                                                        <FaUsers style={{ marginRight:'5px' }} />
                                                        {sub.studentName} · {sub.studentId}
                                                    </div>
                                                    <div style={{ fontSize:'.83rem', color:'var(--text-muted)' }}>
                                                        Submitted: {sub.submittedAt}
                                                        {sub.filePath && <span style={{ marginLeft:'10px', color:'#3b82f6' }}>📎 {sub.filePath}</span>}
                                                    </div>
                                                    {sub.textContent && (
                                                        <div style={{ marginTop:'.6rem', background:'var(--bg)', borderRadius:'var(--r)', padding:'.75rem 1rem', border:'1px solid var(--border)' }}>
                                                            <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.45rem' }}>Student's Written Submission</div>
                                                            <pre style={{ margin:0, color:'var(--text)', fontSize:'.87rem', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit' }}>{sub.textContent}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{
                                                    padding:'.25rem .8rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700,
                                                    background: sub.status==='graded' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                                                    color: sub.status==='graded' ? 'var(--green-light)' : '#93c5fd',
                                                }}>{sub.status}</span>
                                            </div>

                                            {/* Grade input */}
                                            <div style={{ marginTop:'1rem', padding:'1rem', background:'var(--bg)', borderRadius:'var(--r)', borderTop:'1px solid var(--border)' }}>
                                                {gradesSuccess[sub.id] && (
                                                    <div style={{ display:'flex', alignItems:'center', gap:'7px', color:'var(--green-light)', fontSize:'.85rem', marginBottom:'.6rem' }}>
                                                        <FaCheckCircle /> Grade saved!
                                                    </div>
                                                )}
                                                <div style={{ display:'grid', gridTemplateColumns:'auto auto 1fr auto', gap:'.75rem', alignItems:'center' }}>
                                                    <label style={{ fontSize:'.85rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                                                        Grade:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0} max={item?.points || 100}
                                                        placeholder={sub.grade !== null ? String(sub.grade) : '—'}
                                                        defaultValue={sub.grade !== null ? sub.grade : ''}
                                                        onChange={e => setGradeForm(p => ({ ...p, [sub.id]: e.target.value }))}
                                                        style={{ width:'80px', background:'var(--bg-card)', border:'1px solid var(--border)',
                                                            borderRadius:'var(--r)', padding:'.45rem .75rem', color:'var(--text)', fontSize:'.9rem' }}
                                                    />
                                                    <span style={{ fontSize:'.85rem', color:'var(--text-muted)' }}>/ {item?.points || '?'} pts</span>
                                                    <div style={{ display:'flex', gap:'.6rem' }}>
                                                        <button onClick={() => saveGrade(sub.id, item?.points || 100)}
                                                            style={{ padding:'.45rem 1rem', borderRadius:'var(--r)', background: course.color,
                                                                color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'.85rem', display:'flex', gap:'6px', alignItems:'center' }}>
                                                            <FaSave /> Save
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop:'.75rem' }}>
                                                    <label style={{ fontSize:'.82rem', color:'var(--text-muted)', display:'block', marginBottom:'.3rem' }}>Feedback:</label>
                                                    <textarea
                                                        defaultValue={sub.feedback}
                                                        onChange={e => setGradeForm(p => ({ ...p, [`${sub.id}_fb`]: e.target.value }))}
                                                        rows={2}
                                                        placeholder="Write feedback for the student…"
                                                        style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)',
                                                            borderRadius:'var(--r)', padding:'.5rem .75rem', color:'var(--text)', fontSize:'.85rem', resize:'vertical', boxSizing:'border-box' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}

                    {/* ── STUDENTS ── */}
                    {tab === 'students' && (
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'1.25rem' }}>
                                Class List — {course.form} {course.section}
                            </h2>
                            <div className="d-card">
                                {roster.length === 0
                                    ? <p style={{ color:'var(--text-muted)', textAlign:'center', padding:'1.5rem' }}>No students found for this section.</p>
                                    : (
                                        <table className="portal-table">
                                            <thead><tr><th>#</th><th>Name</th><th>House</th><th>Portal</th><th>Submissions</th></tr></thead>
                                            <tbody>
                                                {roster.map((s, idx) => {
                                                    const subCount = submissions.filter(sub => sub.studentId === s.studentId).length;
                                                    return (
                                                        <tr key={s.id}>
                                                            <td style={{ color:'var(--text-muted)' }}>{idx + 1}</td>
                                                            <td style={{ fontWeight:600 }}>{s.name}</td>
                                                            <td>
                                                                <span style={{ padding:'.2rem .7rem', borderRadius:'999px', fontSize:'.75rem', fontWeight:700,
                                                                    background:'rgba(255,255,255,.07)', color:'var(--text-muted)' }}>{s.house}</span>
                                                            </td>
                                                            <td>
                                                                {s.hasAccount
                                                                    ? <FaCheckCircle style={{ color:'var(--green-light)' }} />
                                                                    : <span style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>—</span>}
                                                            </td>
                                                            <td style={{ color: subCount > 0 ? 'var(--green-light)' : 'var(--text-muted)', fontWeight:600 }}>
                                                                {subCount > 0 ? `${subCount} submitted` : 'None'}
                                                            </td>
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

                </div>
            </div>
            </div>
        </div>
    );
}
