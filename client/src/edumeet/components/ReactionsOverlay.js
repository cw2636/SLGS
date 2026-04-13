import { useState, useEffect, useCallback } from 'react';

/**
 * ReactionsOverlay — floating emoji reactions unique to the classroom.
 * 5 educational reactions beyond Zoom's generic applause:
 *   ✅ Got it · ❓ Question · ⚡ Too Fast · 💡 Good Example · 🤯 Mind Blown
 *
 * Reactions float up and fade out. Teacher sees a summary count.
 *
 * Events:
 *   reaction { emoji, name }
 */

const REACTIONS = [
    { emoji: '✅', label: 'Got it'      },
    { emoji: '❓', label: 'Question'    },
    { emoji: '⚡', label: 'Too Fast'    },
    { emoji: '💡', label: 'Example'     },
    { emoji: '🤯', label: 'Mind Blown'  },
];

export default function ReactionsOverlay({ events, send, user }) {
    const [floaters, setFloaters] = useState([]); // { id, emoji, x }
    const [cooldown, setCooldown] = useState(false);

    // Spawn floaters from events
    useEffect(() => {
        if (!events.length) return;
        const last = events[events.length - 1];
        if (last.type !== 'reaction') return;
        const id = Date.now() + Math.random();
        setFloaters(f => [...f, { id, emoji: last.payload.emoji, x: 10 + Math.random() * 80 }]);
        setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 3000);
    }, [events]);

    const react = useCallback((emoji) => {
        if (cooldown) return;
        send('reaction', { emoji, name: user?.name || 'Someone' });
        setCooldown(true);
        setTimeout(() => setCooldown(false), 1500); // 1.5s cooldown
    }, [cooldown, send, user]);

    // Count recent reactions for teacher summary
    const recentReactions = events
        .filter(e => e.type === 'reaction')
        .slice(-50)
        .reduce((acc, e) => {
            acc[e.payload.emoji] = (acc[e.payload.emoji] || 0) + 1;
            return acc;
        }, {});

    return (
        <>
            {/* Floating animations layer */}
            <div className="edm-reactions-overlay" aria-hidden="true">
                {floaters.map(f => (
                    <span key={f.id} className="edm-floater" style={{ left: `${f.x}%` }}>
                        {f.emoji}
                    </span>
                ))}
            </div>

            {/* Reaction bar */}
            <div className="edm-reaction-bar">
                {REACTIONS.map(r => (
                    <button
                        key={r.emoji}
                        className={`edm-react-btn ${cooldown ? 'edm-react-cooldown' : ''}`}
                        onClick={() => react(r.emoji)}
                        title={r.label}
                    >
                        {r.emoji}
                        {recentReactions[r.emoji] > 0 && (
                            <span className="edm-react-count">{recentReactions[r.emoji]}</span>
                        )}
                    </button>
                ))}
            </div>
        </>
    );
}
