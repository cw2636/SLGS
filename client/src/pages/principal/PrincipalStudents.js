import React, { useState } from 'react';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { USERS, ADMITTED_STUDENTS } from '../../data/mockData';

export default function PrincipalStudents() {
    const students = USERS.filter(u => u.role === 'student');
    const [search, setSearch] = useState('');
    const [formFilter, setForm] = useState('All');

    const forms = ['All', 'JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                            s.studentId?.toLowerCase().includes(search.toLowerCase());
        const matchForm   = formFilter === 'All' || s.form === formFilter;
        return matchSearch && matchForm;
    });

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Students</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            Enrolled Students
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                            {students.length} registered students · Sierra Leone Grammar School
                        </p>
                    </div>

                    {/* Summary cards */}
                    <div className="dash-stats" style={{ marginBottom:'2rem' }}>
                        {forms.slice(1).map(f => {
                            const count = students.filter(s => s.form === f).length;
                            return (
                                <div key={f} className="ds-card" style={{ cursor:'pointer' }} onClick={() => setForm(f)}>
                                    <div className="ds-info">
                                        <h3>{count}</h3>
                                        <span>{f}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                            <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
                                <FaSearch style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'.85rem' }} />
                                <input
                                    placeholder="Search by name or student ID…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft:'36px', width:'100%', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'9px 12px 9px 36px', color:'var(--text)', outline:'none', fontSize:'.87rem' }}
                                />
                            </div>
                            <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                                {forms.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setForm(f)}
                                        className={`tab-btn ${formFilter === f ? 'act' : ''}`}
                                        style={{ fontSize:'.78rem', padding:'5px 12px' }}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Students table */}
                    <div className="d-card">
                        <div className="d-card-title"><FaGraduationCap /> Students ({filtered.length})</div>
                        <table className="portal-table">
                            <thead>
                                <tr>
                                    <th>Name</th><th>Form</th><th>House</th>
                                    <th>Student ID</th><th>Email</th><th>Guardian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-dim)', padding:'2rem' }}>No students found</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.username}>
                                        <td style={{ fontWeight:600 }}>{s.name}</td>
                                        <td><span className="tag tag-green">{s.form}</span></td>
                                        <td style={{ color:'var(--text-muted)' }}>{s.house}</td>
                                        <td><span className="tag tag-gold">{s.studentId}</span></td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{s.email}</td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{s.guardian}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Admissions pipeline */}
                    <div className="d-card" style={{ marginTop:'1.5rem' }}>
                        <div className="d-card-title"><FaFilter /> Admissions Pipeline</div>
                        <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                            <div style={{ textAlign:'center' }}>
                                <div style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--gold)' }}>{ADMITTED_STUDENTS.length}</div>
                                <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>IDs Issued</div>
                            </div>
                            <div style={{ textAlign:'center' }}>
                                <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#86efac' }}>{ADMITTED_STUDENTS.filter(a => a.registered).length}</div>
                                <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>Registered</div>
                            </div>
                            <div style={{ textAlign:'center' }}>
                                <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#fbbf24' }}>{ADMITTED_STUDENTS.filter(a => !a.registered).length}</div>
                                <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>Pending Registration</div>
                            </div>
                        </div>
                        <table className="portal-table">
                            <thead><tr><th>Name</th><th>Form</th><th>Admission ID</th><th>Status</th></tr></thead>
                            <tbody>
                                {ADMITTED_STUDENTS.map(a => (
                                    <tr key={a.admissionId}>
                                        <td style={{ fontWeight:600 }}>{a.name}</td>
                                        <td style={{ color:'var(--text-muted)' }}>{a.form}</td>
                                        <td><span className="tag tag-gold" style={{ fontFamily:'monospace', fontSize:'.78rem' }}>{a.admissionId}</span></td>
                                        <td>
                                            <span style={{ fontSize:'.78rem', padding:'2px 10px', borderRadius:'999px',
                                                background: a.registered ? 'rgba(34,197,94,.12)' : 'rgba(251,191,36,.1)',
                                                color: a.registered ? '#86efac' : '#fbbf24',
                                                border: `1px solid ${a.registered ? 'rgba(34,197,94,.25)' : 'rgba(251,191,36,.25)'}` }}>
                                                {a.registered ? 'Registered' : 'Pending'}
                                            </span>
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
