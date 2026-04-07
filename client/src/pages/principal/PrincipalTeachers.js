import React, { useState } from 'react';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaChalkboardTeacher, FaSearch, FaEnvelope, FaPhone } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { USERS, SUBJECTS } from '../../data/mockData';

export default function PrincipalTeachers() {
    const teachers = USERS.filter(u => u.role === 'teacher');
    const [search, setSearch] = useState('');

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase()) ||
        t.staffId?.toLowerCase().includes(search.toLowerCase())
    );

    // Build subject → teacher map for coverage overview
    const covered = new Set(teachers.map(t => t.subject));
    const uncovered = SUBJECTS.filter(s => !covered.has(s.name));

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Teachers</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            Teaching Staff
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                            {teachers.length} teachers · Sierra Leone Grammar School
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="dash-stats" style={{ marginBottom:'2rem' }}>
                        <div className="ds-card">
                            <div className="ds-icon blue"><FaChalkboardTeacher /></div>
                            <div className="ds-info"><h3>{teachers.length}</h3><span>Teaching Staff</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon green"><FaChalkboardTeacher /></div>
                            <div className="ds-info"><h3>{covered.size}</h3><span>Subjects Covered</span></div>
                        </div>
                        <div className="ds-card">
                            <div className="ds-icon gold"><FaChalkboardTeacher /></div>
                            <div className="ds-info"><h3>{uncovered.length}</h3><span>Vacancies</span></div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                        <div style={{ position:'relative' }}>
                            <FaSearch style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'.85rem' }} />
                            <input
                                placeholder="Search by name, subject, or staff ID…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft:'36px', width:'100%', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'9px 12px 9px 36px', color:'var(--text)', outline:'none', fontSize:'.87rem', boxSizing:'border-box' }}
                            />
                        </div>
                    </div>

                    {/* Teachers table */}
                    <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                        <div className="d-card-title"><FaChalkboardTeacher /> Staff Directory ({filtered.length})</div>
                        <table className="portal-table">
                            <thead>
                                <tr><th>Name</th><th>Subject</th><th>Staff ID</th><th>Qualification</th><th>Email</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-dim)', padding:'2rem' }}>No staff found</td></tr>
                                ) : filtered.map(t => (
                                    <tr key={t.username}>
                                        <td style={{ fontWeight:600 }}>{t.name}</td>
                                        <td style={{ color:'var(--text-muted)' }}>{t.subject}</td>
                                        <td><span className="tag tag-gold">{t.staffId}</span></td>
                                        <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{t.qualification}</td>
                                        <td>
                                            <a href={`mailto:${t.email}`} style={{ color:'var(--gold)', fontSize:'.83rem', display:'flex', alignItems:'center', gap:'5px', textDecoration:'none' }}>
                                                <FaEnvelope style={{ fontSize:'.7rem' }} />{t.email}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Subject vacancy table */}
                    {uncovered.length > 0 && (
                        <div className="d-card">
                            <div className="d-card-title" style={{ color:'#fbbf24' }}>Subjects Without Assigned Teacher ({uncovered.length})</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'.5rem', marginTop:'.5rem' }}>
                                {uncovered.map(s => (
                                    <span key={s.id} style={{ padding:'4px 12px', background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:'999px', fontSize:'.81rem', color:'#fbbf24' }}>
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
