import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaEye,
    FaTimes, FaCheck, FaImage, FaExclamationTriangle
} from 'react-icons/fa';
import { NEWS as NEWS_DEFAULT, ANNOUNCEMENTS as ANN_DEFAULT, GALLERY_DEFAULT } from '../../data/mockData';

/* ── helpers ── */
const loadLocal  = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
const saveLocal  = (key, data)     => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };

const NEWS_CATS = ['Events', 'Achievement', 'Anniversary', 'Sports', 'Faith & Tradition', 'Heritage', 'Facilities', 'Academic', 'Other'];
const ANN_CATS  = ['Events', 'Examinations', 'Sports', 'Facilities', 'Faith', 'Academic', 'Other'];

/* ── Modal wrapper ── */
function Modal({ title, onClose, children }) {
    return (
        <div className="it-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
            <div className="it-modal">
                <div className="it-modal-head">
                    <h3>{title}</h3>
                    <button className="it-icon-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
                </div>
                <div className="it-modal-body">{children}</div>
            </div>
        </div>
    );
}

/* ── News form ── */
function NewsForm({ item, onSave, onClose }) {
    const [form, setForm] = useState(item
        ? { ...item }
        : { title: '', date: '', category: 'Events', summary: '', image: '' }
    );
    const fileRef = useRef();

    const readFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(f);
    };

    const valid = form.title.trim() && form.date.trim() && form.summary.trim();

    return (
        <form className="it-form" onSubmit={e => { e.preventDefault(); if (valid) onSave(form); }}>
            <div className="it-form-row">
                <div className="fg">
                    <label>Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Prize Giving Day 2025" required />
                </div>
                <div className="fg">
                    <label>Date *</label>
                    <input type="text" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                        placeholder="e.g. March 2025" required />
                </div>
            </div>
            <div className="fg">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {NEWS_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <div className="fg">
                <label>Summary *</label>
                <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                    rows={4} placeholder="Short description shown on the homepage…" required />
            </div>
            <div className="fg">
                <label>Photo</label>
                <div className="it-img-row">
                    <input type="url" value={form.image.startsWith('data:') ? '' : form.image}
                        onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                        placeholder="Paste a direct image URL (https://…) or upload a file" />
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
                        <FaImage /> Upload
                    </button>
                    <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={readFile} />
                </div>
                {form.image && (
                    <img src={form.image} alt="preview" className="it-img-preview"
                        onError={e => { e.target.style.display = 'none'; }} />
                )}
                <p className="it-hint">Tip: upload to Google Photos → Share → Copy link, then paste here.</p>
            </div>
            <div className="it-form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!valid}><FaCheck /> Save</button>
            </div>
        </form>
    );
}

/* ── Gallery form ── */
function GalleryForm({ item, onSave, onClose }) {
    const [form, setForm] = useState(item
        ? { ...item }
        : { title: '', date: '', caption: '', image: '' }
    );
    const fileRef = useRef();

    const readFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => setForm(p => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(f);
    };

    const valid = form.title.trim() && form.date.trim() && form.image.trim();

    return (
        <form className="it-form" onSubmit={e => { e.preventDefault(); if (valid) onSave(form); }}>
            <div className="it-form-row">
                <div className="fg">
                    <label>Event Name *</label>
                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Inter-House Sports Day" required />
                </div>
                <div className="fg">
                    <label>Date *</label>
                    <input type="text" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                        placeholder="e.g. February 2025" required />
                </div>
            </div>
            <div className="fg">
                <label>Caption <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(shown on hover)</span></label>
                <input type="text" value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                    placeholder="Short description of what's happening in this photo" />
            </div>
            <div className="fg">
                <label>Photo *</label>
                <div className="it-img-row">
                    <input type="url" value={form.image.startsWith('data:') ? '' : form.image}
                        onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                        placeholder="Paste image URL or upload a file" />
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
                        <FaImage /> Upload
                    </button>
                    <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={readFile} />
                </div>
                {form.image && (
                    <img src={form.image} alt="preview" className="it-img-preview"
                        onError={e => { e.target.style.display = 'none'; }} />
                )}
                <p className="it-hint">Tip: take a photo on your phone → upload to Google Photos → Share → Copy link → paste above.</p>
            </div>
            <div className="it-form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!valid}><FaCheck /> Save Photo</button>
            </div>
        </form>
    );
}

