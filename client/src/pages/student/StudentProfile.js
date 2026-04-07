import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaEdit } from 'react-icons/fa';

export default function StudentProfile() {
    const { user } = useAuth();
    const initials = user?.name?.split(' ').map(w => w[0]).slice(0,2).join('') || '?';

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">My Profile</span>
                    <div className="pt-right">
                        <button className="btn btn-outline btn-sm"><FaEdit /> Edit Profile</button>
                    </div>
                </div>

                <div className="portal-content">
                    {/* Profile hero */}
                    <div className="profile-hero">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-info">
                            <h2>{user?.name}</h2>
                            <p>{user?.email}</p>
                            <div className="profile-tags">
                                <span className="profile-tag">{user?.form}</span>
                                <span className="profile-tag">{user?.studentId}</span>
                                <span className="profile-tag">House: {user?.house || 'N/A'}</span>
                                <span className="profile-tag">SLGS Student</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                        {/* Personal Info */}
                        <div className="d-card">
                            <div className="d-card-title"><FaUser /> Personal Information</div>
                            <div className="info-grid">
                                {[
                                    { label:'Full Name',    val: user?.name },
                                    { label:'Date of Birth', val: user?.dob || 'N/A' },
                                    { label:'House',        val: user?.house || 'N/A' },
                                    { label:'Student ID',   val: user?.studentId },
                                    { label:'Form/Year',    val: user?.form },
                                    { label:'Status',       val: 'Active' },
                                ].map(({ label, val }) => (
                                    <div key={label} className="info-cell">
                                        <label>{label}</label>
                                        <span>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="d-card">
                            <div className="d-card-title"><FaEnvelope /> Contact Details</div>
                            <div className="info-grid">
                                {[
                                    { label:'Email',    val: user?.email },
                                    { label:'Phone',    val: user?.phone || 'N/A' },
                                    { label:'Guardian', val: user?.guardian || 'N/A' },
                                    { label:'Address',  val: user?.address || 'Freetown, Sierra Leone' },
                                ].map(({ label, val }) => (
                                    <div key={label} className="info-cell">
                                        <label>{label}</label>
                                        <span>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* School Info */}
                        <div className="d-card">
                            <div className="d-card-title"><FaIdCard /> School Information</div>
                            <div className="info-grid">
                                {[
                                    { label:'School',       val: 'Sierra Leone Grammar School' },
                                    { label:'Location',     val: 'Murray Town, Freetown' },
                                    { label:'Diocese',      val: 'Anglican Diocese of Freetown' },
                                    { label:'Current Term', val: 'Term 2, 2025/2026' },
                                    { label:'Academic Year',val: '2025/2026' },
                                    { label:'Founded',      val: '1845' },
                                ].map(({ label, val }) => (
                                    <div key={label} className="info-cell">
                                        <label>{label}</label>
                                        <span>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="d-card">
                            <div className="d-card-title"><FaUser /> Change Password</div>
                            <form onSubmit={e => e.preventDefault()} style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
                                <div className="fg"><label>Current Password</label><input type="password" placeholder="Current password" /></div>
                                <div className="fg"><label>New Password</label><input type="password" placeholder="New password" /></div>
                                <div className="fg"><label>Confirm New Password</label><input type="password" placeholder="Confirm new password" /></div>
                                <button type="submit" className="btn btn-primary" style={{ alignSelf:'flex-start' }}>Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
