import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaIdCard, FaUsers, FaCheckCircle, FaPlus, FaClipboardList, FaBell, FaSearch } from 'react-icons/fa';
import { MdPending } from 'react-icons/md';
import { ADMITTED_STUDENTS, USERS, ENROLLED_CLASSES, SUBJECTS, ANNOUNCEMENTS } from '../../data/mockData';

function genId() {
    const year = new Date().getFullYear();
    const seq  = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    return `SLGS-ADM-${year}-${seq}`;
}

const FORMS = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const EMPTY_NEW = { name:'', form:'JSS 1', dob:'', guardian:'' };

export default function StaffDashboard() {
    const { user } = useAuth();
    const location = useLocation();
    const urlTab   = new URLSearchParams(location.search).get('tab');
    const [admissions, setAdmissions] = useState(ADMITTED_STUDENTS);
    const [showForm, setShowForm]     = useState(false);
    const [newStudent, setNewStudent] = useState(EMPTY_NEW);
    const [issued, setIssued]         = useState(null);
    const [search, setSearch]         = useState('');
    const [tab, setTab]               = useState(urlTab || 'admissions'); // admissions | roster | enrolment

    const students = USERS.filter(u => u.role === 'student');
    const pending  = admissions.filter(a => !a.registered);
    const registered = admissions.filter(a => a.registered);

    const issueId = (e) => {
        e.preventDefault();
        const id = genId();
        const record = { admissionId: id, ...newStudent, registered: false, studentId: null };
        setAdmissions(p => [...p, record]);
        setIssued({ id, name: newStudent.name, form: newStudent.form });
        setNewStudent(EMPTY_NEW);
        setShowForm(false);
    };

    const filtered = admissions.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.admissionId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Academic Staff — Administration</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(59,130,246,.3)', background:'rgba(59,130,246,.08)', color:'#93c5fd' }}>
                            {user?.title || 'Academic Staff'}
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            Welcome, {user?.name}
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                            {user?.staffId} · {user?.department} · SLGS
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="dash-stats" style={{ marginBottom:'2rem' }}>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaIdCard /></div>
                            <div className="ds-info"><h3>{admissions.length}</h3><span>Admission IDs Issued</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon gold" style={{ color:'#fdba74' }}><MdPending /></div>
                            <div className="ds-info"><h3>{pending.length}</h3><span>Awaiting Registration</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaCheckCircle /></div>
                            <div className="ds-info"><h3>{registered.length}</h3><span>Accounts Created</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaUsers /></div>
                            <div className="ds-info"><h3>{students.length}</h3><span>Active Students</span></div>
                        </div>
                    </div>

                    {/* Issued alert */}
                    {issued && (
                        <div style={{ marginBottom:'1.5rem', padding:'1rem 1.25rem', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r)', display:'flex', flexDirection:'column', gap:'4px' }}>
                            <div style={{ color:'#86efac', fontWeight:700, fontSize:'.93rem' }}><FaCheckCircle style={{ marginRight:'8px' }} />Admission ID Issued Successfully</div>
                            <div style={{ fontSize:'.87rem', color:'var(--text-muted)' }}>
                                Student: <strong>{issued.name}</strong> ({issued.form}) &nbsp;·&nbsp; ID: <strong style={{ letterSpacing:'1px', color:'var(--gold)' }}>{issued.id}</strong>
                            </div>
                            <div style={{ fontSize:'.8rem', color:'var(--text-dim)', marginTop:'2px' }}>
                                Hand this Admission ID to the student. They will need it to create a portal account.
                            </div>
                            <button className="btn btn-sm btn-outline" style={{ alignSelf:'flex-start', marginTop:'8px' }} onClick={() => setIssued(null)}>Dismiss</button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display:'flex', gap:'4px', marginBottom:'1.5rem', background:'var(--bg-alt)', padding:'4px', borderRadius:'var(--r)', width:'fit-content' }}>
                        {[
                            { key:'admissions', label:'Admissions Register', icon:<FaIdCard /> },
                            { key:'roster',     label:'Student Roster',      icon:<FaUsers /> },
                            { key:'enrolment',  label:'Class Enrolment',     icon:<FaClipboardList /> },
                        ].map(t => (
                            <button key={t.key} className={`tab-btn ${tab === t.key ? 'act' : ''}`} onClick={() => setTab(t.key)}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Admissions Register ── */}
                    {tab === 'admissions' && (
                        <div className="d-card">
                            <div className="d-card-title" style={{ justifyContent:'space-between', display:'flex', alignItems:'center', flexWrap:'wrap', gap:'.75rem' }}>
                                <span><FaIdCard /> Admissions Register ({admissions.length})</span>
                                <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
                                    <div style={{ position:'relative' }}>
                                        <FaSearch style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'.8rem', pointerEvents:'none' }} />
                                        <input value={search} onChange={e => setSearch(e.target.value)}
                                            placeholder="Search name or ID…"
                                            style={{ paddingLeft:'30px', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'7px 10px 7px 30px', color:'var(--text)', fontFamily:'inherit', fontSize:'.84rem', outline:'none', width:'200px' }} />
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(p => !p); setIssued(null); }}>
                                        <FaPlus /> {showForm ? 'Cancel' : 'Issue New ID'}
                                    </button>
                                </div>
                            </div>

                            {/* Issue new student form */}
                            {showForm && (
                                <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'1.25rem', marginBottom:'1.25rem' }}>
                                    <h4 style={{ fontWeight:700, marginBottom:'1rem', fontSize:'.95rem', color:'var(--gold)' }}><FaPlus style={{ marginRight:'6px' }} />Issue Admission ID to New Student</h4>
                                    <form onSubmit={issueId} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                                        <div className="fg"><label>Student Full Name</label><input required value={newStudent.name} onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))} /></div>
                                        <div className="fg"><label>Form/Class</label>
                                            <select value={newStudent.form} onChange={e => setNewStudent(p => ({ ...p, form: e.target.value }))}>
                                                {FORMS.map(f => <option key={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div className="fg"><label>Date of Birth</label><input type="date" required value={newStudent.dob} onChange={e => setNewStudent(p => ({ ...p, dob: e.target.value }))} /></div>
                                        <div className="fg"><label>Parent / Guardian Name</label><input required value={newStudent.guardian} onChange={e => setNewStudent(p => ({ ...p, guardian: e.target.value }))} /></div>
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ gridColumn:'1/-1', justifySelf:'flex-start' }}>
                                            <FaIdCard /> Generate &amp; Issue ID
                                        </button>
                                    </form>
                                </div>
                            )}

                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>Admission ID</th>
                                        <th>Student Name</th>
                                        <th>Form</th>
                                        <th>Guardian</th>
                                        <th>Status</th>
                                        <th>Student ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(a => (
                                        <tr key={a.admissionId}>
                                            <td><span className="tag tag-blue" style={{ fontFamily:'monospace', letterSpacing:'.5px', fontSize:'.78rem' }}>{a.admissionId}</span></td>
                                            <td style={{ fontWeight:600 }}>{a.name}</td>
                                            <td style={{ color:'var(--text-muted)' }}>{a.form}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>{a.guardian}</td>
                                            <td>
                                                {a.registered
                                                    ? <span style={{ fontSize:'.76rem', padding:'3px 10px', borderRadius:'9999px', background:'rgba(34,197,94,.12)', color:'#86efac', border:'1px solid rgba(34,197,94,.3)', fontWeight:700 }}>Registered</span>
                                                    : <span style={{ fontSize:'.76rem', padding:'3px 10px', borderRadius:'9999px', background:'rgba(234,179,8,.1)', color:'#fde047', border:'1px solid rgba(234,179,8,.3)', fontWeight:700 }}>Pending</span>
                                                }
                                            </td>
                                            <td style={{ color:'var(--text-dim)', fontSize:'.84rem' }}>{a.studentId || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Student Roster ── */}
                    {tab === 'roster' && (
                        <div className="d-card">
                            <div className="d-card-title"><FaUsers /> Registered Student Accounts ({students.length})</div>
                            <table className="portal-table">
                                <thead><tr><th>Name</th><th>Student ID</th><th>Form</th><th>Email</th><th>House</th><th>Guardian</th></tr></thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.username}>
                                            <td style={{ fontWeight:600 }}>{s.name}</td>
                                            <td><span className="tag tag-green">{s.studentId}</span></td>
                                            <td style={{ color:'var(--text-muted)' }}>{s.form}</td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{s.email}</td>
                                            <td style={{ color:'var(--text-muted)' }}>{s.house}</td>
                                            <td style={{ color:'var(--text-dim)', fontSize:'.83rem' }}>{s.guardian || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Class Enrolment ── */}
                    {tab === 'enrolment' && (
                        <div className="d-card">
                            <div className="d-card-title"><FaClipboardList /> Class Enrolment Overview</div>
                            <table className="portal-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Form</th>
                                        {SUBJECTS.slice(0,6).map(s => <th key={s.id}>{s.id}</th>)}
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => {
                                        const enrolled = ENROLLED_CLASSES[s.studentId] || [];
                                        return (
                                            <tr key={s.username}>
                                                <td style={{ fontWeight:600 }}>{s.name}</td>
                                                <td style={{ color:'var(--text-muted)' }}>{s.form}</td>
                                                {SUBJECTS.slice(0,6).map(sub => (
                                                    <td key={sub.id} style={{ textAlign:'center' }}>
                                                        {enrolled.includes(sub.id)
                                                            ? <FaCheckCircle style={{ color:'var(--green-light)', fontSize:'.85rem' }} />
                                                            : <span style={{ color:'var(--text-dim)' }}>—</span>
                                                        }
                                                    </td>
                                                ))}
                                                <td><span className="tag tag-gold">{enrolled.length}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <p style={{ marginTop:'1rem', fontSize:'.8rem', color:'var(--text-dim)' }}>
                                Showing first 6 subjects. Students may register/drop subjects via their own portal.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
