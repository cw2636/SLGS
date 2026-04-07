import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserGraduate, FaUser, FaLock, FaArrowRight, FaArrowLeft, FaCheckCircle, FaBook, FaGraduationCap, FaEnvelope } from 'react-icons/fa';

export default function StudentLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        setTimeout(() => {
            const res = login(form.username, form.password, 'student');
            if (res.ok) navigate('/student/dashboard');
            else { setError(res.error); setLoading(false); }
        }, 800);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest">Γ</div>
                    <h1>Student Portal</h1>
                    <p>Access your grades, register for classes, view your timetable, and communicate with your teachers — all in one place.</p>
                    <div className="auth-pills">
                        <div className="auth-pill"><FaGraduationCap /> View your academic grades & results</div>
                        <div className="auth-pill"><FaBook /> Register and manage your classes</div>
                        <div className="auth-pill"><FaEnvelope /> Messages from teachers & principal</div>
                        <div className="auth-pill"><FaUser /> Edit and view your profile</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => navigate('/')}><FaArrowLeft /> Back to SLGS Home</span>
                <div className="auth-role-badge"><FaUserGraduate /> Student Portal</div>
                <h2>Welcome Back</h2>
                <p className="sub">Enter your student credentials to access your portal.</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-wrap">
                        <FaUser className="auth-input-icon" />
                        <input className="auth-input" type="text" placeholder="Student Username" required
                            value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                    </div>
                    <div className="auth-input-wrap">
                        <FaLock className="auth-input-icon" />
                        <input className="auth-input" type="password" placeholder="Password" required
                            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Signing in…' : <><FaArrowRight /> Sign In</>}
                    </button>
                </form>

                <div className="auth-demo">
                    <strong>Demo credentials:</strong><br />
                    Username: <strong>james.koroma</strong> &nbsp;|&nbsp; Password: <strong>student123</strong>
                </div>

                <p className="auth-link">
                    No account? <a onClick={() => navigate('/student/signup')}>Create one here</a> &nbsp;|&nbsp;
                    <a onClick={() => navigate('/teacher/login')}>Teacher login →</a>
                </p>
            </div>
        </div>
    );
}
