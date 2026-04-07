import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserTie, FaUser, FaLock, FaArrowRight, FaArrowLeft, FaIdCard, FaClipboardList, FaUsers } from 'react-icons/fa';

export default function StaffLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        setTimeout(() => {
            const res = login(form.username, form.password, 'staff');
            if (res.ok) navigate('/staff/dashboard');
            else { setError(res.error); setLoading(false); }
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Academic Staff Portal</h1>
                    <p>Restricted to secretaries, registrars, and academic support staff. Manage student admissions, enrolment records, and school administration.</p>
                    <div className="auth-pills">
                        <div className="auth-pill"><FaIdCard /> Issue &amp; manage Admission IDs</div>
                        <div className="auth-pill"><FaUsers /> View &amp; update student roster</div>
                        <div className="auth-pill"><FaClipboardList /> Monitor class enrolment</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => navigate('/')}><FaArrowLeft /> Back to SLGS Home</span>
                <div className="auth-role-badge" style={{ borderColor:'rgba(59,130,246,.35)', background:'rgba(59,130,246,.1)', color:'#93c5fd' }}>
                    <FaUserTie /> Academic Staff Access
                </div>
                <h2>Staff Sign In</h2>
                <p className="sub">Use your staff credentials issued by IT Administration.</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-wrap">
                        <FaUser className="auth-input-icon" />
                        <input className="auth-input" type="text" placeholder="Staff Username" required
                            value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                    </div>
                    <div className="auth-input-wrap">
                        <FaLock className="auth-input-icon" />
                        <input className="auth-input" type="password" placeholder="Password" required
                            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Authenticating…' : <><FaArrowRight /> Sign In</>}
                    </button>
                </form>

                <div className="auth-demo">
                    <strong>Demo credentials:</strong><br />
                    Secretary: <strong>ms.johnson</strong> / <strong>staff123</strong><br />
                    Admissions: <strong>mr.bangura</strong> / <strong>staff123</strong>
                </div>
                <p className="auth-link">
                    <button style={{ background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontWeight:600,padding:0 }} onClick={() => navigate('/teacher/login')}>← Teacher Login</button>
                    &nbsp;|&nbsp;
                    <button style={{ background:'none',border:'none',color:'var(--gold)',cursor:'pointer',fontWeight:600,padding:0 }} onClick={() => navigate('/principal/login')}>Principal Login →</button>
                </p>
            </div>
        </div>
    );
}
