import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import {
    FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle,
    FaLock, FaHistory, FaGift, FaFileInvoiceDollar,
    FaCreditCard, FaMobileAlt, FaUniversity, FaTimesCircle,
} from 'react-icons/fa';
import {
    FINANCIAL_ACCOUNTS, HOLDS, PAYMENTS, FINANCIAL_AID,
} from '../../data/mockData';

const SLL = (n) => `SLL ${Number(n).toLocaleString()}`;

const PAYMENT_METHODS = [
    { value: 'Bank Transfer (Guarantee Trust)', label: 'Bank Transfer — Guarantee Trust Bank' },
    { value: 'Bank Transfer (Rokel Commercial)', label: 'Bank Transfer — Rokel Commercial Bank' },
    { value: 'Mobile Money (Orange Sierra Leone)', label: 'Mobile Money — Orange Sierra Leone' },
    { value: 'Mobile Money (Africell)', label: 'Mobile Money — Africell' },
    { value: 'Cash (School Bursar)', label: 'Cash — School Bursar\'s Office' },
];

export default function StudentFinance() {
    const { user } = useAuth();
    const account = FINANCIAL_ACCOUNTS[user?.studentId];
    const holds   = HOLDS.filter(h => h.studentId === user?.studentId && h.active);
    const payments = PAYMENTS.filter(p => p.studentId === user?.studentId).sort((a, b) => new Date(b.date) - new Date(a.date));
    const aid     = FINANCIAL_AID.filter(a => a.studentId === user?.studentId);

    const [tab, setTab]       = useState('overview'); // overview | payments | aid
    const [showPay, setShowPay] = useState(false);
    const [payForm, setPayForm] = useState({ amount: '', method: PAYMENT_METHODS[0].value, reference: '', note: '' });
    const [submitted, setSubmitted] = useState(null);

    const submitPayment = (e) => {
        e.preventDefault();
        const ref = payForm.reference || `REF-${Date.now()}`;
        setSubmitted({ ...payForm, ref, date: new Date().toLocaleDateString('en-GB') });
        setShowPay(false);
        setPayForm({ amount: '', method: PAYMENT_METHODS[0].value, reference: '', note: '' });
    };

    const totalAid = aid.reduce((a, f) => a + f.amount, 0);

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                {/* Topbar */}
                <div className="portal-topbar">
                    <span className="pt-title">Student Finance</span>
                    <div className="pt-right">
                        <div className="pt-badge" style={{ borderColor:'rgba(201,162,39,.3)', background:'rgba(201,162,39,.1)', color:'var(--gold-light)' }}>
                            <FaFileInvoiceDollar style={{ color:'var(--gold)' }} /> {account?.term || 'Term 2, 2025/2026'}
                        </div>
                    </div>
                </div>

                <div className="portal-content">
                    <div style={{ marginBottom:'1.5rem' }}>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.6rem', marginBottom:'.3rem' }}>
                            My Financial Account
                        </h2>
                        <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>
                            {user?.name} · {user?.studentId} · {user?.classSection || user?.form}
                        </p>
                    </div>

                    {/* ── HOLDS BANNER ── */}
                    {holds.length > 0 && (
                        <div style={{ marginBottom:'1.5rem', padding:'1.1rem 1.25rem', background:'rgba(239,68,68,.08)', border:'1.5px solid rgba(239,68,68,.35)', borderRadius:'var(--r)', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                            <FaLock style={{ color:'#f87171', fontSize:'1.2rem', flexShrink:0, marginTop:'2px' }} />
                            <div>
                                <div style={{ fontWeight:700, color:'#f87171', marginBottom:'4px', fontSize:'.97rem' }}>
                                    Account Hold — {holds.length} active hold{holds.length > 1 ? 's' : ''}
                                </div>
                                {holds.map(h => (
                                    <div key={h.id} style={{ marginBottom:'.5rem' }}>
                                        <div style={{ fontSize:'.87rem', color:'var(--text-muted)' }}>{h.reason}</div>
                                        <div style={{ fontSize:'.8rem', color:'#fca5a5', marginTop:'3px' }}>{h.consequence}</div>
                                        <div style={{ fontSize:'.76rem', color:'var(--text-dim)', marginTop:'2px' }}>
                                            Placed by {h.placedBy} on {h.placedDate}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ fontSize:'.82rem', color:'#f87171', marginTop:'.5rem', fontWeight:600 }}>
                                    Contact the Academic Secretary's Office to resolve this hold.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PAYMENT SUBMITTED SUCCESS ── */}
                    {submitted && (
                        <div style={{ marginBottom:'1.5rem', padding:'1.1rem 1.25rem', background:'rgba(34,197,94,.08)', border:'1.5px solid rgba(34,197,94,.3)', borderRadius:'var(--r)' }}>
                            <div style={{ fontWeight:700, color:'#86efac', marginBottom:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
                                <FaCheckCircle /> Payment Submitted — Pending Verification
                            </div>
                            <div style={{ fontSize:'.87rem', color:'var(--text-muted)' }}>
                                Amount: <strong style={{ color:'var(--text)' }}>{SLL(submitted.amount)}</strong> via {submitted.method}
                            </div>
                            <div style={{ fontSize:'.84rem', color:'var(--text-muted)', marginTop:'3px' }}>
                                Reference: <span style={{ fontFamily:'monospace', color:'var(--gold)' }}>{submitted.ref}</span> · {submitted.date}
                            </div>
                            <div style={{ fontSize:'.8rem', color:'var(--text-dim)', marginTop:'4px' }}>
                                Your payment will be recorded by the Secretary within 1-2 working days. Keep your bank receipt as proof.
                            </div>
                            <button style={{ marginTop:'8px', background:'none', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r-sm)', color:'#86efac', padding:'4px 12px', cursor:'pointer', fontSize:'.8rem' }} onClick={() => setSubmitted(null)}>
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* ── ACCOUNT SUMMARY CARDS ── */}
                    {account && (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
                            {[
                                { label:'Total Charged', val: SLL(account.totalCharged), icon:<FaFileInvoiceDollar />, color:'#93c5fd' },
                                { label:'Financial Aid', val: SLL(totalAid), icon:<FaGift />, color:'#86efac' },
                                { label:'Total Paid',    val: SLL(account.totalPaid),    icon:<FaCheckCircle />, color:'#a3e635' },
                                { label:'Balance Due',   val: SLL(account.balance),      icon:<FaMoneyBillWave />, color: account.balance > 0 ? '#f87171' : '#86efac' },
                            ].map(card => (
                                <div key={card.label} className="ds-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:'.35rem' }}>
                                    <div style={{ color: card.color, fontSize:'1.1rem' }}>{card.icon}</div>
                                    <div style={{ fontSize:'1.3rem', fontWeight:800, fontFamily:"'Playfair Display',serif", color: card.label === 'Balance Due' && account.balance > 0 ? '#f87171' : 'var(--text)' }}>
                                        {card.val}
                                    </div>
                                    <div style={{ fontSize:'.78rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>{card.label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── TABS ── */}
                    <div style={{ display:'flex', gap:'4px', marginBottom:'1.5rem', background:'var(--bg-alt)', padding:'4px', borderRadius:'var(--r)', width:'fit-content' }}>
                        {[
                            { key:'overview', label:'Fee Breakdown' },
                            { key:'payments', label:'Payment History' },
                            { key:'aid',      label:'Financial Aid' },
                        ].map(t => (
                            <button key={t.key} className={`tab-btn ${tab === t.key ? 'act' : ''}`} onClick={() => setTab(t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── FEE BREAKDOWN ── */}
                    {tab === 'overview' && account && (
                        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:'1.5rem' }}>
                            <div>
                                <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                                    <div className="d-card-title"><FaFileInvoiceDollar /> Term 2, 2025/2026 — Fee Statement</div>
                                    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--r-sm)', overflow:'hidden' }}>
                                        {[
                                            { label:'Term Tuition Fee',           val: account.termFee },
                                            { label:'Examination Fee',            val: account.examFee },
                                            { label:'Laboratory / Practical Fee', val: account.labFee },
                                            { label:'Sports & Activities Fee',    val: account.sportsFee },
                                            { label:'Other School Fees',          val: account.otherFees },
                                        ].map((row, i) => (
                                            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'.7rem 1rem', background: i % 2 === 0 ? 'rgba(255,255,255,.02)' : 'transparent', fontSize:'.88rem' }}>
                                                <span style={{ color:'var(--text-muted)' }}>{row.label}</span>
                                                <span style={{ fontWeight:600 }}>{SLL(row.val)}</span>
                                            </div>
                                        ))}
                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.8rem 1rem', borderTop:'2px solid var(--border)', fontWeight:700 }}>
                                            <span>Total Charged</span>
                                            <span>{SLL(account.totalCharged)}</span>
                                        </div>
                                        {totalAid > 0 && (
                                            <div style={{ display:'flex', justifyContent:'space-between', padding:'.7rem 1rem', background:'rgba(34,197,94,.05)' }}>
                                                <span style={{ color:'#86efac' }}><FaGift style={{ marginRight:'6px' }} />Financial Aid Applied</span>
                                                <span style={{ color:'#86efac', fontWeight:700 }}>− {SLL(totalAid)}</span>
                                            </div>
                                        )}
                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.7rem 1rem', background:'rgba(255,255,255,.03)' }}>
                                            <span style={{ color:'var(--text-muted)' }}>Total Paid</span>
                                            <span style={{ color:'#a3e635', fontWeight:700 }}>− {SLL(account.totalPaid)}</span>
                                        </div>
                                        <div style={{ display:'flex', justifyContent:'space-between', padding:'.9rem 1rem', borderTop:'2px solid var(--border)', fontWeight:800, fontSize:'1rem', background: account.balance > 0 ? 'rgba(239,68,68,.05)' : 'rgba(34,197,94,.05)' }}>
                                            <span style={{ color: account.balance > 0 ? '#f87171' : '#86efac' }}>Balance Outstanding</span>
                                            <span style={{ color: account.balance > 0 ? '#f87171' : '#86efac' }}>{SLL(account.balance)}</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop:'.75rem', fontSize:'.82rem', color:'var(--text-dim)' }}>
                                        Due date: <strong style={{ color:'var(--text-muted)' }}>{account.dueDate}</strong> · Academic Registrar: Ms. Patricia Johnson
                                    </div>
                                </div>

                                {/* Make Payment */}
                                {account.balance > 0 && (
                                    <div className="d-card">
                                        <div className="d-card-title"><FaCreditCard /> Make a Payment</div>
                                        {!showPay ? (
                                            <div>
                                                <p style={{ color:'var(--text-muted)', fontSize:'.87rem', marginBottom:'1rem', lineHeight:1.6 }}>
                                                    You have an outstanding balance of <strong style={{ color:'#f87171' }}>{SLL(account.balance)}</strong>.
                                                    Payments can be made via bank transfer, mobile money, or cash at the bursar's office.
                                                    Submit your payment details below and bring your receipt to the secretary.
                                                </p>
                                                <button className="btn btn-primary" onClick={() => setShowPay(true)}>
                                                    <FaMoneyBillWave /> Submit Payment Details
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitPayment} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                                                    <div className="fg">
                                                        <label>Amount (SLL) *</label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="1000"
                                                            max={account.balance}
                                                            placeholder={`Max: ${account.balance}`}
                                                            value={payForm.amount}
                                                            onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="fg">
                                                        <label>Payment Method *</label>
                                                        <select
                                                            value={payForm.method}
                                                            onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}
                                                            style={{ background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 12px', color:'var(--text)', outline:'none', width:'100%' }}
                                                        >
                                                            {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="fg">
                                                    <label>Bank / Transaction Reference</label>
                                                    <input
                                                        placeholder="e.g. GT-20260415-123 (from your bank receipt)"
                                                        value={payForm.reference}
                                                        onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="fg">
                                                    <label>Note (optional)</label>
                                                    <input
                                                        placeholder="e.g. Term 2 instalment 3"
                                                        value={payForm.note}
                                                        onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))}
                                                    />
                                                </div>
                                                <div style={{ display:'flex', gap:'.75rem' }}>
                                                    <button type="submit" className="btn btn-primary">
                                                        <FaCheckCircle /> Submit Payment
                                                    </button>
                                                    <button type="button" className="btn btn-outline" onClick={() => setShowPay(false)}>Cancel</button>
                                                </div>
                                                <div style={{ fontSize:'.8rem', color:'var(--text-dim)', padding:'.75rem', background:'rgba(255,255,255,.03)', borderRadius:'var(--r-sm)', lineHeight:1.5 }}>
                                                    <strong>Important:</strong> Submitting this form does not automatically clear your balance.
                                                    The secretary will verify your payment and update your account within 1-2 working days.
                                                    Please bring your original bank receipt to the Academic Office.
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                                {account.balance === 0 && (
                                    <div className="d-card" style={{ display:'flex', alignItems:'center', gap:'1rem', background:'rgba(34,197,94,.05)', borderColor:'rgba(34,197,94,.2)' }}>
                                        <FaCheckCircle style={{ color:'#86efac', fontSize:'1.5rem', flexShrink:0 }} />
                                        <div>
                                            <div style={{ fontWeight:700, color:'#86efac' }}>Account Clear — No Outstanding Balance</div>
                                            <div style={{ fontSize:'.84rem', color:'var(--text-muted)', marginTop:'3px' }}>
                                                All fees for {account.term} have been settled. Thank you.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right column — payment methods info */}
                            <div>
                                <div className="d-card" style={{ marginBottom:'1rem' }}>
                                    <div className="d-card-title">Payment Channels</div>
                                    {[
                                        { icon:<FaUniversity />, label:'Bank Transfer', detail:'Guarantee Trust Bank · Rokel Commercial Bank · Account: SLGS 001234567' },
                                        { icon:<FaMobileAlt />, label:'Mobile Money', detail:'Orange Sierra Leone · Africell · Register to: SLGS Admin (+232 76 490 656)' },
                                        { icon:<FaCreditCard />, label:'Cash', detail:"Bursar's Office, Admin Block. Mon–Fri, 08:30–14:00" },
                                    ].map(pm => (
                                        <div key={pm.label} style={{ display:'flex', gap:'.75rem', padding:'.8rem 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
                                            <div style={{ color:'var(--gold)', fontSize:'1rem', marginTop:'2px' }}>{pm.icon}</div>
                                            <div>
                                                <div style={{ fontWeight:700, fontSize:'.88rem' }}>{pm.label}</div>
                                                <div style={{ fontSize:'.8rem', color:'var(--text-muted)', lineHeight:1.5 }}>{pm.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="d-card">
                                    <div className="d-card-title">Need Help?</div>
                                    <p style={{ fontSize:'.84rem', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'.75rem' }}>
                                        For payment queries, financial aid applications, or hold disputes contact the Academic secretary's Office.
                                    </p>
                                    <div style={{ fontSize:'.84rem', color:'var(--text-muted)' }}>
                                        <div>📍 Admin Block, Room 3</div>
                                        <div>📞 +232 76 490 656</div>
                                        <div>✉️ info@slgs.edu.sl</div>
                                        <div style={{ marginTop:'.5rem', fontSize:'.8rem', color:'var(--text-dim)' }}>Mon–Fri · 08:30–15:00</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PAYMENT HISTORY ── */}
                    {tab === 'payments' && (
                        <div className="d-card">
                            <div className="d-card-title"><FaHistory /> Payment History ({payments.length} transactions)</div>
                            {payments.length === 0 ? (
                                <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-dim)' }}>No payments recorded yet</div>
                            ) : (
                                <table className="portal-table">
                                    <thead>
                                        <tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Description</th><th>Recorded By</th></tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ color:'var(--text-muted)', fontSize:'.84rem' }}>{p.date}</td>
                                                <td><span style={{ fontWeight:700, color:'#a3e635' }}>{SLL(p.amount)}</span></td>
                                                <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{p.method}</td>
                                                <td><span style={{ fontFamily:'monospace', fontSize:'.78rem', color:'var(--gold)' }}>{p.reference}</span></td>
                                                <td style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>{p.description}</td>
                                                <td style={{ color:'var(--text-dim)', fontSize:'.80rem' }}>{p.recordedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div style={{ marginTop:'1rem', padding:'.75rem 1rem', background:'rgba(255,255,255,.03)', borderRadius:'var(--r-sm)', fontSize:'.82rem', color:'var(--text-dim)', display:'flex', justifyContent:'space-between' }}>
                                <span>Total Paid (all payments): <strong style={{ color:'var(--text)' }}>{SLL(payments.reduce((a, p) => a + p.amount, 0))}</strong></span>
                                <span>Balance: <strong style={{ color: account?.balance > 0 ? '#f87171' : '#86efac' }}>{SLL(account?.balance || 0)}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* ── FINANCIAL AID ── */}
                    {tab === 'aid' && (
                        <div>
                            {aid.length === 0 ? (
                                <div className="d-card" style={{ textAlign:'center', padding:'3rem' }}>
                                    <FaGift style={{ fontSize:'2rem', color:'var(--text-dim)', marginBottom:'1rem' }} />
                                    <div style={{ color:'var(--text-muted)', marginBottom:'.5rem' }}>No financial aid on record for {user?.name}</div>
                                    <div style={{ fontSize:'.84rem', color:'var(--text-dim)' }}>
                                        To apply for financial aid or a bursary, contact the Academic Secretary's Office.
                                    </div>
                                </div>
                            ) : (
                                aid.map(a => (
                                    <div key={a.id} className="d-card" style={{ marginBottom:'1rem' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'.75rem', marginBottom:'1rem' }}>
                                            <div>
                                                <div style={{ fontWeight:800, fontSize:'1.05rem', fontFamily:"'Playfair Display',serif" }}>{a.type}</div>
                                                <div style={{ fontSize:'.83rem', color:'var(--text-muted)', marginTop:'3px' }}>Academic Year {a.academicYear}</div>
                                            </div>
                                            <div style={{ textAlign:'right' }}>
                                                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#86efac', fontFamily:"'Playfair Display',serif" }}>{SLL(a.amount)}</div>
                                                <span style={{ fontSize:'.75rem', padding:'2px 10px', borderRadius:'999px',
                                                    background: a.status === 'Active' ? 'rgba(34,197,94,.12)' : 'rgba(148,163,184,.1)',
                                                    color: a.status === 'Active' ? '#86efac' : '#94a3b8',
                                                    border:`1px solid ${a.status === 'Active' ? 'rgba(34,197,94,.3)' : 'rgba(148,163,184,.2)'}` }}>
                                                    {a.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize:'.87rem', color:'var(--text-muted)', lineHeight:1.65, marginBottom:'1rem' }}>{a.description}</p>
                                        <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap', borderTop:'1px solid var(--border)', paddingTop:'.75rem', fontSize:'.82rem', color:'var(--text-dim)' }}>
                                            <span>Awarded by: <strong style={{ color:'var(--text-muted)' }}>{a.awardedBy}</strong></span>
                                            <span>Date: <strong style={{ color:'var(--text-muted)' }}>{a.awardedDate}</strong></span>
                                            <span>Renewable: <strong style={{ color:'var(--text-muted)' }}>{a.renewable ? 'Yes' : 'No'}</strong></span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div className="d-card" style={{ background:'rgba(201,162,39,.04)', borderColor:'rgba(201,162,39,.15)' }}>
                                <div className="d-card-title" style={{ color:'var(--gold)' }}><FaGift /> Apply for Financial Aid</div>
                                <p style={{ fontSize:'.87rem', color:'var(--text-muted)', lineHeight:1.65, marginBottom:'1rem' }}>
                                    SLGS offers merit scholarships, welfare bursaries, and Anglican Diocese grants to eligible students.
                                    Applications are reviewed each term by the Welfare Committee.
                                </p>
                                <div style={{ fontSize:'.84rem', color:'var(--text-muted)' }}>
                                    <strong>How to apply:</strong> Visit the Academic Secretary's Office (Admin Block, Room 3) and request a
                                    Financial Aid Application Form. Completed forms with supporting documentation must be submitted by the
                                    end of the first month of each term.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
