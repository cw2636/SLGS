import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate, FaUser, FaLock, FaArrowRight, FaArrowLeft, FaEnvelope } from 'react-icons/fa';

const FORMS = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];

export default function StudentSignup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ firstName:'', lastName:'', email:'', username:'', password:'', confirm:'', form:'' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleStep1 = (e) => {
        e.preventDefault(); setError('');
        if (!form.firstName || !form.lastName || !form.email) { setError('Please fill in all fields.'); return; }
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        if (form.password !== form.confirm) { setError('Passwords do not match.'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        setTimeout(() => {
            signup({ ...form });
            navigate('/student/dashboard');
        }, 900);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Join SLGS Portal</h1>
                    <p>Create your student account to access grades, classes, messages, and your personal profile at Sierra Leone Grammar School.</p>
                    <div style={{ display:'flex', gap:'.75rem', justifyContent:'center', marginTop:'1.5rem' }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.85rem', color: s <= step ? 'var(--gold)' : 'var(--text-dim)' }}>
                                <div style={{ width:'24px', height:'24px', borderRadius:'50%', border: `2px solid ${s <= step ? 'var(--gold)' : 'var(--border-l)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.78rem', background: s < step ? 'var(--gold)' : 'transparent', color: s < step ? '#05100a' : 'inherit' }}>
                                    {s}
                                </div>
                                {s === 1 ? 'Personal Details' : 'Account Setup'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => step === 1 ? navigate('/student/login') : setStep(1)}>
                    <FaArrowLeft /> {step === 1 ? 'Back to Login' : 'Back to Step 1'}
                </span>
                <div className="auth-role-badge"><FaUserGraduate /> New Student Registration</div>
                <h2>{step === 1 ? 'Your Details' : 'Account Setup'}</h2>
                <p className="sub">Step {step} of 2</p>

                {error && <div className="auth-error">{error}</div>}

                {step === 1 ? (
                    <form className="auth-form" onSubmit={handleStep1}>
                        <div className="auth-input-wrap">
                            <FaUser className="auth-input-icon" />
                            <input className="auth-input" type="text" placeholder="First Name" required value={form.firstName} onChange={e => upd('firstName', e.target.value)} />
                        </div>
                        <div className="auth-input-wrap">
                            <FaUser className="auth-input-icon" />
                            <input className="auth-input" type="text" placeholder="Last Name" required value={form.lastName} onChange={e => upd('lastName', e.target.value)} />
                        </div>
                        <div className="auth-input-wrap">
                            <FaEnvelope className="auth-input-icon" />
                            <input className="auth-input" type="email" placeholder="Email Address" required value={form.email} onChange={e => upd('email', e.target.value)} />
                        </div>
                        <div style={{ position:'relative' }}>
                            <select className="auth-input" style={{ paddingLeft:'14px' }} value={form.form} onChange={e => upd('form', e.target.value)} required>
                                <option value="">Select Your Form</option>
                                {FORMS.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="auth-submit"><FaArrowRight /> Continue to Step 2</button>
                    </form>
                ) : (
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
                            {loading ? 'Creating Account…' : <><FaArrowRight /> Create Account</>}
                        </button>
                    </form>
                )}
                <p className="auth-link">Already registered? <a onClick={() => navigate('/student/login')}>Sign in</a></p>
            </div>
        </div>
    );
}
