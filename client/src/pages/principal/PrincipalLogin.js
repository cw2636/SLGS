import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaUser, FaLock, FaArrowRight, FaArrowLeft, FaChartBar, FaUsers, FaBell, FaUniversity } from 'react-icons/fa';

export default function PrincipalLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        setTimeout(() => {
            const res = login(form.username, form.password, 'principal');
            if (res.ok) navigate('/principal/dashboard');
            else { setError(res.error); setLoading(false); }
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Principal Portal</h1>
                    <p>Full administrative oversight of the school — students, teachers, performance data, announcements, and institutional management.</p>
                    <div className="auth-pills">
                        <div className="auth-pill"><FaUsers /> Enrol & manage students</div>
                        <div className="auth-pill"><FaChartBar /> School-wide performance reports</div>
                        <div className="auth-pill"><FaBell /> Send school-wide announcements</div>
                        <div className="auth-pill"><FaUniversity /> Manage teachers & staff</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => navigate('/')}><FaArrowLeft /> Back to SLGS Home</span>
                <div className="auth-role-badge" style={{ borderColor:'rgba(201,162,39,.35)', background:'rgba(201,162,39,.12)', color:'var(--gold-light)' }}>
                    <MdAdminPanelSettings /> Principal Access
                </div>
                <h2>Principal Sign In</h2>
                <p className="sub">Restricted access — authorised personnel only.</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-wrap">
                        <FaUser className="auth-input-icon" />
                        <input className="auth-input" type="text" placeholder="Principal Username" required
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
                    Username: <strong>principal</strong> &nbsp;|&nbsp; Password: <strong>principal123</strong>
                </div>
                <p className="auth-link"><a onClick={() => navigate('/teacher/login')}>← Teacher Login</a> &nbsp;|&nbsp; <a onClick={() => navigate('/student/login')}>Student Login →</a></p>
            </div>
        </div>
    );
}
