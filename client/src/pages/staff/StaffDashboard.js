import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaIdCard, FaUsers, FaCheckCircle, FaPlus, FaClipboardList, FaBell, FaSearch,
         FaMoneyBillWave, FaLock, FaLockOpen, FaGift, FaHistory, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa';
import { MdPending } from 'react-icons/md';
import { ADMITTED_STUDENTS, USERS, ENROLLED_CLASSES, SUBJECTS, ANNOUNCEMENTS,
         FINANCIAL_ACCOUNTS, HOLDS, PAYMENTS, FINANCIAL_AID } from '../../data/mockData';

const SLL = (n) => `SLL ${Number(n).toLocaleString()}`;
const PAYMENT_METHODS = ['Bank Transfer (Guarantee Trust)','Bank Transfer (Rokel Commercial)','Mobile Money (Orange Sierra Leone)','Mobile Money (Africell)','Cash (School Bursar)'];
const AID_TYPES = ['Merit Scholarship','Welfare Bursary','Anglican Diocese Grant','SLGSAANA Scholarship','Government Bursary'];

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
    const [tab, setTab]               = useState(urlTab || 'admissions');

    // Finance state
    const [finAccounts, setFinAccounts]     = useState(FINANCIAL_ACCOUNTS);
    const [holds, setHolds]                 = useState(HOLDS);
    const [payments, setPayments]           = useState(PAYMENTS);
    const [finAid, setFinAid]               = useState(FINANCIAL_AID);
    const [selectedStudentId, setSelected]  = useState(null);
    const [finTab, setFinTab]               = useState('accounts'); // accounts | holds | payments | aid
    const [holdForm, setHoldForm]           = useState({ reason:'', type:'Financial', consequence:'' });
    const [payForm, setPayForm]             = useState({ amount:'', method:PAYMENT_METHODS[0], reference:'', description:'' });
    const [aidForm, setAidForm]             = useState({ type:AID_TYPES[0], amount:'', description:'', academicYear:'2025/2026' });
    const [finSuccess, setFinSuccess]       = useState('');

    const showFin = (msg) => { setFinSuccess(msg); setTimeout(() => setFinSuccess(''), 3500); };

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
                    <div style={{ display:'flex', gap:'4px', marginBottom:'1.5rem', background:'var(--bg-alt)', padding:'4px', borderRadius:'var(--r)', width:'fit-content', flexWrap:'wrap' }}>
                        {[
                            { key:'admissions', label:'Admissions Register', icon:<FaIdCard /> },
                            { key:'roster',     label:'Student Roster',      icon:<FaUsers /> },
                            { key:'enrolment',  label:'Class Enrolment',     icon:<FaClipboardList /> },
                            { key:'finance',    label:'Student Finance',     icon:<FaMoneyBillWave /> },
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

                    {/* ── Student Finance ── */}
                    {tab === 'finance' && (() => {
                        const students = USERS.filter(u => u.role === 'student');
                        const sel      = selectedStudentId;
                        const selAcct  = sel ? finAccounts[sel] : null;
                        const selHolds = holds.filter(h => h.studentId === sel && h.active);
                        const selPay   = payments.filter(p => p.studentId === sel).sort((a,b) => new Date(b.date)-new Date(a.date));
                        const selAid   = finAid.filter(a => a.studentId === sel);
                        const totalOut = Object.values(finAccounts).reduce((a,ac)=>a+ac.balance,0);
                        const totalCol = payments.reduce((a,p)=>a+p.amount,0);
                        const activeHolds = holds.filter(h=>h.active).length;

                        const placeHold = (e) => {
                            e.preventDefault();
                            const newHold = { id:Date.now(), studentId:sel, ...holdForm, placedBy:user?.name||'Secretary', placedDate:new Date().toISOString().split('T')[0], resolvedDate:null, active:true };
                            setHolds(p=>[...p,newHold]);
                            setHoldForm({ reason:'', type:'Financial', consequence:'' });
                            showFin('Hold placed successfully.');
                        };
                        const removeHold = (id) => { setHolds(p=>p.map(h=>h.id===id?{...h,active:false,resolvedDate:new Date().toISOString().split('T')[0]}:h)); showFin('Hold removed.'); };
                        const recordPayment = (e) => {
                            e.preventDefault();
                            const amt = Number(payForm.amount);
                            const payment = { id:Date.now(), studentId:sel, amount:amt, method:payForm.method, reference:payForm.reference||`REF-${Date.now()}`, date:new Date().toISOString().split('T')[0], recordedBy:user?.name||'Secretary', description:payForm.description };
                            setPayments(p=>[payment,...p]);
                            setFinAccounts(prev => {
                                const acct = prev[sel];
                                if(!acct) return prev;
                                const newBal = Math.max(0, acct.balance - amt);
                                return { ...prev, [sel]:{ ...acct, totalPaid:acct.totalPaid+amt, balance:newBal, status:newBal===0?'clear':'outstanding' } };
                            });
                            setPayForm({ amount:'', method:PAYMENT_METHODS[0], reference:'', description:'' });
                            showFin(`Payment of ${SLL(amt)} recorded.`);
                        };
                        const awardAid = (e) => {
                            e.preventDefault();
                            const amt = Number(aidForm.amount);
                            const award = { id:Date.now(), studentId:sel, type:aidForm.type, amount:amt, academicYear:aidForm.academicYear, status:'Active', description:aidForm.description, awardedBy:user?.name||'Secretary', awardedDate:new Date().toISOString().split('T')[0], renewable:false };
                            setFinAid(p=>[...p,award]);
                            setFinAccounts(prev => {
                                const acct = prev[sel];
                                if(!acct) return prev;
                                const newBal = Math.max(0, acct.balance - amt);
                                return { ...prev, [sel]:{ ...acct, scholarshipApplied:(acct.scholarshipApplied||0)+amt, balance:newBal, status:newBal===0?'clear':'outstanding' } };
                            });
                            setAidForm({ type:AID_TYPES[0], amount:'', description:'', academicYear:'2025/2026' });
                            showFin(`${aidForm.type} of ${SLL(amt)} awarded.`);
                        };

                        return (
                            <div>
                                {finSuccess && (
                                    <div style={{ marginBottom:'1rem', padding:'.75rem 1rem', background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.87rem', display:'flex', alignItems:'center', gap:'8px' }}>
                                        <FaCheckCircle /> {finSuccess}
                                    </div>
                                )}
                                {/* Finance summary */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
                                    {[
                                        { label:'Total Outstanding', val:SLL(totalOut), color:'#f87171', icon:<FaExclamationTriangle /> },
                                        { label:'Total Collected',   val:SLL(totalCol), color:'#86efac', icon:<FaCheckCircle /> },
                                        { label:'Active Holds',      val:activeHolds,   color:activeHolds>0?'#f87171':'#86efac', icon:<FaLock /> },
                                        { label:'Aid Packages',      val:finAid.filter(a=>a.status==='Active').length, color:'var(--gold)', icon:<FaGift /> },
                                    ].map(c=>(
                                        <div key={c.label} className="ds-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:'.3rem' }}>
                                            <div style={{ color:c.color, fontSize:'1rem' }}>{c.icon}</div>
                                            <div style={{ fontSize:'1.4rem', fontWeight:800, fontFamily:"'Playfair Display',serif", color:c.color }}>{c.val}</div>
                                            <div style={{ fontSize:'.76rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>{c.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'1.5rem' }}>
                                    {/* Student list */}
                                    <div>
                                        <div style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'.75rem' }}>Select Student</div>
                                        {students.map(s => {
                                            const acct = finAccounts[s.studentId];
                                            const sHolds = holds.filter(h=>h.studentId===s.studentId&&h.active);
                                            const isSelected = sel === s.studentId;
                                            return (
                                                <div key={s.studentId} onClick={() => setSelected(s.studentId)}
                                                    style={{ padding:'.75rem', borderRadius:'var(--r-sm)', border:`1.5px solid ${isSelected?'var(--gold)':'var(--border)'}`, background:isSelected?'rgba(201,162,39,.08)':'rgba(255,255,255,.02)', cursor:'pointer', marginBottom:'.5rem', transition:'all .15s' }}>
                                                    <div style={{ fontWeight:700, fontSize:'.9rem' }}>{s.name}</div>
                                                    <div style={{ fontSize:'.76rem', color:'var(--text-muted)', marginTop:'2px' }}>{s.studentId} · {s.form}</div>
                                                    {acct && (
                                                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'.5rem', fontSize:'.77rem' }}>
                                                            <span style={{ color: acct.balance>0 ? '#f87171' : '#86efac', fontWeight:600 }}>
                                                                {acct.balance>0 ? `Owes ${SLL(acct.balance)}` : 'Clear ✓'}
                                                            </span>
                                                            {sHolds.length>0 && <span style={{ color:'#f87171' }}><FaLock style={{ fontSize:'.7rem' }} /> HOLD</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Detail panel */}
                                    <div>
                                        {!sel ? (
                                            <div className="d-card" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px', flexDirection:'column', gap:'1rem', color:'var(--text-dim)' }}>
                                                <FaFileInvoiceDollar style={{ fontSize:'2.5rem' }} />
                                                <div>Select a student to manage their financial account</div>
                                            </div>
                                        ) : (
                                            <div>
                                                {/* Student header */}
                                                <div className="d-card" style={{ marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'.75rem' }}>
                                                    <div>
                                                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:700 }}>
                                                            {students.find(s=>s.studentId===sel)?.name}
                                                        </div>
                                                        <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginTop:'3px' }}>{sel} · {selAcct?.form}</div>
                                                    </div>
                                                    <div style={{ display:'flex', gap:'1.5rem' }}>
                                                        {selAcct && [
                                                            { label:'Charged', val:SLL(selAcct.totalCharged), color:'#93c5fd' },
                                                            { label:'Paid',    val:SLL(selAcct.totalPaid),    color:'#86efac' },
                                                            { label:'Balance', val:SLL(selAcct.balance),      color:selAcct.balance>0?'#f87171':'#86efac' },
                                                        ].map(c=>(
                                                            <div key={c.label} style={{ textAlign:'center' }}>
                                                                <div style={{ fontWeight:800, color:c.color, fontSize:'1.05rem' }}>{c.val}</div>
                                                                <div style={{ fontSize:'.73rem', color:'var(--text-dim)' }}>{c.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Sub-tabs */}
                                                <div style={{ display:'flex', gap:'4px', marginBottom:'1rem', background:'var(--bg-alt)', padding:'4px', borderRadius:'var(--r)', width:'fit-content' }}>
                                                    {['accounts','holds','payments','aid'].map(k=>(
                                                        <button key={k} className={`tab-btn ${finTab===k?'act':''}`} onClick={()=>setFinTab(k)} style={{ fontSize:'.8rem', padding:'5px 12px' }}>
                                                            {k==='accounts'?'Statement':k==='holds'?'Holds':k==='payments'?'Record Payment':'Financial Aid'}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Statement */}
                                                {finTab==='accounts' && selAcct && (
                                                    <div className="d-card">
                                                        <div className="d-card-title"><FaFileInvoiceDollar /> Fee Statement — {selAcct.term}</div>
                                                        {[
                                                            { label:'Term Tuition Fee', val:selAcct.termFee },
                                                            { label:'Exam Fee',          val:selAcct.examFee },
                                                            { label:'Lab / Practical Fee',val:selAcct.labFee },
                                                            { label:'Sports Fee',         val:selAcct.sportsFee },
                                                            { label:'Other',              val:selAcct.otherFees },
                                                        ].map((r,i)=>(
                                                            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'.6rem 0', borderBottom:'1px solid var(--border)', fontSize:'.87rem' }}>
                                                                <span style={{ color:'var(--text-muted)' }}>{r.label}</span>
                                                                <span style={{ fontWeight:600 }}>{SLL(r.val)}</span>
                                                            </div>
                                                        ))}
                                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.7rem 0', borderTop:'2px solid var(--border)', fontWeight:700 }}>
                                                            <span>Total Charged</span><span>{SLL(selAcct.totalCharged)}</span>
                                                        </div>
                                                        {selAcct.scholarshipApplied>0 && (
                                                            <div style={{ display:'flex', justifyContent:'space-between', padding:'.6rem 0', color:'#86efac', fontSize:'.87rem' }}>
                                                                <span><FaGift style={{ marginRight:'5px' }} />Aid Applied</span>
                                                                <span>− {SLL(selAcct.scholarshipApplied)}</span>
                                                            </div>
                                                        )}
                                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.6rem 0', fontSize:'.87rem' }}>
                                                            <span style={{ color:'var(--text-muted)' }}>Total Paid</span>
                                                            <span style={{ color:'#a3e635' }}>− {SLL(selAcct.totalPaid)}</span>
                                                        </div>
                                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.8rem 0', borderTop:'2px solid var(--border)', fontWeight:800, fontSize:'1rem', color:selAcct.balance>0?'#f87171':'#86efac' }}>
                                                            <span>Balance Outstanding</span><span>{SLL(selAcct.balance)}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Holds */}
                                                {finTab==='holds' && (
                                                    <div className="d-card">
                                                        <div className="d-card-title"><FaLock /> Account Holds</div>
                                                        {selHolds.length===0 ? (
                                                            <div style={{ padding:'1rem', color:'#86efac', fontSize:'.87rem' }}><FaCheckCircle style={{ marginRight:'6px' }} /> No active holds on this account.</div>
                                                        ) : selHolds.map(h=>(
                                                            <div key={h.id} style={{ padding:'.85rem', marginBottom:'.75rem', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.25)', borderRadius:'var(--r-sm)' }}>
                                                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight:700, color:'#f87171', fontSize:'.9rem' }}>{h.type} Hold</div>
                                                                        <div style={{ fontSize:'.83rem', color:'var(--text-muted)', margin:'.3rem 0' }}>{h.reason}</div>
                                                                        <div style={{ fontSize:'.8rem', color:'#fca5a5' }}>{h.consequence}</div>
                                                                        <div style={{ fontSize:'.76rem', color:'var(--text-dim)', marginTop:'4px' }}>Placed by {h.placedBy} · {h.placedDate}</div>
                                                                    </div>
                                                                    <button onClick={()=>removeHold(h.id)} className="btn btn-sm btn-outline" style={{ borderColor:'rgba(34,197,94,.3)', color:'#86efac', display:'flex', alignItems:'center', gap:'5px' }}>
                                                                        <FaLockOpen style={{ fontSize:'.8rem' }} /> Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div style={{ marginTop:'1.25rem', borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
                                                            <div style={{ fontWeight:700, marginBottom:'.75rem', fontSize:'.9rem' }}>Place New Hold</div>
                                                            <form onSubmit={placeHold} style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                                                                    <div className="fg"><label>Hold Type</label>
                                                                        <select value={holdForm.type} onChange={e=>setHoldForm(p=>({...p,type:e.target.value}))} style={{ background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'9px 12px', color:'var(--text)', outline:'none', width:'100%' }}>
                                                                            {['Financial','Academic','Administrative','Library','Medical'].map(t=><option key={t}>{t}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="fg"><label>Reason *</label><input required value={holdForm.reason} onChange={e=>setHoldForm(p=>({...p,reason:e.target.value}))} placeholder="Reason for hold" /></div>
                                                                </div>
                                                                <div className="fg"><label>Consequence</label><input value={holdForm.consequence} onChange={e=>setHoldForm(p=>({...p,consequence:e.target.value}))} placeholder="e.g. Results withheld" /></div>
                                                                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start', background:'rgba(239,68,68,.8)', borderColor:'rgba(239,68,68,.5)' }}><FaLock /> Place Hold</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Record Payment */}
                                                {finTab==='payments' && (
                                                    <div className="d-card">
                                                        <div className="d-card-title"><FaMoneyBillWave /> Record Payment</div>
                                                        <form onSubmit={recordPayment} style={{ display:'flex', flexDirection:'column', gap:'.85rem', marginBottom:'1.5rem' }}>
                                                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                                                                <div className="fg"><label>Amount (SLL) *</label><input type="number" required min="1000" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} placeholder="e.g. 500000" /></div>
                                                                <div className="fg"><label>Payment Method *</label>
                                                                    <select value={payForm.method} onChange={e=>setPayForm(p=>({...p,method:e.target.value}))} style={{ background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'9px 12px', color:'var(--text)', outline:'none', width:'100%' }}>
                                                                        {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="fg"><label>Transaction Reference</label><input value={payForm.reference} onChange={e=>setPayForm(p=>({...p,reference:e.target.value}))} placeholder="Bank/mobile money reference" /></div>
                                                            <div className="fg"><label>Description *</label><input required value={payForm.description} onChange={e=>setPayForm(p=>({...p,description:e.target.value}))} placeholder="e.g. Term 2 partial payment" /></div>
                                                            <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }}><FaCheckCircle /> Record Payment</button>
                                                        </form>
                                                        {/* Payment history for selected student */}
                                                        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
                                                            <div style={{ fontWeight:700, fontSize:'.88rem', marginBottom:'.75rem', color:'var(--text-muted)' }}>Payment History ({selPay.length})</div>
                                                            {selPay.length===0 ? <div style={{ color:'var(--text-dim)', fontSize:'.84rem' }}>No payments recorded.</div> : (
                                                                <table className="portal-table">
                                                                    <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Description</th></tr></thead>
                                                                    <tbody>
                                                                        {selPay.map(p=>(
                                                                            <tr key={p.id}>
                                                                                <td style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>{p.date}</td>
                                                                                <td style={{ fontWeight:700, color:'#a3e635' }}>{SLL(p.amount)}</td>
                                                                                <td style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>{p.method}</td>
                                                                                <td><span style={{ fontFamily:'monospace', fontSize:'.77rem', color:'var(--gold)' }}>{p.reference}</span></td>
                                                                                <td style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>{p.description}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Financial Aid */}
                                                {finTab==='aid' && (
                                                    <div className="d-card">
                                                        <div className="d-card-title"><FaGift /> Financial Aid &amp; Bursaries</div>
                                                        {selAid.length===0 ? <div style={{ color:'var(--text-dim)', fontSize:'.84rem', marginBottom:'1rem' }}>No financial aid on record for this student.</div> : selAid.map(a=>(
                                                            <div key={a.id} style={{ padding:'.8rem', borderRadius:'var(--r-sm)', background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.2)', marginBottom:'.75rem' }}>
                                                                <div style={{ display:'flex', justifyContent:'space-between' }}>
                                                                    <div style={{ fontWeight:700 }}>{a.type}</div>
                                                                    <span style={{ color:'#86efac', fontWeight:800 }}>{SLL(a.amount)}</span>
                                                                </div>
                                                                <div style={{ fontSize:'.82rem', color:'var(--text-muted)', marginTop:'3px' }}>{a.description}</div>
                                                                <div style={{ fontSize:'.77rem', color:'var(--text-dim)', marginTop:'3px' }}>Awarded {a.awardedDate} · {a.academicYear} · {a.status}</div>
                                                            </div>
                                                        ))}
                                                        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', marginTop:'.5rem' }}>
                                                            <div style={{ fontWeight:700, fontSize:'.9rem', marginBottom:'.75rem' }}>Award New Financial Aid</div>
                                                            <form onSubmit={awardAid} style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
                                                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                                                                    <div className="fg"><label>Aid Type</label>
                                                                        <select value={aidForm.type} onChange={e=>setAidForm(p=>({...p,type:e.target.value}))} style={{ background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'9px 12px', color:'var(--text)', outline:'none', width:'100%' }}>
                                                                            {AID_TYPES.map(t=><option key={t}>{t}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="fg"><label>Amount (SLL) *</label><input type="number" required min="1000" value={aidForm.amount} onChange={e=>setAidForm(p=>({...p,amount:e.target.value}))} placeholder="e.g. 250000" /></div>
                                                                </div>
                                                                <div className="fg"><label>Description *</label><input required value={aidForm.description} onChange={e=>setAidForm(p=>({...p,description:e.target.value}))} placeholder="Reason and terms of the award" /></div>
                                                                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }}><FaGift /> Award Aid (auto-applied to balance)</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
