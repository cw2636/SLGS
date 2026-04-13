import { useState, useMemo } from 'react';
import { FaEye } from 'react-icons/fa';

/**
 * FocusCheck — teacher-initiated comprehension pulse.
 * Students respond with: ✅ Clear | 😕 Confused | ⏭ Too Fast | 🔁 Repeat Please
 * Results shown as emoji heatmap unique to this educational context.
 * Nothing like this exists in Zoom or Teams.
 *
 * Events:
 *   focus_check   { checkId }           — teacher launches check
 *   focus_respond { checkId, response } — student responds
 *   focus_close   { checkId }           — teacher closes
 */
const RESPONSES = [
    { key: 'clear',   emoji: '✅', label: 'Clear'       },
    { key: 'confused',emoji: '😕', label: 'Confused'    },
    { key: 'fast',    emoji: '⏭', label: 'Too Fast'    },
    { key: 'repeat',  emoji: '🔁', label: 'Repeat Please'},
];

export default function FocusCheck({ events, send, isHost, sessionId }) {
    const [myResponses, setMyResponses] = useState({});

    const checks = useMemo(() => {
        const map = {};
        events.forEach(e => {
            if (e.type === 'focus_check') {
                map[e.payload.checkId] = { ...e.payload, responses: {}, closed: false };
            }
            if (e.type === 'focus_respond' && map[e.payload.checkId]) {
                map[e.payload.checkId].responses[e.from] = e.payload.response;
            }
            if (e.type === 'focus_close' && map[e.payload.checkId]) {
                map[e.payload.checkId].closed = true;
            }
        });
        return Object.values(map).reverse();
    }, [events]);

    const activeCheck = checks.find(c => !c.closed);

    const launch = () => {
        send('focus_check', { checkId: `fc-${Date.now()}` });
    };

    const respond = (checkId, response) => {
        if (myResponses[checkId]) return;
        send('focus_respond', { checkId, response });
        setMyResponses(r => ({ ...r, [checkId]: response }));
    };

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaEye /> Focus Check
                {isHost && (
                    <button className="edm-panel-action" onClick={launch}>
                        Check In
                    </button>
                )}
            </div>

            {activeCheck && (
                <div className="edm-focus-card">
                    <p className="edm-focus-prompt">How are you following along?</p>
                    <div className="edm-focus-responses">
                        {RESPONSES.map(r => {
                            const count = Object.values(activeCheck.responses).filter(v => v === r.key).length;
                            const total = Object.keys(activeCheck.responses).length || 1;
                            const pct = Math.round((count / total) * 100);
                            const myR = myResponses[activeCheck.checkId];
                            return (
                                <button
                                    key={r.key}
                                    className={`edm-focus-btn ${myR === r.key ? 'selected' : ''}`}
                                    onClick={() => !isHost && respond(activeCheck.checkId, r.key)}
                                    disabled={!!myR && myR !== r.key}
                                    title={r.label}
                                >
                                    <span className="edm-focus-emoji">{r.emoji}</span>
                                    <span className="edm-focus-label">{r.label}</span>
                                    {(isHost || myR) && (
                                        <div className="edm-focus-bar-wrap">
                                            <div className="edm-focus-bar" style={{ width: `${pct}%` }} />
                                            <span className="edm-focus-count">{count}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {isHost && (
                        <button className="edm-poll-close-btn" onClick={() => send('focus_close', { checkId: activeCheck.checkId })}>
                            Close Check
                        </button>
                    )}
                    {!isHost && !myResponses[activeCheck.checkId] && (
                        <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>Tap to respond — teacher sees results live</p>
                    )}
                </div>
            )}

            {/* Past checks summary */}
            {checks.filter(c => c.closed).slice(0, 3).map(c => {
                const total = Object.keys(c.responses).length;
                const tally = RESPONSES.map(r => ({ ...r, count: Object.values(c.responses).filter(v => v === r.key).length }));
                const top = tally.sort((a, b) => b.count - a.count)[0];
                return (
                    <div key={c.checkId} className="edm-focus-summary">
                        {tally.map(r => (
                            <span key={r.key} title={`${r.label}: ${r.count}`}>
                                {r.emoji} {r.count}
                            </span>
                        ))}
                        <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--text-muted)' }}>
                            Majority: {top.emoji} · {total} responses
                        </span>
                    </div>
                );
            })}

            {checks.length === 0 && (
                <p className="edm-panel-empty">{isHost ? 'Run a focus check to see how the class is keeping up.' : 'Teacher will run a focus check.'}</p>
            )}
        </div>
    );
}
