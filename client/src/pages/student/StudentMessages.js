import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { MESSAGES } from '../../data/mockData';

export default function StudentMessages() {
    const { user } = useAuth();
    const msgs = MESSAGES.filter(m => m.to === user?.username);
    const [selected, setSelected] = useState(msgs[0] || null);
    const [replyText, setReply] = useState('');
    const [sent, setSent] = useState(false);

    const sendReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSent(true);
        setReply('');
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Messages</span>
                    <div className="pt-right">
                        <div className="pt-badge"><div className="pt-dot" />{msgs.length} messages</div>
                    </div>
                </div>

                <div className="portal-content">
                    <div className="msg-layout">
                        {/* Message list */}
                        <div className="msg-list">
                            <div className="msg-list-head"><FaEnvelope style={{ color:'var(--gold)', marginRight:'8px' }} />Inbox</div>
                            {msgs.length === 0 ? (
                                <div style={{ padding:'1.5rem', color:'var(--text-muted)', fontSize:'.9rem' }}>No messages yet.</div>
                            ) : (
                                msgs.map(m => (
                                    <div key={m.id} className={`msg-item ${selected?.id === m.id ? 'sel' : ''}`} onClick={() => setSelected(m)}>
                                        <div className="msg-sender">{m.from}</div>
                                        <div className="msg-subj">{m.subject}</div>
                                        <div className="msg-date">{m.date}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message pane */}
                        <div className="msg-pane">
                            {selected ? (
                                <>
                                    <div className="msg-pane-head">
                                        <h3>{selected.subject}</h3>
                                        <p className="msg-meta">From: <strong>{selected.from}</strong> · {selected.date}</p>
                                    </div>
                                    <p className="msg-body">{selected.body}</p>

                                    {/* Reply */}
                                    <div style={{ marginTop:'2rem', borderTop:'1px solid var(--border)', paddingTop:'1.5rem' }}>
                                        {sent ? (
                                            <div style={{ padding:'.8rem 1rem', background:'rgba(34,197,94,.12)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r-sm)', color:'#86efac', fontSize:'.88rem' }}>
                                                ✓ Reply sent successfully.
                                            </div>
                                        ) : (
                                            <form onSubmit={sendReply} style={{ display:'flex', gap:'.75rem', alignItems:'flex-end' }}>
                                                <textarea
                                                    style={{ flex:1, background:'rgba(255,255,255,.05)', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 14px', color:'var(--text)', fontFamily:'inherit', fontSize:'.9rem', resize:'vertical', minHeight:'80px', outline:'none' }}
                                                    placeholder={`Reply to ${selected.from}…`}
                                                    value={replyText}
                                                    onChange={e => setReply(e.target.value)}
                                                />
                                                <button type="submit" className="btn btn-primary">
                                                    <FaPaperPlane /> Send
                                                </button>
                                            </form>
                                        )}
                                    </div>
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
