import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Theme definitions ──────────────────────────────────────
export const THEMES = {
    dark: {
        label: 'Forest Dark',
        icon: '🌲',
        vars: {
            '--bg':          '#070f09',
            '--bg-alt':      '#0d1a0f',
            '--bg-card':     'rgba(255,255,255,0.04)',
            '--bg-card-h':   'rgba(255,255,255,0.07)',
            '--green':       '#1a4d2e',
            '--green-mid':   '#2d6a4f',
            '--green-light': '#52b788',
            '--green-dim':   'rgba(26,77,46,0.5)',
            '--gold':        '#c9a227',
            '--gold-light':  '#e8c45a',
            '--gold-dim':    'rgba(201,162,39,0.14)',
            '--gold-border': 'rgba(201,162,39,0.34)',
            '--text':        '#f0ede4',
            '--text-muted':  '#a8a489',
            '--text-dim':    '#6b6950',
            '--border':      'rgba(255,255,255,0.08)',
            '--border-l':    'rgba(255,255,255,0.13)',
            '--sh-md':       '0 12px 40px rgba(0,0,0,0.5)',
            '--sh-gold':     '0 10px 40px rgba(201,162,39,0.38)',
        },
    },
    light: {
        label: 'Clean Light',
        icon: '☀️',
        vars: {
            '--bg':          '#f6f3ec',
            '--bg-alt':      '#ede9df',
            '--bg-card':     'rgba(0,0,0,0.04)',
            '--bg-card-h':   'rgba(0,0,0,0.07)',
            '--green':       '#1a4d2e',
            '--green-mid':   '#2d6a4f',
            '--green-light': '#2d6a4f',
            '--green-dim':   'rgba(26,77,46,0.1)',
            '--gold':        '#a07a0a',
            '--gold-light':  '#c9a227',
            '--gold-dim':    'rgba(160,122,10,0.1)',
            '--gold-border': 'rgba(160,122,10,0.3)',
            '--text':        '#1a1a0e',
            '--text-muted':  '#50503a',
            '--text-dim':    '#9a9880',
            '--border':      'rgba(0,0,0,0.1)',
            '--border-l':    'rgba(0,0,0,0.18)',
            '--sh-md':       '0 8px 30px rgba(0,0,0,0.12)',
            '--sh-gold':     '0 8px 28px rgba(160,122,10,0.28)',
        },
    },
    ocean: {
        label: 'Deep Ocean',
        icon: '🌊',
        vars: {
            '--bg':          '#060d18',
            '--bg-alt':      '#0c1829',
            '--bg-card':     'rgba(255,255,255,0.04)',
            '--bg-card-h':   'rgba(255,255,255,0.07)',
            '--green':       '#0e3a5e',
            '--green-mid':   '#155a8a',
            '--green-light': '#38bdf8',
            '--green-dim':   'rgba(14,58,94,0.5)',
            '--gold':        '#06b6d4',
            '--gold-light':  '#38bdf8',
            '--gold-dim':    'rgba(6,182,212,0.14)',
            '--gold-border': 'rgba(6,182,212,0.35)',
            '--text':        '#e8f4ff',
            '--text-muted':  '#8aadcc',
            '--text-dim':    '#506a88',
            '--border':      'rgba(255,255,255,0.08)',
            '--border-l':    'rgba(255,255,255,0.14)',
            '--sh-md':       '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':     '0 10px 40px rgba(6,182,212,0.35)',
        },
    },
    ember: {
        label: 'Ember',
        icon: '🔥',
        vars: {
            '--bg':          '#0f0a04',
            '--bg-alt':      '#1a1108',
            '--bg-card':     'rgba(255,255,255,0.04)',
            '--bg-card-h':   'rgba(255,255,255,0.07)',
            '--green':       '#7c2d12',
            '--green-mid':   '#9a3412',
            '--green-light': '#fb923c',
            '--green-dim':   'rgba(124,45,18,0.5)',
            '--gold':        '#f97316',
            '--gold-light':  '#fdba74',
            '--gold-dim':    'rgba(249,115,22,0.14)',
            '--gold-border': 'rgba(249,115,22,0.35)',
            '--text':        '#fef3e8',
            '--text-muted':  '#c8a87a',
            '--text-dim':    '#7a5a38',
            '--border':      'rgba(255,255,255,0.08)',
            '--border-l':    'rgba(255,255,255,0.14)',
            '--sh-md':       '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':     '0 10px 40px rgba(249,115,22,0.35)',
        },
    },
    midnight: {
        label: 'Midnight',
        icon: '🌙',
        vars: {
            '--bg':          '#080810',
            '--bg-alt':      '#0e0e1c',
            '--bg-card':     'rgba(255,255,255,0.04)',
            '--bg-card-h':   'rgba(255,255,255,0.07)',
            '--green':       '#2d1b6b',
            '--green-mid':   '#4338ca',
            '--green-light': '#818cf8',
            '--green-dim':   'rgba(45,27,107,0.5)',
            '--gold':        '#a78bfa',
            '--gold-light':  '#c4b5fd',
            '--gold-dim':    'rgba(167,139,250,0.14)',
            '--gold-border': 'rgba(167,139,250,0.35)',
            '--text':        '#ede9ff',
            '--text-muted':  '#9b8ec4',
            '--text-dim':    '#5c527a',
            '--border':      'rgba(255,255,255,0.08)',
            '--border-l':    'rgba(255,255,255,0.14)',
            '--sh-md':       '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':     '0 10px 40px rgba(167,139,250,0.35)',
        },
    },
};

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => localStorage.getItem('slgs-theme') || 'dark');

    const setTheme = t => {
        setThemeState(t);
        localStorage.setItem('slgs-theme', t);
    };

    // Apply CSS variables to :root on theme change
    useEffect(() => {
        const vars = THEMES[theme]?.vars || THEMES.dark.vars;
        const root = document.documentElement;
        Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

        // body background sync for light mode
        document.body.style.background = vars['--bg'] || '';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
