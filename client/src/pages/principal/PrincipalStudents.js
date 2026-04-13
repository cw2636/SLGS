import React, { useState } from 'react';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaUsers, FaSearch, FaChevronDown, FaChevronRight, FaCheckCircle, FaUserGraduate } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { CLASS_SECTIONS, CLASS_ROSTER, ADMITTED_STUDENTS, FINANCIAL_ACCOUNTS, HOLDS } from '../../data/mockData';

const HOUSE_COLORS = {
    Primus:'#ef4444', Secundus:'#3b82f6', Tertius:'#22c55e',
    Quartius:'#f59e0b', Quintus:'#8b5cf6',
};

export default function PrincipalStudents() {
    const [expandedForm, setExpandedForm]   = useState('SS 3');
    const [activeSection, setActiveSection] = useState('SS 3A');
    const [search, setSearch]               = useState('');
    const [viewMode, setViewMode]           = useState('roster'); // roster | admissions

    const forms = Object.keys(CLASS_SECTIONS);

    const allStudents = Object.entries(CLASS_ROSTER).flatMap(([sec, students]) =>
        students.map(s => ({ ...s, classSection: sec }))
    );

    const searchResults = search.length > 1
        ? allStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
        : null;

    const sectionStudents = CLASS_ROSTER[activeSection] || [];
    const totalEnrolled   = Object.values(CLASS_ROSTER).reduce((a, s) => a + s.length, 0);
    const withAccounts    = Object.values(CLASS_ROSTER).flat().filter(s => s.hasAccount).length;
    const holdsCount      = HOLDS.filter(h => h.active).length;

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Student Registry</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <MdAdminPanelSettings style={{ color:'var(--gold)' }} /> Administration
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
                        <div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>Class Roster &amp; Student Registry</h2>
                            <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>Sierra Leone Grammar School · Academic Year 2025/2026</p>
                        </div>
                        <div style={{ display:'flex', gap:'.4rem' }}>
                            <button className={`tab-btn ${viewMode==='roster'?'act':''}`} onClick={() => setViewMode('roster')}><FaUsers /> Class Roster</button>
                            <button className={`tab-btn ${viewMode==='admissions'?'act':''}`} onClick={() => setViewMode('admissions')}><FaUserGraduate /> Admissions</button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
                        {[
                            { label:'Total Enrolled',      val: totalEnrolled, color:'#93c5fd', sub:'across all sections' },
                            { label:'Portal Accounts',     val: withAccounts,  color:'#86efac', sub:'active registrations' },
                            { label:'Classes / Sections',  val: Object.keys(CLASS_ROSTER).length, color:'var(--gold)', sub:`${forms.length} year groups` },
                            { label:'Account Holds',       val: holdsCount, color: holdsCount>0?'#f87171':'#86efac', sub:'financial or academic' },
                        ].map(c => (
                            <div key={c.label} className="ds-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:'.3rem' }}>
                                <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:"'Playfair Display',serif", color:c.color }}>{c.val}</div>
                                <div style={{ fontWeight:600, fontSize:'.87rem' }}>{c.label}</div>
                                <div style={{ fontSize:'.76rem', color:'var(--text-dim)' }}>{c.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                        <div style={{ position:'relative' }}>
                            <FaSearch style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'.85rem' }} />
                            <input
                                placeholder="Search any student by name across all classes…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ width:'100%', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'11px 14px 11px 40px', color:'var(--text)', outline:'none', fontSize:'.9rem', boxSizing:'border-box' }}
                            />
                        </div>
                        {searchResults && (
                            <div style={{ marginTop:'1rem' }}>
                                <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginBottom:'.75rem' }}>{searchResults.length} result{searchResults.length!==1?'s':''} for "{search}"</div>
                                {searchResults.map(s => {
                                    const hColor = HOUSE_COLORS[s.house] || '#64748b';
                                    const formKey = s.classSection.replace(/[AB C]/g,'').trim();
                                    return (
                                        <div key={s.id} onClick={() => { setExpandedForm(s.classSection.split(' ').slice(0,-1).join(' ')||s.classSection); setActiveSection(s.classSection); setSearch(''); setViewMode('roster'); }}
                                            style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.65rem .75rem', borderRadius:'var(--r-sm)', background:'rgba(255,255,255,.03)', marginBottom:'.4rem', cursor:'pointer', border:'1px solid var(--border)' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                                <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:`${hColor}22`, border:`2px solid ${hColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:700, color:hColor }}>
                                                    {s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight:600, fontSize:'.9rem' }}>{s.name}</div>
                                                    <div style={{ fontSize:'.77rem', color:'var(--text-muted)' }}>{s.classSection} · {s.house} House</div>
                                                </div>
                                            </div>
                                            <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                                                {s.hasAccount && <FaCheckCircle style={{ color:'#86efac', fontSize:'.8rem' }} />}
                                                <span style={{ fontSize:'.75rem', color:'var(--gold)' }}>{s.classSection}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {viewMode === 'roster' && (
                        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'1.5rem' }}>
                            {/* Left nav */}
                            <div>
                                <div style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'.75rem', paddingLeft:'.25rem' }}>Year Groups</div>
                                {forms.map(form => {
                                    const sections   = CLASS_SECTIONS[form];
                                    const isExpanded = expandedForm === form;
                                    const formTotal  = sections.reduce((a,sec)=>a+(CLASS_ROSTER[sec]?.length||0),0);
                                    return (
                                        <div key={form} style={{ marginBottom:'.35rem' }}>
                                            <div onClick={() => setExpandedForm(isExpanded?null:form)}
                                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.6rem .85rem', borderRadius:'var(--r-sm)', cursor:'pointer', background:isExpanded?'rgba(201,162,39,.1)':'rgba(255,255,255,.03)', border:`1.5px solid ${isExpanded?'rgba(201,162,39,.25)':'var(--border)'}`, transition:'all .2s' }}>
                                                <div>
                                                    <div style={{ fontWeight:700, fontSize:'.88rem', color:isExpanded?'var(--gold)':'var(--text)' }}>{form}</div>
                                                    <div style={{ fontSize:'.72rem', color:'var(--text-dim)' }}>{formTotal} students · {sections.length} sections</div>
                                                </div>
                                                {isExpanded ? <FaChevronDown style={{ color:'var(--gold)', fontSize:'.75rem' }} /> : <FaChevronRight style={{ color:'var(--text-dim)', fontSize:'.75rem' }} />}
                                            </div>
                                            {isExpanded && (
                                                <div style={{ marginTop:'.25rem', marginLeft:'.75rem' }}>
                                                    {sections.map(sec => {
                                                        const secCount = CLASS_ROSTER[sec]?.length || 0;
                                                        const isActive = activeSection === sec;
                                                        return (
                                                            <div key={sec} onClick={() => setActiveSection(sec)}
                                                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.5rem .75rem', borderRadius:'var(--r-sm)', cursor:'pointer', marginBottom:'.2rem', background:isActive?'var(--gold)':'rgba(255,255,255,.02)', color:isActive?'#05100a':'var(--text-muted)', fontWeight:isActive?700:500, fontSize:'.85rem', transition:'all .15s' }}>
                                                                <span>{sec}</span>
                                                                <span style={{ fontSize:'.75rem', opacity:.8 }}>{secCount}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right — section roster cards */}
                            <div>
                                <div className="d-card">
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.75rem' }}>
                                        <div>
                                            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.25rem', fontWeight:700 }}>{activeSection}</div>
                                            <div style={{ fontSize:'.83rem', color:'var(--text-muted)', marginTop:'2px' }}>
                                                {sectionStudents.length} students enrolled · {sectionStudents.filter(s=>s.hasAccount).length} with portal accounts
                                            </div>
                                        </div>
                                        <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                                            {Object.keys(HOUSE_COLORS).map(h => {
                                                const c = sectionStudents.filter(s=>s.house===h).length;
                                                return c>0? (
                                                    <span key={h} style={{ fontSize:'.73rem', padding:'2px 9px', borderRadius:'999px', background:`${HOUSE_COLORS[h]}20`, color:HOUSE_COLORS[h], border:`1px solid ${HOUSE_COLORS[h]}44` }}>
                                                        {h}: {c}
                                                    </span>
                                                ):null;
                                            })}
                                        </div>
                                    </div>

                                    {/* Student card grid */}
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:'1rem' }}>
                                        {sectionStudents.map(s => {
                                            const hColor = HOUSE_COLORS[s.house] || '#94a3b8';
                                            const acct   = s.hasAccount ? FINANCIAL_ACCOUNTS[s.studentId] : null;
                                            const hold   = HOLDS.filter(h => h.studentId===s.studentId && h.active);
                                            return (
                                                <div key={s.id} style={{ borderRadius:'var(--r)', border:'1.5px solid var(--border)', background:'var(--bg-alt)', overflow:'hidden', transition:'border-color .2s, transform .15s' }}
                                                    onMouseEnter={e=>{e.currentTarget.style.borderColor=hColor+'66'; e.currentTarget.style.transform='translateY(-2px)';}}
                                                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none';}}>
                                                    <div style={{ height:'4px', background:hColor }} />
                                                    <div style={{ padding:'.9rem' }}>
                                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.6rem' }}>
                                                            <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`${hColor}22`, border:`2px solid ${hColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.9rem', color:hColor }}>
                                                                {s.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
                                                            </div>
                                                            {s.hasAccount && (
                                                                hold.length>0
                                                                    ? <span style={{ fontSize:'.67rem', padding:'1px 7px', borderRadius:'999px', background:'rgba(239,68,68,.12)', color:'#f87171', border:'1px solid rgba(239,68,68,.3)', fontWeight:700 }}>HOLD</span>
                                                                    : <FaCheckCircle style={{ color:'#86efac', fontSize:'.85rem' }} title="Portal account active" />
                                                            )}
                                                        </div>
                                                        <div style={{ fontWeight:700, fontSize:'.9rem', lineHeight:1.3, marginBottom:'2px' }}>{s.name}</div>
                                                        <div style={{ fontSize:'.74rem', color:hColor }}>{s.house} House</div>
                                                        {s.hasAccount && (
                                                            <div style={{ marginTop:'.6rem', paddingTop:'.6rem', borderTop:'1px solid var(--border)' }}>
                                                                <div style={{ fontSize:'.72rem', color:'var(--text-dim)' }}>{s.studentId}</div>
                                                                {acct && (
                                                                    <div style={{ fontSize:'.72rem', marginTop:'2px', color:acct.balance>0?'#f87171':'#86efac', fontWeight:600 }}>
                                                                        {acct.balance>0?`Owes SLL ${acct.balance.toLocaleString()}`:'Fees Cleared ✓'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {!s.hasAccount && (
                                                            <div style={{ marginTop:'.6rem', paddingTop:'.6rem', borderTop:'1px solid var(--border)', fontSize:'.71rem', color:'var(--text-dim)' }}>No portal account</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {sectionStudents.length===0 && (
                                        <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-dim)' }}>No students enrolled in {activeSection}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode==='admissions' && (
                        <div className="d-card">
                            <div className="d-card-title"><FaUserGraduate /> Admissions Pipeline ({ADMITTED_STUDENTS.length})</div>
                            <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
                                {[
                                    { label:'Total Issued',  val:ADMITTED_STUDENTS.length,                        color:'var(--gold)' },
                                    { label:'Registered',    val:ADMITTED_STUDENTS.filter(a=>a.registered).length, color:'#86efac' },
                                    { label:'Pending',       val:ADMITTED_STUDENTS.filter(a=>!a.registered).length,color:'#fbbf24' },
                                ].map(c=>(
                                    <div key={c.label} style={{ textAlign:'center' }}>
                                        <div style={{ fontSize:'2rem', fontWeight:800, color:c.color, fontFamily:"'Playfair Display',serif" }}>{c.val}</div>
                                        <div style={{ fontSize:'.8rem', color:'var(--text-muted)' }}>{c.label}</div>
                                    </div>
                                ))}
                            </div>
                            <table className="portal-table">
                                <thead><tr><th>Admission ID</th><th>Name</th><th>Form</th><th>Guardian</th><th>Status</th><th>Student ID</th></tr></thead>
                                <tbody>
                                    {ADMITTED_STUDENTS.map(a=>(
                                        <tr key={a.admissionId}>
                                            <td><span className="tag tag-gold" style={{ fontFamily:'monospace', fontSize:'.77rem' }}>{a.admissionId}</span></td>
                                            <td style={{ fontWeight:600 }}>{a.name}</td>
                                            <td><span className="tag tag-green">{a.form}</span></td>
                                            <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{a.guardian}</td>
                                            <td><span style={{ fontSize:'.76rem', padding:'3px 10px', borderRadius:'9999px', background:a.registered?'rgba(34,197,94,.12)':'rgba(251,191,36,.1)', color:a.registered?'#86efac':'#fbbf24', border:`1px solid ${a.registered?'rgba(34,197,94,.25)':'rgba(251,191,36,.25)'}` }}>{a.registered?'Registered':'Pending'}</span></td>
                                            <td style={{ color:'var(--text-dim)', fontSize:'.83rem' }}>{a.studentId||'—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
