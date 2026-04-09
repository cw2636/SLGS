import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/shared/LandingNav';
import Footer from '../components/shared/Footer';
import {
    FaArrowRight, FaChevronDown, FaMapMarkerAlt, FaEnvelope, FaPhone,
    FaFlask, FaBook, FaGlobeAfrica, FaMusic, FaLaptopCode, FaTrophy,
    FaUserGraduate, FaUniversity, FaHandshake, FaStar, FaCheckCircle
} from 'react-icons/fa';
import { MdScience, MdHistory, MdSportsBasketball } from 'react-icons/md';
import { NEWS as NEWS_DEFAULT, GALLERY_DEFAULT } from '../data/mockData';

/* ── Intersection observer hook ── */
function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); } }),
            { threshold: 0.08 }
        );
        el.querySelectorAll('.fu').forEach(t => obs.observe(t));
        return () => obs.disconnect();
    }, []);
    return ref;
}

/* ── Counter hook ── */
function useCounter(end, trigger) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!trigger) return;
        let start = null;
        const ease = t => 1 - Math.pow(1 - t, 3);
        const step = ts => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1800, 1);
            setN(Math.floor(ease(p) * end));
            if (p < 1) requestAnimationFrame(step);
            else setN(end);
        };
        requestAnimationFrame(step);
    }, [trigger, end]);
    return n;
}

const STATS = [
    { n: 1845, suf: '', label: 'Year Founded' },
    { n: 181,  suf: '+', label: 'Years of Excellence' },
    { n: 1240, suf: '+', label: 'Current Students' },
    { n: 97,   suf: '%', label: 'WASSCE Pass Rate' },
];

function StatItem({ n, suf, label, trigger }) {
    const count = useCounter(n, trigger);
    return (
        <div className="stat-i">
            <div className="stat-n">{count}{suf}</div>
            <div className="stat-l">{label}</div>
        </div>
    );
}

const TIMELINE = [
    { year: '1845', text: 'Founded by the Church Mission Society at Regent Square, Freetown — the first secondary school in sub-Saharan Africa.' },
    { year: '1861', text: 'James Quaker became the first African principal, a former student of the CMS College in London.' },
    { year: '1912', text: 'The school marching band performed for the first time, becoming a proud SLGS tradition.' },
    { year: '1962', text: 'Relocated to the current campus at Murray Town, Freetown, where it continues to serve the nation.' },
    { year: '2007', text: 'SLGS regained independent status under the Anglican Diocese of Freetown, securing greater autonomy.' },
    { year: '2026', text: '181st year of continuous operation — still producing Sierra Leone\'s finest scholars and leaders.' },
];

const PROGRAMMES = [
    { icon: <MdScience />, title: 'Sciences', subjects: ['Physics','Chemistry','Biology','Mathematics','ICT'],
      desc: 'Rigorous science education equipping students for careers in medicine, engineering, and research.' },
    { icon: <FaBook />, title: 'Humanities & Social Sciences', subjects: ['History','Geography','Economics','Sociology'],
      desc: 'Developing critical thinkers who understand society, politics, and the world around them.' },
    { icon: <FaGlobeAfrica />, title: 'Languages & Literature', subjects: ['English','French','Literature','Religious Studies'],
      desc: 'Building eloquent communicators through classical literary traditions and modern language skills.' },
    { icon: <FaMusic />, title: 'Arts & Creative Studies', subjects: ['Music','Art & Design','Drama','Physical Education'],
      desc: 'Nurturing creativity and expression through the rich cultural heritage of West Africa.' },
    { icon: <FaLaptopCode />, title: 'Technology & Computing', subjects: ['ICT','Computer Science','Digital Literacy'],
      desc: 'Preparing students for the digital economy through hands-on technology education.' },
    { icon: <FaTrophy />, title: 'Co-Curricular Activities', subjects: ['Marching Band','Debate Club','Model UN','Sports'],
      desc: 'Holistic development through sport, culture, leadership, and community service.' },
];

const WHY = [
    { icon: <FaUniversity />, title: '181 Years of Academic Excellence', desc: 'The oldest and most storied secondary school in Sierra Leone, with a heritage of scholarship dating to 1845.' },
    { icon: <FaStar />, title: 'Top Examination Results', desc: 'Consistently ranking #1 in WASSCE National Results — our graduates secure places at the best universities worldwide.' },
    { icon: <FaUserGraduate />, title: 'Distinguished Alumni', desc: 'Our old boys include presidents, ministers, professors, doctors, and leaders across West Africa and the world.' },
    { icon: <FaHandshake />, title: 'Character & Integrity', desc: 'We develop not just brilliant minds, but principled, compassionate citizens ready to serve Sierra Leone.' },
    { icon: <MdSportsBasketball />, title: 'World-Class Facilities', desc: 'Modern science labs, ICT suites, a new library, sports fields, and dedicated arts and music spaces.' },
    { icon: <FaCheckCircle />, title: 'Anglican Values', desc: 'Rooted in the Anglican tradition, we uphold faith, service, and moral leadership in everything we do.' },
];

