import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaArrowLeft, FaNewspaper, FaImages, FaBullhorn, FaSyncAlt } from 'react-icons/fa';

const GO_API = process.env.REACT_APP_GO_API || 'http://localhost:8080';

export default function ITLogin() {
    const navigate = useNavigate();
    const [form, setForm]       = useState({ user: '', pass: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${GO_API}/api/it-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: form.user, pass: form.pass }),
            });
            if (res.ok) {
                sessionStorage.setItem('slgs_it_auth', '1');
                navigate('/it/dashboard');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Invalid credentials. Please try again.');
            }
        } catch {
            setError('Cannot reach server. Please try again.');
        } finally {
            setLoading(false);
        }
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

                <p className="auth-link">
                    <a onClick={() => navigate('/student/login')}>Student login →</a> &nbsp;|&nbsp;
                    <a onClick={() => navigate('/teacher/login')}>Teacher login →</a>
                </p>
            </div>
        </div>
    );
}