/* ── Announcement form ── */
function AnnForm({ item, onSave, onClose }) {
    const [form, setForm] = useState(item
        ? { ...item }
        : { title: '', date: '', category: 'Events', body: '' }
    );
    const valid = form.title.trim() && form.date.trim() && form.body.trim();

    return (
        <form className="it-form" onSubmit={e => { e.preventDefault(); if (valid) onSave(form); }}>
            <div className="it-form-row">
                <div className="fg">
                    <label>Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. WASSCE Registration Open" required />
                </div>
                <div className="fg">
                    <label>Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
            </div>
            <div className="fg">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {ANN_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <div className="fg">
                <label>Content *</label>
                <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                    rows={5} placeholder="Full announcement text shown to students and teachers…" required />
            </div>
            <div className="it-form-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!valid}><FaCheck /> Save</button>
            </div>
        </form>
    );
}

/* ── Confirm delete helper ── */
function useConfirm() {
    const confirm = (msg, cb) => { if (window.confirm(msg)) cb(); };
    return confirm;
}

/* ═══════════════════════════════════════════════════════════
   Main IT Dashboard
═══════════════════════════════════════════════════════════ */
export default function ITDashboard() {
    const navigate = useNavigate();
    const confirm  = useConfirm();

    const [tab,  setTab]  = useState(0);
    const [news, setNews] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [modal, setModal] = useState(null);   // { type: 'news'|'gallery'|'ann', item: null|object }
    const [flash, setFlash] = useState('');

    /* auth guard */
    useEffect(() => {
        if (!sessionStorage.getItem('slgs_it_auth')) {
            navigate('/it/login');
        } else {
            setNews(loadLocal('slgs_it_news', NEWS_DEFAULT));
            setGallery(loadLocal('slgs_it_gallery', GALLERY_DEFAULT));
            setAnnouncements(loadLocal('slgs_it_announcements', ANN_DEFAULT));
        }
    }, [navigate]);

    const showFlash = msg => { setFlash(msg); setTimeout(() => setFlash(''), 2500); };

    /* ── News CRUD ── */
    const saveNewsItem = form => {
        const updated = modal.item
            ? news.map(n => n.id === modal.item.id ? { ...form, id: n.id } : n)
            : [...news, { ...form, id: Date.now() }];
        setNews(updated);
        saveLocal('slgs_it_news', updated);
        setModal(null);
        showFlash('News saved ✓');
    };
    const deleteNewsItem = id => confirm('Delete this news article?', () => {
        const updated = news.filter(n => n.id !== id);
        setNews(updated); saveLocal('slgs_it_news', updated); showFlash('Deleted ✓');
    });

    /* ── Gallery CRUD ── */
    const saveGalleryItem = form => {
        const updated = modal.item
            ? gallery.map(g => g.id === modal.item.id ? { ...form, id: g.id } : g)
            : [...gallery, { ...form, id: Date.now() }];
        setGallery(updated);
        saveLocal('slgs_it_gallery', updated);
        setModal(null);
        showFlash('Photo saved ✓');
    };
    const deleteGalleryItem = id => confirm('Remove this photo from the gallery?', () => {
        const updated = gallery.filter(g => g.id !== id);
        setGallery(updated); saveLocal('slgs_it_gallery', updated); showFlash('Removed ✓');
    });

    /* ── Announcements CRUD ── */
    const saveAnnItem = form => {
        const updated = modal.item
            ? announcements.map(a => a.id === modal.item.id ? { ...form, id: a.id } : a)
            : [...announcements, { ...form, id: Date.now() }];
        setAnnouncements(updated);
        saveLocal('slgs_it_announcements', updated);
        setModal(null);
        showFlash('Announcement saved ✓');
    };
    const deleteAnnItem = id => confirm('Delete this announcement?', () => {
        const updated = announcements.filter(a => a.id !== id);
        setAnnouncements(updated); saveLocal('slgs_it_announcements', updated); showFlash('Deleted ✓');
    });

    const resetAll = () => confirm(
        'Reset ALL content to defaults? This will remove all your custom changes.',
        () => {
            localStorage.removeItem('slgs_it_news');
            localStorage.removeItem('slgs_it_gallery');
            localStorage.removeItem('slgs_it_announcements');
            setNews(NEWS_DEFAULT);
            setGallery(GALLERY_DEFAULT);
            setAnnouncements(ANN_DEFAULT);
            showFlash('Reset to defaults ✓');
        }
    );

    const logout = () => { sessionStorage.removeItem('slgs_it_auth'); navigate('/it/login'); };

    /* ── render ── */
    return (
        <div className="it-layout">

            {/* Header */}
            <div className="it-header">
                <div className="it-header-brand">
                    <span className="it-header-logo">Γ</span>
                    <div>
                        <strong>SLGS Content Manager</strong>
                        <span>IT Portal · Sierra Leone Grammar School</span>
                    </div>
                </div>
                <div className="it-header-actions">
                    {flash && <span className="it-flash"><FaCheck /> {flash}</span>}
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                        <FaEye /> Preview Site
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={resetAll} title="Reset all content to defaults">
                        <FaExclamationTriangle /> Reset
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={logout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="it-tabs">
                {[
                    { label: '📰 News', count: news.length },
                    { label: '🖼 Events Gallery', count: gallery.length },
                    { label: '📢 Announcements', count: announcements.length },
                ].map((t, i) => (
                    <button key={i} className={`it-tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
                        {t.label} <span className="it-tab-count">{t.count}</span>
                    </button>
                ))}
            </div>

            <div className="it-content">

                {/* ── NEWS ── */}
                {tab === 0 && (
                    <div className="it-panel">
                        <div className="it-panel-head">
                            <div>
                                <h2>News Articles</h2>
                                <p>These {news.length} items are shown in the "School Highlights" section of the homepage.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setModal({ type: 'news', item: null })}>
                                <FaPlus /> Add News
                            </button>
                        </div>
                        <div className="it-list">
                            {news.map(n => (
                                <div key={n.id} className="it-item">
                                    <div className="it-item-thumb">
                                        {n.image
                                            ? <img src={n.image} alt="" onError={e => e.target.style.display = 'none'} />
                                            : <div className="it-thumb-empty">📷</div>}
                                    </div>
                                    <div className="it-item-info">
                                        <span className="news-cat">{n.category}</span>
                                        <h4>{n.title}</h4>
                                        <p className="it-item-meta">{n.date}</p>
                                        <p className="it-item-excerpt">{(n.summary || '').slice(0, 110)}{n.summary?.length > 110 ? '…' : ''}</p>
                                    </div>
                                    <div className="it-item-btns">
                                        <button className="it-icon-btn it-edit" onClick={() => setModal({ type: 'news', item: n })} title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button className="it-icon-btn it-del" onClick={() => deleteNewsItem(n.id)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {news.length === 0 && <div className="it-empty">No news items yet. Click "Add News" to get started.</div>}
                        </div>
                    </div>
                )}

                {/* ── GALLERY ── */}
                {tab === 1 && (
                    <div className="it-panel">
                        <div className="it-panel-head">
                            <div>
                                <h2>Events Gallery</h2>
                                <p>These {gallery.length} photos appear in the "Recent Events" gallery on the homepage.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setModal({ type: 'gallery', item: null })}>
                                <FaPlus /> Add Photo
                            </button>
                        </div>
                        <div className="it-gallery-grid">
                            {gallery.map(g => (
                                <div key={g.id} className="it-gal-card">
                                    <div className="it-gal-img">
                                        {g.image
                                            ? <img src={g.image} alt={g.title} onError={e => e.target.style.display = 'none'} />
                                            : <div className="it-thumb-empty">🖼</div>}
                                        <div className="it-gal-overlay">
                                            <button className="it-icon-btn it-edit" onClick={() => setModal({ type: 'gallery', item: g })} title="Edit">
                                                <FaEdit />
                                            </button>
                                            <button className="it-icon-btn it-del" onClick={() => deleteGalleryItem(g.id)} title="Delete">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="it-gal-info">
                                        <h4>{g.title}</h4>
                                        <p>{g.date}</p>
                                    </div>
                                </div>
                            ))}
                            {gallery.length === 0 && <div className="it-empty">No photos yet. Click "Add Photo" to upload event pictures.</div>}
                        </div>
                    </div>
                )}

                {/* ── ANNOUNCEMENTS ── */}
                {tab === 2 && (
                    <div className="it-panel">
                        <div className="it-panel-head">
                            <div>
                                <h2>Announcements</h2>
                                <p>These {announcements.length} announcements appear in the student and teacher portal sidebars.</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => setModal({ type: 'ann', item: null })}>
                                <FaPlus /> Add Announcement
                            </button>
                        </div>
                        <div className="it-list">
                            {announcements.map(a => (
                                <div key={a.id} className="it-item">
                                    <div className="it-ann-icon">📢</div>
                                    <div className="it-item-info">
                                        <span className="news-cat">{a.category}</span>
                                        <h4>{a.title}</h4>
                                        <p className="it-item-meta">{a.date}</p>
                                        <p className="it-item-excerpt">{(a.body || '').slice(0, 120)}{a.body?.length > 120 ? '…' : ''}</p>
                                    </div>
                                    <div className="it-item-btns">
                                        <button className="it-icon-btn it-edit" onClick={() => setModal({ type: 'ann', item: a })} title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button className="it-icon-btn it-del" onClick={() => deleteAnnItem(a.id)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && <div className="it-empty">No announcements yet.</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {modal?.type === 'news' && (
                <Modal title={modal.item ? 'Edit News Article' : 'Add News Article'} onClose={() => setModal(null)}>
                    <NewsForm item={modal.item} onSave={saveNewsItem} onClose={() => setModal(null)} />
                </Modal>
            )}
            {modal?.type === 'gallery' && (
                <Modal title={modal.item ? 'Edit Photo' : 'Add Event Photo'} onClose={() => setModal(null)}>
                    <GalleryForm item={modal.item} onSave={saveGalleryItem} onClose={() => setModal(null)} />
                </Modal>
            )}
            {modal?.type === 'ann' && (
                <Modal title={modal.item ? 'Edit Announcement' : 'Add Announcement'} onClose={() => setModal(null)}>
                    <AnnForm item={modal.item} onSave={saveAnnItem} onClose={() => setModal(null)} />
                </Modal>
            )}
        </div>
    );
}
