import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChalkboardTeacher, FaUser, FaLock, FaArrowRight, FaArrowLeft, FaPen, FaCalendarAlt, FaEnvelope, FaChartBar } from 'react-icons/fa';

export default function TeacherLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        setTimeout(() => {
            const res = login(form.username, form.password, 'teacher');
            if (res.ok) navigate('/teacher/dashboard');
            else { setError(res.error); setLoading(false); }
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Teacher Portal</h1>
                    <p>Manage your classes, enter grades, message students, and schedule live virtual meetings — all from one secure dashboard.</p>
                    <div className="auth-pills">
                        <div className="auth-pill"><FaPen /> Enter and manage student grades</div>
                        <div className="auth-pill"><FaEnvelope /> Message students & parents</div>
                        <div className="auth-pill"><FaCalendarAlt /> Schedule live virtual meetings</div>
                        <div className="auth-pill"><FaChartBar /> View class performance analytics</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => navigate('/')}><FaArrowLeft /> Back to SLGS Home</span>
                <div className="auth-role-badge" style={{ borderColor:'rgba(82,183,136,.4)', background:'rgba(82,183,136,.1)', color:'var(--green-light)' }}>
                    <FaChalkboardTeacher /> Teacher Portal
                </div>
                <h2>Teacher Sign In</h2>
                <p className="sub">Use your staff credentials to access the teacher portal.</p>

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
                    <button type="submit" className="auth-submit" style={{ background:'linear-gradient(135deg,var(--green),var(--green-mid))' }} disabled={loading}>
                        {loading ? 'Signing in…' : <><FaArrowRight /> Sign In to Teacher Portal</>}
                    </button>
                </form>

                <div className="auth-demo">
                    <strong>Demo credentials:</strong><br />
                    Username: <strong>mr.conteh</strong> &nbsp;|&nbsp; Password: <strong>teacher123</strong>
                </div>
                <p className="auth-link"><a onClick={() => navigate('/student/login')}>← Student Login</a> &nbsp;|&nbsp; <a onClick={() => navigate('/principal/login')}>Principal Login →</a></p>
            </div>
        </div>
    );
}
