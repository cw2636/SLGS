import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import { FaEnvelope, FaPaperPlane, FaUsers, FaUser } from 'react-icons/fa';
import { MESSAGES, COURSES, CLASS_ROSTER } from '../../data/mockData';

export default function TeacherMessages() {
    const { user } = useAuth();

    // Courses this teacher teaches
    const myCourses = useMemo(
        () => COURSES.filter(c => c.teacherId === user?.staffId),
        [user]
    );

    const [msgs,     setMsgs]     = useState(MESSAGES);
    const [selected, setSelected] = useState(msgs[0] ?? null);
    const [compose,  setCompose]  = useState(false);
    const [sent,     setSent]     = useState(false);

    // Compose form state
    const [recipientType, setRecipientType] = useState('individual'); // 'individual' | 'class'
    const [selectedCourseId, setSelectedCourseId] = useState(myCourses[0]?.id ?? '');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [subject, setSubject] = useState('');
    const [body,    setBody]    = useState('');

    // Class roster for the selected course
    const selectedCourse = myCourses.find(c => c.id === selectedCourseId);
    const classKey  = selectedCourse ? `${selectedCourse.form}${selectedCourse.section}` : null;
    const classRoster = classKey ? (CLASS_ROSTER[classKey] ?? []) : [];

    const resetCompose = () => {
        setRecipientType('individual');
        setSelectedCourseId(myCourses[0]?.id ?? '');
        setSelectedStudentId('');
        setSubject('');
        setBody('');
    };

    const sendMsg = (e) => {
        e.preventDefault();
        const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const from = user?.name ?? 'Teacher';

        if (recipientType === 'class') {
            // Broadcast to all students in the class
            const newMsgs = classRoster.map((student, i) => ({
                id: Date.now() + i,
                from, fromRole: 'teacher',
                to: student.username ?? student.name,
                toDisplay: student.name,
                subject,
                body,
                date: now,
                group: classKey,
            }));
            setMsgs(p => [...newMsgs, ...p]);
            setSelected(newMsgs[0]);
        } else {
            const student = classRoster.find(s => s.id === selectedStudentId);
            if (!student) return;
            const m = {
                id: Date.now(),
                from, fromRole: 'teacher',
                to: student.username ?? student.name,
                toDisplay: student.name,
                subject,
                body,
                date: now,
            };
            setMsgs(p => [m, ...p]);
            setSelected(m);
        }

        setCompose(false);
        resetCompose();
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
                        <button className="btn btn-primary btn-sm" onClick={() => { setCompose(p => !p); resetCompose(); }}>
                            <FaPaperPlane /> {compose ? 'Cancel' : 'Compose'}
                        </button>
                    </div>
                </div>

                <div className="portal-content">
                    {sent && (
                        <div style={{ marginBottom: '1rem', padding: '.8rem 1rem', background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 'var(--r-sm)', color: '#86efac', fontSize: '.88rem' }}>
                            ✓ Message sent successfully.
                        </div>
                    )}

                    {compose && (
                        <div className="d-card" style={{ marginBottom: '1.5rem' }}>
                            <div className="d-card-title"><FaPaperPlane /> New Message</div>
                            <form onSubmit={sendMsg} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>

                                {/* Recipient type toggle */}
                                <div className="fg">
                                    <label>Send to</label>
                                    <div style={{ display: 'flex', gap: '.5rem' }}>
                                        <button type="button"
                                            className={`btn btn-sm ${recipientType === 'individual' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setRecipientType('individual')}
                                        >
                                            <FaUser /> Individual student
                                        </button>
                                        <button type="button"
                                            className={`btn btn-sm ${recipientType === 'class' ? 'btn-primary' : 'btn-outline'}`}
                                            onClick={() => setRecipientType('class')}
                                        >
                                            <FaUsers /> Whole class
                                        </button>
                                    </div>
                                </div>

                                {/* Class selector */}
                                <div className="fg">
                                    <label>Class</label>
                                    <select
                                        required
                                        value={selectedCourseId}
                                        onChange={e => { setSelectedCourseId(e.target.value); setSelectedStudentId(''); }}
                                    >
                                        <option value="">— Select class —</option>
                                        {myCourses.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.form}{c.section} — {c.title}
                                            </option>
                                        ))}
                                    </select>
                                    {recipientType === 'class' && selectedCourse && (
                                        <div style={{ marginTop: '5px', fontSize: '.78rem', color: 'var(--text-muted)' }}>
                                            This will send to all {classRoster.length} student{classRoster.length !== 1 ? 's' : ''} in {classKey}.
                                        </div>
                                    )}
                                </div>

                                {/* Student selector (individual only) */}
                                {recipientType === 'individual' && (
                                    <div className="fg">
                                        <label>Student</label>
                                        <select
                                            required
                                            value={selectedStudentId}
                                            onChange={e => setSelectedStudentId(e.target.value)}
                                            disabled={!selectedCourseId}
                                        >
                                            <option value="">— Select student —</option>
                                            {classRoster.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="fg">
                                    <label>Subject</label>
                                    <input required value={subject} onChange={e => setSubject(e.target.value)} />
                                </div>
                                <div className="fg">
                                    <label>Message</label>
                                    <textarea
                                        rows={5} required value={body}
                                        onChange={e => setBody(e.target.value)}
                                        style={{ resize: 'vertical', background: 'rgba(255,255,255,.05)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px 14px', color: 'var(--text)', fontFamily: 'inherit', fontSize: '.9rem', outline: 'none' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                                    <FaPaperPlane /> Send {recipientType === 'class' ? `to ${classKey}` : 'Message'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="msg-layout">
                        <div className="msg-list">
                            <div className="msg-list-head"><FaEnvelope style={{ color: 'var(--gold)', marginRight: '8px' }} />All Messages</div>
                            {msgs.map(m => (
                                <div key={m.id} className={`msg-item ${selected?.id === m.id ? 'sel' : ''}`} onClick={() => setSelected(m)}>
                                    <div className="msg-sender">
                                        {m.group
                                            ? <><FaUsers style={{ fontSize: '.8rem', marginRight: '4px', opacity: .7 }} />{m.group}</>
                                            : <>{m.from} → {m.toDisplay ?? m.to}</>
                                        }
                                    </div>
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
                                        <p className="msg-meta">
                                            From: <strong>{selected.from}</strong>
                                            {' → '}
                                            {selected.group
                                                ? <><FaUsers style={{ fontSize: '.8rem', marginRight: '3px' }} /><strong>All students in {selected.group}</strong></>
                                                : <>To: <strong>{selected.toDisplay ?? selected.to}</strong></>
                                            }
                                            {' · '}{selected.date}
                                        </p>
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
