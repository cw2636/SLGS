import React, { useState } from 'react';
import { useTheme, THEMES } from '../../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = useState(false);

    const currentTheme = THEMES[theme] || THEMES.classic;

    const swatchColors = {
        classic:   ['#F8F5EE', '#1B4D2E', '#8B6914'],
        evening:   ['#060E09', '#1A4D2E', '#C9A227'],
        chapel:    ['#03081A', '#0E3A6B', '#C9A227'],
        governors: ['#0E0800', '#7C2D12', '#D97706'],
        founders:  ['#08062A', '#2D1B6B', '#A78BFA'],
    };

    if (compact) {
        return (
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    title="Change theme"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-l)',
                        borderRadius: '999px', padding: '6px 12px', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '.78rem', fontWeight: 600,
                        transition: 'all .2s', width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-l)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <span style={{ fontSize: '1rem' }}>{currentTheme.icon}</span>
                    {currentTheme.label}
                </button>

                {open && (
                    <>
                        {/* Backdrop */}
                        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                        <div style={{
                            position: 'absolute', bottom: '110%', left: 0, right: 0,
                            background: 'var(--bg-alt)', border: '1px solid var(--border-l)',
                            borderRadius: 'var(--r)', padding: '.5rem', zIndex: 999,
                            boxShadow: 'var(--sh-md)', minWidth: '180px',
                        }}>
                            {Object.entries(THEMES).map(([key, t]) => {
                                const colors = swatchColors[key] || [];
                                const isActive = theme === key;
                                return (
                                    <button key={key} onClick={() => { setTheme(key); setOpen(false); }} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        width: '100%', padding: '.55rem .75rem', border: 'none',
                                        borderRadius: 'var(--r-sm)', cursor: 'pointer', textAlign: 'left',
                                        background: isActive ? 'var(--bg-card)' : 'transparent',
                                        color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 700 : 500, fontSize: '.85rem',
                                        transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text)'; }}}
                                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
                                    >
                                        {/* Color swatch */}
                                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                            {colors.map((c, i) => (
                                                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,.2)' }} />
                                            ))}
                                        </div>
                                        <span>{t.icon} {t.label}</span>
                                        {isActive && <span style={{ marginLeft: 'auto', fontSize: '.7rem' }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Full floating variant (for landing page)
    return (
        <div style={{ position: 'fixed', bottom: '5.5rem', right: '2rem', zIndex: 998 }}>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    title="Switch theme"
                    style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--gold)', color: '#05100a',
                        border: 'none', cursor: 'pointer', fontSize: '1.2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--sh-gold)', transition: 'transform .25s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    🎨
                </button>
                {open && (
                    <>
                        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 997 }} />
                        <div style={{
                            position: 'absolute', bottom: '110%', right: 0,
                            background: 'var(--bg-alt)', border: '1px solid var(--border-l)',
                            borderRadius: 'var(--r)', padding: '.5rem', zIndex: 999,
                            boxShadow: 'var(--sh-md)', minWidth: '185px',
                        }}>
                            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', padding: '.3rem .6rem .5rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                Color Theme
                            </div>
                            {Object.entries(THEMES).map(([key, t]) => {
                                const colors = swatchColors[key] || [];
                                const isActive = theme === key;
                                return (
                                    <button key={key} onClick={() => { setTheme(key); setOpen(false); }} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        width: '100%', padding: '.55rem .75rem', border: 'none',
                                        borderRadius: 'var(--r-sm)', cursor: 'pointer', textAlign: 'left',
                                        background: isActive ? 'var(--bg-card)' : 'transparent',
                                        color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 700 : 500, fontSize: '.85rem',
                                        transition: 'all .15s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text)'; }}}
                                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
                                    >
                                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                            {colors.map((c, i) => (
                                                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,.25)' }} />
                                            ))}
                                        </div>
                                        <span>{t.icon} {t.label}</span>
                                        {isActive && <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: '.8rem' }}>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
