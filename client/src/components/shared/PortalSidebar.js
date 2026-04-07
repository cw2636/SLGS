import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaTachometerAlt, FaGraduationCap, FaBook, FaUser, FaEnvelope,
    FaChalkboard, FaPen, FaCalendarAlt, FaSignOutAlt, FaBars,
    FaUniversity, FaChartBar, FaUsers, FaBell, FaIdCard, FaClipboardList, FaUserTie
} from 'react-icons/fa';

const STUDENT_LINKS = [
    { label: 'Dashboard',    path: '/student/dashboard', icon: <FaTachometerAlt /> },
    { label: 'My Grades',    path: '/student/grades',   icon: <FaGraduationCap /> },
    { label: 'My Classes',   path: '/student/classes',  icon: <FaBook /> },
    { label: 'Messages',     path: '/student/messages', icon: <FaEnvelope /> },
    { label: 'My Profile',   path: '/student/profile',  icon: <FaUser /> },
];

const TEACHER_LINKS = [
    { label: 'Dashboard',    path: '/teacher/dashboard', icon: <FaTachometerAlt /> },
    { label: 'Enter Grades', path: '/teacher/grades',   icon: <FaPen /> },
    { label: 'Messages',     path: '/teacher/messages', icon: <FaEnvelope /> },
    { label: 'Live Meetings',path: '/teacher/meetings', icon: <FaCalendarAlt /> },
];

const STAFF_LINKS = [
    { label: 'Dashboard',      path: '/staff/dashboard',             icon: <FaTachometerAlt /> },
    { label: 'Admissions',     path: '/staff/dashboard?tab=admissions', icon: <FaIdCard /> },
    { label: 'Student Roster', path: '/staff/dashboard?tab=roster',     icon: <FaUsers /> },
    { label: 'Class Enrolment',path: '/staff/dashboard?tab=enrolment',  icon: <FaClipboardList /> },
];

const PRINCIPAL_LINKS = [
    { label: 'Dashboard',    path: '/principal/dashboard',     icon: <FaTachometerAlt /> },
    { label: 'Students',     path: '/principal/students',      icon: <FaUsers /> },
    { label: 'Teachers',     path: '/principal/teachers',      icon: <FaChalkboard /> },
    { label: 'Reports',      path: '/principal/reports',       icon: <FaChartBar /> },
    { label: 'Announcements',path: '/principal/announcements', icon: <FaBell /> },
];

const ROLE_LABELS = { student:'Student', teacher:'Teacher', staff:'Academic Staff', principal:'Principal' };
const LINK_MAP = { student: STUDENT_LINKS, teacher: TEACHER_LINKS, staff: STAFF_LINKS, principal: PRINCIPAL_LINKS };

export default function PortalSidebar({ title, notifications = 0 }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobile] = useState(false);

    const links = LINK_MAP[user?.role] || [];
    const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('') || '?';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobile(p => !p)}
                style={{ display:'none', position:'fixed', top:'14px', left:'14px', zIndex:200, background:'var(--gold)', color:'#05100a', border:'none', borderRadius:'var(--r-sm)', padding:'9px 12px', fontSize:'1rem', cursor:'pointer' }}
                className="portal-ham"
                aria-label="Menu"
            >
                <FaBars />
            </button>
            {mobileOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:99 }} onClick={() => setMobile(false)} />}

            <aside className={`portal-sidebar ${mobileOpen ? 'open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="SLGS Logo" className="sb-logo-img" />
                    <div className="sb-name">
                        <h3>SLGS</h3>
                        <span>Est. 1845</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="sb-section">Main</div>
                    {links.map(l => (
                        <div
                            key={l.path + l.label}
                            className={`sb-link ${location.pathname === l.path.split('?')[0] && (!l.path.includes('?') || new URLSearchParams(l.path.split('?')[1] || '').get('tab') === new URLSearchParams(location.search).get('tab') || (l.label === 'Dashboard' && !new URLSearchParams(location.search).get('tab'))) ? 'act' : ''}`}
                            onClick={() => { navigate(l.path); setMobile(false); }}
                        >
                            {l.icon} {l.label}
                        </div>
                    ))}
                    <div className="sb-section" style={{ marginTop:'1rem' }}>Account</div>
                    <div className="sb-link" onClick={() => navigate('/')}>
                        <FaUniversity /> School Website
                    </div>
                </nav>

                {/* User footer */}
                <div className="sidebar-user">
                    <div className="su-avatar">{initials}</div>
                    <div className="su-info">
                        <h4>{user?.name}</h4>
                        <span>{ROLE_LABELS[user?.role] || user?.role}</span>
                    </div>
                    <FaSignOutAlt className="su-logout" onClick={handleLogout} title="Log out" />
                </div>
            </aside>
        </>
    );
}
