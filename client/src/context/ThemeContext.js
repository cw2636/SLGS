import React, { createContext, useContext, useState, useEffect } from 'react';

// ── SLGS Theme definitions ─────────────────────────────────
// Each theme must supply ALL CSS custom properties used in index.css
export const THEMES = {

    // ── SLGS Classic — Parchment Day Light (DEFAULT) ──────
    classic: {
        label: 'SLGS Classic',
        icon: '📜',
        vars: {
            '--bg':           '#F8F5EE',
            '--bg-alt':       '#EDE8DA',
            '--bg-card':      'rgba(255,255,255,0.72)',
            '--bg-card-h':    'rgba(255,255,255,0.92)',
            '--green':        '#1B4D2E',
            '--green-mid':    '#2D6A4F',
            '--green-light':  '#40916C',
            '--green-dim':    'rgba(27,77,46,0.1)',
            '--gold':         '#8B6914',
            '--gold-light':   '#C9A227',
            '--gold-dim':     'rgba(139,105,20,0.1)',
            '--gold-border':  'rgba(139,105,20,0.28)',
            '--accent':       '#1565C0',
            '--accent-dim':   'rgba(21,101,192,0.1)',
            '--accent-border':'rgba(21,101,192,0.3)',
            '--text':         '#1A1208',
            '--text-muted':   '#4A4530',
            '--text-dim':     '#8A8470',
            '--border':       'rgba(0,0,0,0.1)',
            '--border-l':     'rgba(0,0,0,0.16)',
            '--sh-md':        '0 8px 28px rgba(0,0,0,0.12)',
            '--sh-gold':      '0 8px 24px rgba(139,105,20,0.28)',
            '--sh-glow':      '0 0 0 2px rgba(139,105,20,0.25)',
            '--glass-bg':     'rgba(255,255,255,0.65)',
            '--glass-border': 'rgba(0,0,0,0.1)',
            '--nav-bg':       'rgba(248,245,238,0.94)',
            '--footer-bg':    '#1A1208',
            '--auth-bg2':     '#E4DDCC',
            '--hist-bg2':     '#DDD5C2',
            '--profile-bg2':  '#E4DDCB',
            '--hero-g1':      'rgba(27,77,46,0.14)',
            '--hero-g2':      'rgba(139,105,20,0.09)',
            '--hero-g3':      'rgba(64,145,108,0.07)',
            '--grid-line':    'rgba(0,0,0,0.04)',
            '--orb1':         'rgba(27,77,46,0.13)',
            '--orb2':         'rgba(139,105,20,0.09)',
            '--input-bg':     'rgba(0,0,0,0.04)',
            '--auth-l-glow':  'rgba(27,77,46,0.25)',
            '--auth-l-gold':  'rgba(139,105,20,0.07)',
        },
    },

    // ── Evening Hall — Deep Forest Green ──────────────────
    evening: {
        label: 'Evening Hall',
        icon: '🌿',
        vars: {
            '--bg':           '#060E09',
            '--bg-alt':       '#0C1A10',
            '--bg-card':      'rgba(255,255,255,0.04)',
            '--bg-card-h':    'rgba(255,255,255,0.07)',
            '--green':        '#1A4D2E',
            '--green-mid':    '#2D6A4F',
            '--green-light':  '#52B788',
            '--green-dim':    'rgba(26,77,46,0.5)',
            '--gold':         '#C9A227',
            '--gold-light':   '#E8C45A',
            '--gold-dim':     'rgba(201,162,39,0.14)',
            '--gold-border':  'rgba(201,162,39,0.34)',
            '--accent':       '#38bdf8',
            '--accent-dim':   'rgba(56,189,248,0.12)',
            '--accent-border':'rgba(56,189,248,0.35)',
            '--text':         '#F0EDE4',
            '--text-muted':   '#A8A489',
            '--text-dim':     '#6B6950',
            '--border':       'rgba(255,255,255,0.08)',
            '--border-l':     'rgba(255,255,255,0.13)',
            '--sh-md':        '0 12px 40px rgba(0,0,0,0.5)',
            '--sh-gold':      '0 10px 40px rgba(201,162,39,0.38)',
            '--sh-glow':      '0 0 0 2px rgba(201,162,39,0.34)',
            '--glass-bg':     'rgba(255,255,255,0.05)',
            '--glass-border': 'rgba(255,255,255,0.12)',
            '--nav-bg':       'rgba(6,14,9,0.92)',
            '--footer-bg':    '#030A05',
            '--auth-bg2':     '#0D2115',
            '--hist-bg2':     '#0C2217',
            '--profile-bg2':  '#0D2115',
            '--hero-g1':      'rgba(26,77,46,0.24)',
            '--hero-g2':      'rgba(201,162,39,0.08)',
            '--hero-g3':      'rgba(82,183,136,0.07)',
            '--grid-line':    'rgba(255,255,255,0.025)',
            '--orb1':         'rgba(26,77,46,0.3)',
            '--orb2':         'rgba(201,162,39,0.15)',
            '--input-bg':     'rgba(255,255,255,0.05)',
            '--auth-l-glow':  'rgba(26,77,46,0.4)',
            '--auth-l-gold':  'rgba(201,162,39,0.08)',
        },
    },
    // ── Chapel Blue — Sierra Leone Navy ───────────────────
    chapel: {
        label: 'Chapel Blue',
        icon: '⛪',
        vars: {
            '--bg':           '#03081A',
            '--bg-alt':       '#08112A',
            '--bg-card':      'rgba(255,255,255,0.04)',
            '--bg-card-h':    'rgba(255,255,255,0.07)',
            '--green':        '#0E3A6B',
            '--green-mid':    '#155A9A',
            '--green-light':  '#60A5FA',
            '--green-dim':    'rgba(14,58,107,0.5)',
            '--gold':         '#C9A227',
            '--gold-light':   '#E8C45A',
            '--gold-dim':     'rgba(201,162,39,0.14)',
            '--gold-border':  'rgba(201,162,39,0.34)',
            '--accent':       '#38bdf8',
            '--accent-dim':   'rgba(56,189,248,0.12)',
            '--accent-border':'rgba(56,189,248,0.35)',
            '--text':         '#E8F2FF',
            '--text-muted':   '#8AAED0',
            '--text-dim':     '#4F6D8A',
            '--border':       'rgba(255,255,255,0.08)',
            '--border-l':     'rgba(255,255,255,0.14)',
            '--sh-md':        '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':      '0 10px 40px rgba(201,162,39,0.35)',
            '--sh-glow':      '0 0 0 2px rgba(201,162,39,0.34)',
            '--glass-bg':     'rgba(255,255,255,0.05)',
            '--glass-border': 'rgba(255,255,255,0.12)',
            '--nav-bg':       'rgba(3,8,26,0.92)',
            '--footer-bg':    '#020614',
            '--auth-bg2':     '#0A1A3A',
            '--hist-bg2':     '#0A1838',
            '--profile-bg2':  '#0A1A3A',
            '--hero-g1':      'rgba(21,101,192,0.22)',
            '--hero-g2':      'rgba(201,162,39,0.08)',
            '--hero-g3':      'rgba(56,189,248,0.06)',
            '--grid-line':    'rgba(255,255,255,0.025)',
            '--orb1':         'rgba(21,101,192,0.28)',
            '--orb2':         'rgba(201,162,39,0.12)',
            '--input-bg':     'rgba(255,255,255,0.05)',
            '--auth-l-glow':  'rgba(21,101,192,0.38)',
            '--auth-l-gold':  'rgba(201,162,39,0.07)',
        },
    },
    // ── Governors' Rest — Warm Mahogany ───────────────────
    governors: {
        label: "Governors' Rest",
        icon: '🏛️',
        vars: {
            '--bg':           '#0E0800',
            '--bg-alt':       '#1C1100',
            '--bg-card':      'rgba(255,255,255,0.04)',
            '--bg-card-h':    'rgba(255,255,255,0.07)',
            '--green':        '#7C2D12',
            '--green-mid':    '#9A3412',
            '--green-light':  '#FB923C',
            '--green-dim':    'rgba(124,45,18,0.5)',
            '--gold':         '#D97706',
            '--gold-light':   '#F59E0B',
            '--gold-dim':     'rgba(217,119,6,0.14)',
            '--gold-border':  'rgba(217,119,6,0.35)',
            '--accent':       '#F97316',
            '--accent-dim':   'rgba(249,115,22,0.14)',
            '--accent-border':'rgba(249,115,22,0.35)',
            '--text':         '#FEF3E8',
            '--text-muted':   '#C8A87A',
            '--text-dim':     '#7A5A38',
            '--border':       'rgba(255,255,255,0.08)',
            '--border-l':     'rgba(255,255,255,0.14)',
            '--sh-md':        '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':      '0 10px 40px rgba(217,119,6,0.38)',
            '--sh-glow':      '0 0 0 2px rgba(217,119,6,0.35)',
            '--glass-bg':     'rgba(255,255,255,0.05)',
            '--glass-border': 'rgba(255,255,255,0.12)',
            '--nav-bg':       'rgba(14,8,0,0.92)',
            '--footer-bg':    '#070400',
            '--auth-bg2':     '#1C1005',
            '--hist-bg2':     '#1C1005',
            '--profile-bg2':  '#1C1005',
            '--hero-g1':      'rgba(124,45,18,0.2)',
            '--hero-g2':      'rgba(217,119,6,0.1)',
            '--hero-g3':      'rgba(249,115,22,0.07)',
            '--grid-line':    'rgba(255,255,255,0.025)',
            '--orb1':         'rgba(124,45,18,0.25)',
            '--orb2':         'rgba(217,119,6,0.15)',
            '--input-bg':     'rgba(255,255,255,0.05)',
            '--auth-l-glow':  'rgba(124,45,18,0.4)',
            '--auth-l-gold':  'rgba(217,119,6,0.08)',
        },
    },
    // ── Founders' Night — Deep Amethyst ───────────────────
    founders: {
        label: "Founders' Night",
        icon: '🕯️',
        vars: {
            '--bg':           '#08062A',
            '--bg-alt':       '#100D38',
            '--bg-card':      'rgba(255,255,255,0.04)',
            '--bg-card-h':    'rgba(255,255,255,0.07)',
            '--green':        '#2D1B6B',
            '--green-mid':    '#4338CA',
            '--green-light':  '#818CF8',
            '--green-dim':    'rgba(45,27,107,0.5)',
            '--gold':         '#A78BFA',
            '--gold-light':   '#C4B5FD',
            '--gold-dim':     'rgba(167,139,250,0.14)',
            '--gold-border':  'rgba(167,139,250,0.35)',
            '--accent':       '#F0ABFC',
            '--accent-dim':   'rgba(240,171,252,0.12)',
            '--accent-border':'rgba(240,171,252,0.35)',
            '--text':         '#EDE9FF',
            '--text-muted':   '#9B8EC4',
            '--text-dim':     '#5C527A',
            '--border':       'rgba(255,255,255,0.08)',
            '--border-l':     'rgba(255,255,255,0.14)',
            '--sh-md':        '0 12px 40px rgba(0,0,0,0.55)',
            '--sh-gold':      '0 10px 40px rgba(167,139,250,0.38)',
            '--sh-glow':      '0 0 0 2px rgba(167,139,250,0.35)',
            '--glass-bg':     'rgba(255,255,255,0.05)',
            '--glass-border': 'rgba(255,255,255,0.12)',
            '--nav-bg':       'rgba(8,6,42,0.92)',
            '--footer-bg':    '#040318',
            '--auth-bg2':     '#140E3A',
            '--hist-bg2':     '#140E38',
            '--profile-bg2':  '#140E3A',
            '--hero-g1':      'rgba(45,27,107,0.24)',
            '--hero-g2':      'rgba(167,139,250,0.1)',
            '--hero-g3':      'rgba(129,140,248,0.07)',
            '--grid-line':    'rgba(255,255,255,0.025)',
            '--orb1':         'rgba(45,27,107,0.3)',
            '--orb2':         'rgba(167,139,250,0.15)',
            '--input-bg':     'rgba(255,255,255,0.05)',
            '--auth-l-glow':  'rgba(45,27,107,0.4)',
            '--auth-l-gold':  'rgba(167,139,250,0.08)',
        },
    },
};

const ThemeContext = createContext({ theme: 'classic', setTheme: () => {} });

// Migrate legacy theme keys to new SLGS names
const MIGRATE = { dark: 'evening', light: 'classic', ocean: 'chapel', ember: 'governors', midnight: 'founders' };

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('slgs-theme');
        if (saved && THEMES[saved]) return saved;
        if (saved && MIGRATE[saved]) return MIGRATE[saved];
        return 'classic';
    });

    const setTheme = t => {
        setThemeState(t);
        localStorage.setItem('slgs-theme', t);
    };

    // Apply CSS custom properties to :root on every theme change
    useEffect(() => {
        const vars = THEMES[theme]?.vars || THEMES.classic.vars;
        const root = document.documentElement;
        Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
        document.body.style.background = vars['--bg'] || '';
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
