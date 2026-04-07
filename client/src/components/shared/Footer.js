import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
    return (
        <footer className="main-footer">
            <div className="footer-grid">
                {/* Brand */}
                <div className="footer-brand">
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'.5rem' }}>
                        <div className="nav-crest" style={{ width:'40px', height:'40px', fontSize:'.9rem' }}>Γ</div>
                        <div>
                            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:800, fontSize:'1rem' }}>Sierra Leone Grammar School</div>
                            <div style={{ fontSize:'.7rem', color:'var(--text-muted)', letterSpacing:'1.5px', textTransform:'uppercase' }}>Murray Town, Freetown</div>
                        </div>
                    </div>
                    <p>First secondary school in sub-Saharan Africa, founded 1845 by the Church Mission Society. Nurturing excellence for over 181 years.</p>
                    <p className="footer-motto">"Διωκω" — To Pursue</p>
                    <div className="footer-socials" style={{ marginTop:'1rem' }}>
                        {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                            <div key={i} className="fs-icon"><Icon /></div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <p className="ft">Quick Links</p>
                    <ul className="fl">
                        {['Home','About','Programmes','News','Contact'].map(l => (
                            <li key={l} onClick={() => scrollTo(l.toLowerCase())}>{l}</li>
                        ))}
                    </ul>
                </div>

                {/* Portals */}
                <div>
                    <p className="ft">Portals</p>
                    <ul className="fl">
                        <li onClick={() => window.location.href = '/student/login'}>Student Portal</li>
                        <li onClick={() => window.location.href = '/teacher/login'}>Teacher Portal</li>
                        <li onClick={() => window.location.href = '/staff/login'}>Academic Staff</li>
                        <li onClick={() => window.location.href = '/principal/login'}>Principal Portal</li>
                        <li onClick={() => scrollTo('contact')}>Admissions</li>
                    </ul>
                </div>

                {/* Alumni */}
                <div>
                    <p className="ft">Alumni (Regentonians)</p>
                    <ul className="fl">
                        <li onClick={() => window.open('http://slgs.edu.sl/alumni-sl/', '_blank')}>Sierra Leone Chapter</li>
                        <li onClick={() => window.open('http://www.regentonians.org/', '_blank')}>UK — Regentonians</li>
                        <li onClick={() => window.open('https://slgsaana-westcoast.org/', '_blank')}>USA — West Coast</li>
                        <li onClick={() => window.open('https://slgsaanase.org/', '_blank')}>USA — South East</li>
                        <li onClick={() => window.open('http://slgsaanadc.org/', '_blank')}>USA — Washington DC</li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <p className="ft">Contact</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <div className="ci-item">
                            <div className="ci-icon"><FaMapMarkerAlt /></div>
                            <div className="ci-text"><h4>Address</h4><p>Murray Town, Freetown, Western Area, Sierra Leone</p></div>
                        </div>
                        <div className="ci-item">
                            <div className="ci-icon"><FaEnvelope /></div>
                            <div className="ci-text"><h4>Email</h4><a href="mailto:info@slgs.edu.sl">info@slgs.edu.sl</a></div>
                        </div>
                        <div className="ci-item">
                            <div className="ci-icon"><FaPhone /></div>
                            <div className="ci-text"><h4>Phone</h4><a href="tel:+23276490656">+232 76 490 656</a></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="fc">© {new Date().getFullYear()} Sierra Leone Grammar School. All Rights Reserved.</p>
                <div className="fbl">
                    <span>Privacy Policy</span>
                    <span>Terms of Use</span>
                    <span>Safeguarding Policy</span>
                </div>
            </div>
        </footer>
    );
}
