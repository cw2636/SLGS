import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';

const LINKS = [
    { label: 'Home',     id: 'home' },
    { label: 'About',    id: 'about' },
    { label: 'Programmes', id: 'programmes' },
    { label: 'News',     id: 'news' },
    { label: 'Contact',  id: 'contact' },
];

const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function LandingNav() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [active,   setActive]   = useState('home');
    const [menuOpen, setMenu]     = useState(false);
    const [portalOpen, setPortal] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50);
            const ids = LINKS.map(l => document.getElementById(l.id));
            let cur = 'home';
            ids.forEach(el => { if (el && window.scrollY >= el.offsetTop - 140) cur = el.id; });
            setActive(cur);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setPortal(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    return (
        <>
            <div className={`mob-overlay ${menuOpen ? 'op' : ''}`} onClick={() => setMenu(false)} />
            <nav className={`lnav ${scrolled ? 'sc' : ''}`}>
                <div className="nav-brand-wrap" onClick={() => go('home')}>
                    <img src="/logo.png" alt="SLGS Logo" className="nav-logo-img" />
                    <div className="nav-brand-text">
                        <h2>SLGS</h2>
                        <span>Est. 1845</span>
                    </div>
                </div>

                {/* Desktop links */}
                <div className="nav-links">
                    {LINKS.map(l => (
                        <span key={l.id} className={`nav-link ${active === l.id ? 'act' : ''}`} onClick={() => go(l.id)}>
                            {l.label}
                        </span>
                    ))}
                </div>

                {/* Portal dropdown */}
                <div className="nav-portals" ref={dropRef}>
                    <button className="nav-portal-btn" onClick={() => setPortal(p => !p)}>
                        Portals <FiChevronDown style={{ transform: portalOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
                    </button>
                    {portalOpen && (
                        <div style={{ position:'absolute', top:'64px', right:'var(--px)', background:'var(--bg-alt)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'.75rem', display:'flex', flexDirection:'column', gap:'.4rem', minWidth:'200px', boxShadow:'var(--sh-md)', zIndex:1001, animation:'fadeDown .2s ease' }}>
                            <button className="sb-link" style={{ border:'none', background:'none', padding:'.7rem 1rem', borderRadius:'var(--r-sm)', cursor:'pointer' }} onClick={() => { navigate('/student/login'); setPortal(false); }}>
                                <FaUserGraduate /> Student Portal
                            </button>
                            <button className="sb-link" style={{ border:'none', background:'none', padding:'.7rem 1rem', borderRadius:'var(--r-sm)', cursor:'pointer' }} onClick={() => { navigate('/teacher/login'); setPortal(false); }}>
                                <FaChalkboardTeacher /> Teacher Portal
                            </button>
                            <button className="sb-link" style={{ border:'none', background:'none', padding:'.7rem 1rem', borderRadius:'var(--r-sm)', cursor:'pointer' }} onClick={() => { navigate('/staff/login'); setPortal(false); }}>
                                <FaUserTie /> Academic Staff Portal
                            </button>
                            <button className="sb-link" style={{ border:'none', background:'none', padding:'.7rem 1rem', borderRadius:'var(--r-sm)', cursor:'pointer' }} onClick={() => { navigate('/principal/login'); setPortal(false); }}>
                                <MdAdminPanelSettings /> Principal Portal
                            </button>
                        </div>
                    )}
                    <button className="nav-portal-btn gold" onClick={() => navigate('/student/login')}>
                        Student Login
                    </button>
                </div>

                <button className="hamburger" onClick={() => setMenu(p => !p)} aria-label="Menu">
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Mobile drawer */}
                {menuOpen && (
                    <div style={{ position:'fixed', top:0, right:0, width:'min(300px,85vw)', height:'100vh', background:'rgba(4,13,6,.98)', backdropFilter:'blur(20px)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'2rem 1.5rem', zIndex:999, animation:'slideIn .35s ease' }}>
                        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'2rem' }}>
                            <button style={{ background:'none', border:'none', color:'var(--text)', fontSize:'1.2rem', cursor:'pointer' }} onClick={() => setMenu(false)}><FaTimes /></button>
                        </div>
                        {LINKS.map(l => (
                            <span key={l.id} className="sb-link" onClick={() => { go(l.id); setMenu(false); }} style={{ borderLeft:'none', padding:'.9rem 0', borderBottom:'1px solid var(--border)', margin:0, fontSize:'.98rem' }}>
                                {l.label}
                            </span>
                        ))}
                        <div style={{ marginTop:'1.5rem', display:'flex', flexDirection:'column', gap:'.6rem' }}>
                            <button className="btn btn-outline btn-block" onClick={() => { navigate('/student/login'); setMenu(false); }}>Student Login</button>
                            <button className="btn btn-primary btn-block" onClick={() => { navigate('/teacher/login'); setMenu(false); }}>Teacher Login</button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
