import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate, FaUser, FaLock, FaArrowRight, FaArrowLeft, FaEnvelope, FaIdCard, FaCheckCircle } from 'react-icons/fa';

const STEPS = ['Admission ID', 'Confirm Details', 'Account Setup'];

export default function StudentSignup() {
    const { signup, verifyAdmissionId } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [admissionRecord, setAdmissionRecord] = useState(null);
    const [form, setForm] = useState({ admissionId:'', email:'', username:'', password:'', confirm:'' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

    // Step 1 — verify school admission ID
    const handleStep1 = (e) => {
        e.preventDefault(); setError('');
        const res = verifyAdmissionId(form.admissionId);
        if (!res.ok) { setError(res.error); return; }
        setAdmissionRecord(res.record);
        setStep(2);
    };

    // Step 2 — confirm pre-filled personal details
    const handleStep2 = (e) => {
        e.preventDefault(); setError('');
        if (!form.email) { setError('Please enter your email address.'); return; }
        setStep(3);
    };

    // Step 3 — create account
    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        if (form.password !== form.confirm) { setError('Passwords do not match.'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        setTimeout(() => {
            signup(form, admissionRecord);
            navigate('/student/dashboard');
        }, 900);
    };

    const back = () => { setError(''); step === 1 ? navigate('/student/login') : setStep(p => p - 1); };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Join SLGS Portal</h1>
                    <p>To create an account you must have been formally accepted by the school and issued an <strong>Admission ID</strong> by the Admissions Office.</p>

                    {/* Step progress */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'.6rem', marginTop:'1.75rem', alignItems:'flex-start' }}>
                        {STEPS.map((s, i) => {
                            const n = i + 1;
                            const done = n < step;
                            const active = n === step;
                            return (
                                <div key={s} style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.8rem', flexShrink:0,
                                        background: done ? 'var(--gold)' : active ? 'rgba(201,162,39,.2)' : 'rgba(255,255,255,.05)',
                                        border: `2px solid ${done || active ? 'var(--gold)' : 'var(--border-l)'}`,
                                        color: done ? '#05100a' : active ? 'var(--gold)' : 'var(--text-dim)' }}>
                                        {done ? <FaCheckCircle style={{ fontSize:'.75rem' }} /> : n}
                                    </div>
                                    <span style={{ fontSize:'.86rem', fontWeight: active ? 700 : 400, color: active ? 'var(--gold)' : done ? 'var(--text-muted)' : 'var(--text-dim)' }}>{s}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={back}>
                    <FaArrowLeft /> {step === 1 ? 'Back to Login' : `Back to Step ${step - 1}`}
                </span>
                <div className="auth-role-badge"><FaUserGraduate /> New Student Registration</div>
                <h2>{STEPS[step - 1]}</h2>
                <p className="sub">Step {step} of 3</p>

                {error && <div className="auth-error">{error}</div>}

                {/* ── Step 1: Admission ID ── */}
                {step === 1 && (
                    <form className="auth-form" onSubmit={handleStep1}>
                        <div style={{ padding:'1rem 1.1rem', background:'rgba(201,162,39,.07)', border:'1px solid rgba(201,162,39,.2)', borderRadius:'var(--r-sm)', marginBottom:'1.25rem', fontSize:'.86rem', color:'var(--text-muted)', lineHeight:1.6 }}>
                            Your <strong style={{ color:'var(--gold)' }}>Admission ID</strong> is printed on your acceptance letter from the school. Contact <strong>the Admissions Office</strong> if you have not yet received it.
                        </div>
                        <div className="auth-input-wrap">
                            <FaIdCard className="auth-input-icon" />
                            <input className="auth-input" type="text" placeholder="e.g. SLGS-ADM-2025-001"
                                required value={form.admissionId}
                                onChange={e => upd('admissionId', e.target.value.toUpperCase())}
                                style={{ letterSpacing:'1px', fontWeight:600 }} />
                        </div>
                        <button type="submit" className="auth-submit"><FaArrowRight /> Verify ID</button>
                        <div className="auth-demo" style={{ marginTop:'1.5rem' }}>
                            <strong>Demo — unregistered IDs to try:</strong><br />
                            SLGS-ADM-2025-001 &nbsp;·&nbsp; SLGS-ADM-2026-003
                        </div>
                    </form>
                )}

                {/* ── Step 2: Confirm details (pre-filled from admission record) ── */}
                {step === 2 && admissionRecord && (
                    <form className="auth-form" onSubmit={handleStep2}>
                        <div style={{ padding:'1rem 1.1rem', background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.2)', borderRadius:'var(--r-sm)', marginBottom:'1.25rem' }}>
                            <p style={{ fontSize:'.8rem', fontWeight:700, color:'var(--green-light)', marginBottom:'.5rem' }}>
                                <FaCheckCircle style={{ marginRight:'6px' }} />Admission ID verified
                            </p>
                            <p style={{ fontSize:'.85rem', color:'var(--text-muted)', margin:0 }}>
                                The details below are from the school's admissions register. Please confirm these are correct, then add your email address.
                            </p>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'1.25rem' }}>
                            {[
                                { label:'Full Name',     val: admissionRecord.name },
                                { label:'Form/Class',    val: admissionRecord.form },
                                { label:'Date of Birth', val: admissionRecord.dob },
                                { label:'Guardian',      val: admissionRecord.guardian },
                                { label:'Admission ID',  val: admissionRecord.admissionId },
                            ].map(({ label, val }) => (
                                <div key={label} style={{ background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'.65rem .9rem' }}>
                                    <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:'3px' }}>{label}</div>
                                    <div style={{ fontSize:'.9rem', fontWeight:600 }}>{val}</div>
                                </div>
                            ))}
                        </div>
                        <div className="auth-input-wrap">
                            <FaEnvelope className="auth-input-icon" />
                            <input className="auth-input" type="email" placeholder="Your email address" required value={form.email} onChange={e => upd('email', e.target.value)} />
                        </div>
                        <button type="submit" className="auth-submit"><FaArrowRight /> Continue to Account Setup</button>
                    </form>
                )}

                {/* ── Step 3: Account Setup ── */}
                {step === 3 && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-wrap">
                            <FaUser className="auth-input-icon" />
                            <input className="auth-input" type="text" placeholder="Choose a Username" required value={form.username} onChange={e => upd('username', e.target.value)} />
                        </div>
                        <div className="auth-input-wrap">
                            <FaLock className="auth-input-icon" />
                            <input className="auth-input" type="password" placeholder="Create Password (min 6 chars)" required value={form.password} onChange={e => upd('password', e.target.value)} />
                        </div>
                        <div className="auth-input-wrap">
                            <FaLock className="auth-input-icon" />
                            <input className="auth-input" type="password" placeholder="Confirm Password" required value={form.confirm} onChange={e => upd('confirm', e.target.value)} />
                        </div>
                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Creating Account…' : <><FaCheckCircle /> Create My Account</>}
                        </button>
                    </form>
                )}

                <p className="auth-link">Already registered? <button style={{ background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontWeight:600,padding:0 }} onClick={() => navigate('/student/login')}>Sign in</button></p>
            </div>
        </div>
    );
}
