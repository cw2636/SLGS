import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaArrowLeft, FaNewspaper, FaImages, FaBullhorn, FaSyncAlt } from 'react-icons/fa';

const IT_CREDS = { user: 'it.admin', pass: 'slgs2025' };

export default function ITLogin() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ user: '', pass: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            if (form.user === IT_CREDS.user && form.pass === IT_CREDS.pass) {
                sessionStorage.setItem('slgs_it_auth', '1');
                navigate('/it/dashboard');
            } else {
                setError('Invalid credentials. Please try again.');
                setLoading(false);
            }
        }, 600);
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-bg" />
                <div className="auth-left-content">
                    <div className="auth-crest" style={{ fontSize: '2.5rem', lineHeight: 1 }}>⚙</div>
                    <h1>IT Content Portal</h1>
                    <p>Add news, upload event photos, and manage the SLGS website — keeping it current for the whole school community.</p>
                    <div className="auth-pills">
                        <div className="auth-pill"><FaNewspaper /> Add &amp; edit news articles</div>
                        <div className="auth-pill"><FaImages /> Upload recent event photos</div>
                        <div className="auth-pill"><FaBullhorn /> Manage announcements</div>
                        <div className="auth-pill"><FaSyncAlt /> Instant live website updates</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <span className="auth-back" onClick={() => navigate('/')}><FaArrowLeft /> Back to SLGS Home</span>
                <div className="auth-role-badge">⚙ IT Content Portal</div>
                <h2>IT Admin Login</h2>
                <p className="sub">Enter your IT staff credentials to manage website content.</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-wrap">
                        <FaUser className="auth-input-icon" />
                        <input className="auth-input" type="text" placeholder="Username" required
                            value={form.user} onChange={e => setForm(p => ({ ...p, user: e.target.value }))} autoComplete="username" />
                    </div>
                    <div className="auth-input-wrap">
                        <FaLock className="auth-input-icon" />
                        <input className="auth-input" type="password" placeholder="Password" required
                            value={form.pass} onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} autoComplete="current-password" />
                    </div>
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Signing in…' : <><FaArrowRight /> Sign In</>}
                    </button>
                </form>

                <div className="auth-demo">
                    <strong>IT Staff Credentials:</strong><br />
                    Username: <strong>it.admin</strong> &nbsp;|&nbsp; Password: <strong>slgs2025</strong>
                </div>

                <p className="auth-link">
                    <a onClick={() => navigate('/student/login')}>Student login →</a> &nbsp;|&nbsp;
                    <a onClick={() => navigate('/teacher/login')}>Teacher login →</a>
                </p>
            </div>
        </div>
    );
}
