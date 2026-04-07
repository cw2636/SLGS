import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { MESSAGES, USERS } from '../../data/mockData';

export default function TeacherMessages() {
    const { user } = useAuth();
    const students = USERS.filter(u => u.role === 'student');
    const [msgs,    setMsgs]    = useState(MESSAGES);
    const [selected, setSelected] = useState(msgs[0] || null);
    const [compose,  setCompose]  = useState(false);
    const [newMsg,   setNewMsg]   = useState({ to:'', subject:'', body:'' });
    const [sent,     setSent]     = useState(false);

    const sendMsg = (e) => {
        e.preventDefault();
        const m = { id: Date.now(), from: user?.name || 'Teacher', fromRole:'teacher', to: newMsg.to, subject: newMsg.subject, body: newMsg.body, date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) };
        setMsgs(p => [m, ...p]);
        setCompose(false);
        setNewMsg({ to:'', subject:'', body:'' });
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Messages</span>
                    <div className="pt-right">
                        <button className="btn btn-primary btn-sm" onClick={() => setCompose(p => !p)}>
                            <FaPaperPlane /> {compose ? 'Cancel' : 'Compose'}
                        </button>
                    </div>
                </div>

                <div className="portal-content">
                    {sent && (
                        <div style={{ marginBottom:'1rem', padding:'.8rem 1rem', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.88rem' }}>
                            ✓ Message sent successfully.
                        </div>
                    )}

                    {compose && (
                        <div className="d-card" style={{ marginBottom:'1.5rem' }}>
                            <div className="d-card-title"><FaPaperPlane /> New Message</div>
                            <form onSubmit={sendMsg} style={{ display:'flex', flexDirection:'column', gap:'.9rem' }}>
                                <div className="fg">
                                    <label>To (Student)</label>
                                    <select required value={newMsg.to} onChange={e => setNewMsg(p => ({ ...p, to: e.target.value }))}>
                                        <option value="">— Select student —</option>
                                        {students.map(s => <option key={s.username} value={s.username}>{s.name} ({s.username})</option>)}
                                    </select>
                                </div>
                                <div className="fg"><label>Subject</label><input required value={newMsg.subject} onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))} /></div>
                                <div className="fg"><label>Message</label>
                                    <textarea rows={5} required value={newMsg.body} onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))}
                                        style={{ resize:'vertical', background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 14px', color:'var(--text)', fontFamily:'inherit', fontSize:'.9rem', outline:'none' }} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf:'flex-start' }}><FaPaperPlane /> Send Message</button>
                            </form>
                        </div>
                    )}

                    <div className="msg-layout">
                        <div className="msg-list">
                            <div className="msg-list-head"><FaEnvelope style={{ color:'var(--gold)', marginRight:'8px' }} />All Messages</div>
                            {msgs.map(m => (
                                <div key={m.id} className={`msg-item ${selected?.id === m.id ? 'sel' : ''}`} onClick={() => setSelected(m)}>
                                    <div className="msg-sender">{m.from} → {m.to}</div>
                                    <div className="msg-subj">{m.subject}</div>
                                    <div className="msg-date">{m.date}</div>
                                </div>
                            ))}
                        </div>

                        <div className="msg-pane">
                            {selected ? (
                                <>
                                    <div className="msg-pane-head">
                                        <h3>{selected.subject}</h3>
                                        <p className="msg-meta">From: <strong>{selected.from}</strong> → To: <strong>{selected.to}</strong> · {selected.date}</p>
                                    </div>
                                    <p className="msg-body">{selected.body}</p>
                                </>
                            ) : (
                                <div className="msg-empty">Select a message to read</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