const ALUMNI = [
    { name: 'James P. L. Davies',    role: 'Nigerian Industrialist & Philanthropist' },
    { name: 'Charles D.B. King',     role: 'President of Liberia (1920–1930)' },
    { name: 'Modjaben Dowuona',      role: 'Minister of Education, Ghana' },
    { name: 'E.F.B. Forster',        role: 'First Gambian Psychiatrist' },
    { name: 'Thomas H. Jackson',     role: 'Editor, Lagos Weekly Record' },
    { name: 'Frans Dove',            role: 'Barrister & Patron of Sports' },
    { name: 'UK Group — Regentonians', role: 'regentonians.org' },
    { name: 'SLGSAANA West Coast',   role: 'slgsaana-westcoast.org' },
    { name: 'SLGSAANA South East',   role: 'slgsaanase.org' },
    { name: 'SLGSAANA Washington DC',role: 'slgsaanadc.org' },
    { name: 'Thousands of Leaders',  role: 'Across West Africa & the Diaspora' },
];

export default function Landing() {
    const navigate = useNavigate();
    const statsRef = useRef(null);
    const [statsVis, setStatsVis] = useState(false);
    const [contactSent, setContactSent] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const [lightbox, setLightbox] = useState(null); // { image, title, caption }

    // Live content — reads from localStorage if IT admin has made changes
    const [news, setNews]       = useState(NEWS_DEFAULT);
    const [gallery, setGallery] = useState(GALLERY_DEFAULT);

    useEffect(() => {
        try {
            const n = localStorage.getItem('slgs_it_news');
            const g = localStorage.getItem('slgs_it_gallery');
            if (n) setNews(JSON.parse(n));
            if (g) setGallery(JSON.parse(g));
        } catch {}
    }, []);

    const heroRef = useFadeIn();
    const aboutRef = useFadeIn();
    const progsRef = useFadeIn();
    const whyRef = useFadeIn();
    const newsRef = useFadeIn();
    const contRef = useFadeIn();

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 500);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVis(true); obs.disconnect(); } }, { threshold: 0.3 });
        if (statsRef.current) obs.observe(statsRef.current);
        return () => obs.disconnect();
    }, []);

    const handleContact = (e) => { e.preventDefault(); setContactSent(true); };

    return (
        <div style={{ background: 'var(--bg)' }}>
            <LandingNav />

            {/* ── HERO ── */}
            <section id="home" className="hero" ref={heroRef}>
                <div className="hero-bg" />
                <div className="hero-grid" />
                <div className="hero-inner">
                    <div className="hero-motto fu">
                        <span style={{ fontStyle:'italic', fontSize:'1.4rem' }}>Διωκω</span>
                        <div className="mottoDiv" />
                        <span className="hero-motto-latin">To Pursue — Since 1845</span>
                    </div>
                    <h1 className="fu d1">
                        Sierra Leone<br />
                        <span className="gold-text serif">Grammar School</span>
                    </h1>
                    <p className="hero-sub fu d2">
                        Founded in 1845 by the Church Mission Society, SLGS is the first secondary school
                        in sub-Saharan Africa — 181 years of shaping Sierra Leone's finest minds.
                    </p>
                    <div className="hero-pills fu d3">
                        {['Murray Town, Freetown','Anglican Diocese','WASSCE Top Performer','Est. 1845'].map(p => (
                            <div key={p} className="hero-pill"><div className="hero-pill-dot" />{p}</div>
                        ))}
                    </div>
                    <div className="hero-btns fu d4">
                        <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('about').scrollIntoView({ behavior:'smooth' })}>
                            Discover Our Heritage <FaArrowRight />
                        </button>
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/student/login')}>
                            Student Portal
                        </button>
                    </div>
                </div>
                <div className="hero-scroll" onClick={() => document.getElementById('about').scrollIntoView({ behavior:'smooth' })}>
                    <div className="scroll-line" />
                    <span>Scroll</span>
                    <FaChevronDown style={{ fontSize:'.68rem' }} />
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <div className="stats-bar" ref={statsRef}>
                <div className="stats-bar-inner">
                    {STATS.map((s, i) => (
                        <StatItem key={i} {...s} trigger={statsVis} />
                    ))}
                </div>
            </div>

            {/* ── ABOUT / HISTORY ── */}
            <section id="about" className="section" ref={aboutRef}>
                <div className="history-grid">
                    <div className="history-visual fu">
                        <div className="hist-pattern" />
                        <div className="hist-year">1845</div>
                        <div className="hist-badge">
                            <span>181</span>
                            Years of<br />Excellence
                        </div>
                    </div>
                    <div className="history-text fu d1">
                        <p className="s-label">Our Heritage</p>
                        <h2 className="s-title">First in <span className="gold-text">Sub-Saharan Africa</span></h2>
                        <p className="s-sub">
                            On 25 March 1845, the Church Mission Society opened the CMS Grammar School at Regent Square,
                            Freetown — the very first secondary educational institution for West Africans with a European
                            curriculum. It was the beginning of a proud tradition that has now spanned 181 years.
                        </p>
                        <div className="timeline">
                            {TIMELINE.map((item, i) => (
                                <div key={i} className="tl-item">
                                    <div className="tl-dot-col">
                                        <div className="tl-dot" />
                                        {i < TIMELINE.length - 1 && <div className="tl-line" />}
                                    </div>
                                    <div className="tl-content">
                                        <div className="tl-year">{item.year}</div>
                                        <div className="tl-text">{item.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PROGRAMMES ── */}
            <div id="programmes" className="section-full section-alt" ref={progsRef}>
                <div className="section" style={{ padding:'0 var(--px)' }}>
                    <div className="text-center fu">
                        <p className="s-label">Academic Programmes</p>
                        <h2 className="s-title">A World-Class <span className="gold-text">Curriculum</span></h2>
                        <p className="s-sub">
                            Six comprehensive programme areas — all designed to develop the whole learner for a
                            rapidly changing world, while honouring our classical academic heritage.
                        </p>
                    </div>
                    <div className="programs-grid" style={{ marginTop:'3rem' }}>
                        {PROGRAMMES.map((p, i) => (
                            <div key={i} className={`prog-card fu d${(i % 3) + 1}`}>
                                <div className="prog-icon">{p.icon}</div>
                                <h3>{p.title}</h3>
                                <p>{p.desc}</p>
                                <div className="prog-subjects">
                                    {p.subjects.map(s => <span key={s} className="prog-tag">{s}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── WHY SLGS ── */}
            <section className="section" ref={whyRef}>
                <div className="text-center fu">
                    <p className="s-label">Why Choose SLGS</p>
                    <h2 className="s-title">The <span className="gold-text">Grammar School</span> Difference</h2>
                    <p className="s-sub">Six reasons why generations of Sierra Leonean families have trusted SLGS with the education of their children.</p>
                </div>
                <div className="why-grid">
                    {WHY.map((w, i) => (
                        <div key={i} className={`why-card fu d${(i % 3) + 1}`}>
                            <div className="why-icon">{w.icon}</div>
                            <h3>{w.title}</h3>
                            <p>{w.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── NEWS ── */}
            <div id="news" className="section-full section-alt" ref={newsRef}>
                <div className="section" style={{ padding:'0 var(--px)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3rem' }} className="fu">
                        <div>
                            <p className="s-label">Latest News</p>
                            <h2 className="s-title">School <span className="gold-text">Highlights</span></h2>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/login')}>
                            View Portal
                        </button>
                    </div>
                    <div className="news-grid">
                        {news.map((n, i) => (
                            <div key={n.id} className={`news-card fu d${(i % 6) + 1}`}>
                                <div className="news-img">
                                    <img src={n.image || `https://upload.wikimedia.org/wikipedia/en/b/b4/Sierra_Leone_Grammar_School_shield.jpg`}
                                        alt={n.title}
                                        loading="lazy"
                                        onError={e => { e.target.src = 'https://upload.wikimedia.org/wikipedia/en/b/b4/Sierra_Leone_Grammar_School_shield.jpg'; }} />
                                </div>
                                <span className="news-cat">{n.category}</span>
                                <h3>{n.title}</h3>
                                <p>{n.summary}</p>
                                <p className="news-date">{n.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── EVENTS GALLERY ── */}
            <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
                <div className="section" style={{ padding: '0 var(--px)' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <p className="s-label">Recent Events</p>
                        <h2 className="s-title">Life at <span className="gold-text">Grammar School</span></h2>
                    </div>
                    <div className="events-gallery">
                        {gallery.map((g, i) => (
                            <div key={g.id} className={`ev-photo fu d${(i % 4) + 1}`}
                                onClick={() => setLightbox(g)}
                                role="button" tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setLightbox(g)}>
                                <img src={g.image} alt={g.title} loading="lazy"
                                    onError={e => { e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/St._George%27s_Cathedral_Freetown.jpg'; }} />
                                <div className="ev-photo-caption">
                                    <h4>{g.title}</h4>
                                    <p>{g.caption || g.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LIGHTBOX ── */}
            {lightbox && (
                <div className="lb-overlay" onClick={() => setLightbox(null)}>
                    <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
                    <div className="lb-inner" onClick={e => e.stopPropagation()}>
                        <img src={lightbox.image} alt={lightbox.title} />
                        <div className="lb-caption">
                            <h3>{lightbox.title}</h3>
                            <p>{lightbox.caption || lightbox.date}</p>
                            <span>{lightbox.date}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ALUMNI ── */}
            <section style={{ padding:'80px 0', overflow:'hidden', background:'var(--bg)' }}>
                <div className="section" style={{ padding:'0 var(--px)', marginBottom:'2rem' }}>
                    <div className="text-center">
                        <p className="s-label">Distinguished Alumni</p>
                        <h2 className="s-title">Leaders Shaped by <span className="gold-text">SLGS</span></h2>
                    </div>
                </div>
                <div className="alumni-marquee-wrap">
                    <div className="alumni-marquee">
                        {[...ALUMNI, ...ALUMNI].map((a, i) => (
                            <div key={i} className="alumni-card">
                                <h4>{a.name}</h4>
                                <p>{a.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT ── */}
            <div id="contact" className="section-full section-alt" ref={contRef}>
                <div className="section" style={{ padding:'0 var(--px)' }}>
                    <div className="text-center fu" style={{ marginBottom:'3rem' }}>
                        <p className="s-label">Get In Touch</p>
                        <h2 className="s-title">Contact <span className="gold-text">SLGS</span></h2>
                        <p className="s-sub">For admissions, general enquiries, or to arrange a school visit — we welcome you.</p>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-info fu d1">
                            {[
                                { icon:<FaMapMarkerAlt />, label:'Address', val:'Murray Town, Freetown, Western Area, Sierra Leone' },
                                { icon:<FaEnvelope />, label:'Email', val:'info@slgs.edu.sl', href:'mailto:info@slgs.edu.sl' },
                                { icon:<FaPhone />, label:'Phone', val:'+232 76 490 656', href:'tel:+23276490656' },
                            ].map((c, i) => (
                                <div key={i} className="ci-item">
                                    <div className="ci-icon">{c.icon}</div>
                                    <div className="ci-text">
                                        <h4>{c.label}</h4>
                                        {c.href ? <a href={c.href}>{c.val}</a> : <p>{c.val}</p>}
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop:'1.5rem', padding:'1.5rem', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)' }}>
                                <p style={{ fontSize:'.83rem', fontWeight:700, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'1rem' }}>Portal Access</p>
                                <div style={{ display:'flex', flexDirection:'column', gap:'.6rem' }}>
                                    <button className="btn btn-primary btn-block btn-sm" onClick={() => navigate('/student/login')}>Student Login</button>
                                    <button className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/teacher/login')}>Teacher Login</button>
                                    <button className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/staff/login')}>Staff Portal</button>
                                    <button className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/principal/login')}>Principal Login</button>
                                    <button className="btn btn-outline btn-block btn-sm" onClick={() => navigate('/it/login')}
                                        style={{ borderStyle:'dashed', opacity:.75, fontSize:'.78rem' }}>⚙ IT Content Manager</button>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-box fu d2">
                            {contactSent ? (
                                <div className="submit-ok">
                                    <FaCheckCircle />
                                    <h3>Message Received</h3>
                                    <p>Thank you for contacting SLGS. We will respond within 2 working days.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleContact}>
                                    <div className="form-row-2">
                                        <div className="fg"><label>First Name</label><input type="text" placeholder="Aminata" required /></div>
                                        <div className="fg"><label>Last Name</label><input type="text" placeholder="Sesay" required /></div>
                                    </div>
                                    <div className="fg"><label>Email</label><input type="email" placeholder="aminata@email.com" required /></div>
                                    <div className="fg">
                                        <label>Enquiry Type</label>
                                        <select required defaultValue="">
                                            <option value="" disabled>Select…</option>
                                            {['Admissions','General Enquiry','Alumni','Facilities','Other'].map(o => <option key={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="fg"><label>Message</label><textarea placeholder="How can we help you?" required rows={5} /></div>
                                    <button type="submit" className="submit-btn">Send Message <FaArrowRight /></button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Scroll to top */}
            <button className={`scroll-top ${showTop ? 'show' : ''}`} onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} aria-label="Back to top">
                ↑
            </button>
        </div>
    );
}
