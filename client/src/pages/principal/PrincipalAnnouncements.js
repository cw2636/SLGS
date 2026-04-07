import React, { useState } from 'react';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaBell, FaPlus, FaCheck, FaTrash } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { ANNOUNCEMENTS } from '../../data/mockData';

const CATEGORIES = ['General','Events','Examinations','Sports','Facilities','Academic','Health'];

export default function PrincipalAnnouncements() {
    const [announcements, setAnn] = useState(ANNOUNCEMENTS);
    const [newAnn, setNewAnn] = useState({ title:'', body:'', category:'General' });
    const [showForm, setShowForm] = useState(false);
    const [saved, setSaved] = useState(false);
    const [filterCat, setFilter] = useState('All');

    const addAnn = (e) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        setAnn(p => [{ id: Date.now(), date: today, ...newAnn }, ...p]);
        setNewAnn({ title:'', body:'', category:'General' });
        setShowForm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const remove = (id) => setAnn(p => p.filter(a => a.id !== id));

    const catColors = {
        General:'rgba(148,163,184,.15)',Examinations:'rgba(239,68,68,.12)',
        Events:'rgba(168,85,247,.12)',Sports:'rgba(34,197,94,.12)',
        Facilities:'rgba(59,130,246,.12)',Academic:'rgba(201,162,39,.12)',Health:'rgba(251,146,60,.12)',
    };
    const catText = {
        General:'#94a3b8',Examinations:'#fca5a5',Events:'#d8b4fe',
        Sports:'#86efac',Facilities:'#93c5fd',Academic:'var(--gold)',Health:'#fdba74',
    };

    const filtered = filterCat === 'All' ? announcements : announcements.filter(a => a.category === filterCat);

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Announcements</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                                School Announcements
                            </h2>
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                                {announcements.length} announcements published
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowForm(p => !p)}>
                            <FaPlus /> {showForm ? 'Cancel' : 'New Announcement'}
                        </button>
                    </div>

                    {/* Success banner */}
                    {saved && (
                        <div style={{ marginBottom:'1rem', padding:'.75rem 1rem', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.87rem' }}>
                            <FaCheck style={{ marginRight:'6px' }} /> Announcement published successfully.
                        </div>
                    )}

                    {/* New announcement form */}
                    {showForm && (
                        <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                            <div className="d-card-title"><FaPlus /> New Announcement</div>
                            <form onSubmit={addAnn} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem' }}>
                                    <div className="fg">
                                        <label>Title *</label>
                                        <input required value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title" />
                                    </div>
                                    <div className="fg">
                                        <label>Category</label>
                                        <select value={newAnn.category} onChange={e => setNewAnn(p => ({ ...p, category: e.target.value }))}
                                            style={{ background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 12px', color:'var(--text)', outline:'none', width:'100%' }}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="fg">
                                    <label>Body *</label>
                                    <textarea required rows={4} value={newAnn.body} onChange={e => setNewAnn(p => ({ ...p, body: e.target.value }))}
                                        placeholder="Write your announcement…"
                                        style={{ resize:'vertical', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 12px', color:'var(--text)', fontFamily:'inherit', fontSize:'.87rem', outline:'none', width:'100%', boxSizing:'border-box' }} />
                                </div>
                                <div style={{ display:'flex', gap:'.75rem' }}>
                                    <button type="submit" className="btn btn-primary"><FaCheck /> Publish</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Category filter tabs */}
                    <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
                        {['All', ...CATEGORIES].map(c => (
                            <button key={c} className={`tab-btn ${filterCat === c ? 'act' : ''}`}
                                style={{ fontSize:'.78rem', padding:'5px 12px' }}
                                onClick={() => setFilter(c)}>{c}</button>
                        ))}
                    </div>

                    {/* Announcements list */}
                    <div className="d-card">
                        <div className="d-card-title"><FaBell /> {filterCat === 'All' ? 'All' : filterCat} Announcements ({filtered.length})</div>
                        {filtered.length === 0 ? (
                            <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-dim)' }}>No announcements in this category</div>
                        ) : filtered.map(a => (
                            <div key={a.id} style={{ padding:'1rem 0', borderBottom:'1px solid var(--border)', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                                <div style={{ flex:1 }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px', flexWrap:'wrap', gap:'.4rem' }}>
                                        <div style={{ fontWeight:700, fontSize:'.95rem' }}>{a.title}</div>
                                        <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                                            <span style={{ fontSize:'.73rem', padding:'2px 9px', borderRadius:'999px',
                                                background: catColors[a.category] || catColors.General,
                                                color: catText[a.category] || catText.General,
                                                border:`1px solid ${catText[a.category] || catText.General}33` }}>
                                                {a.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize:'.78rem', color:'var(--text-muted)', marginBottom:'6px' }}>{a.date}</div>
                                    {a.body && <div style={{ fontSize:'.85rem', color:'var(--text-dim)', lineHeight:1.6 }}>{a.body}</div>}
                                </div>
                                <button onClick={() => remove(a.id)} title="Delete"
                                    style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', padding:'4px', borderRadius:'4px', flexShrink:0 }}>
                                    <FaTrash style={{ fontSize:'.8rem' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
