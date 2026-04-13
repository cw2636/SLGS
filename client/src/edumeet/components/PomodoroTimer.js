import { useState, useEffect, useRef } from 'react';
import { FaClock, FaPlay, FaPause, FaRedo } from 'react-icons/fa';

/**
 * PomodoroTimer — class-wide 25/5 Pomodoro study timer.
 * Teacher starts/pauses/resets; all students see the same countdown.
 * On break, a gentle notification is shown. Unique to educational context.
 *
 * Events:
 *   pomodoro_start  { endsAt, phase }   — phase: 'work' | 'break'
 *   pomodoro_pause  { remainingMs }
 *   pomodoro_reset  {}
 */

const PRESETS = [
    { label: '25/5', work: 25, brk: 5 },
    { label: '50/10', work: 50, brk: 10 },
    { label: '15/3', work: 15, brk: 3 },
];

export default function PomodoroTimer({ events, send, isHost }) {
    const [preset, setPreset] = useState(0);
    const [display, setDisplay] = useState('25:00');
    const [phase, setPhase] = useState('work');
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0); // 0–1
    const intervalRef = useRef(null);
    const stateRef = useRef({ endsAt: null, phase: 'work', paused: false, remainingMs: 0 });

    // Sync state from events
    useEffect(() => {
        if (!events.length) return;
        const last = [...events].reverse();
        const start  = last.find(e => e.type === 'pomodoro_start');
        const pause  = last.find(e => e.type === 'pomodoro_pause');
        const reset  = last.find(e => e.type === 'pomodoro_reset');

        // Most recent relevant event
        const recent = [start, pause, reset].filter(Boolean)
            .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))[0];

        if (!recent) return;

        if (recent.type === 'pomodoro_reset') {
            clearInterval(intervalRef.current);
            const p = PRESETS[preset];
            stateRef.current = { endsAt: null, phase: 'work', paused: false, remainingMs: p.work * 60 * 1000 };
            setDisplay(fmt(p.work * 60 * 1000));
            setPhase('work');
            setRunning(false);
            setProgress(0);
        } else if (recent.type === 'pomodoro_pause') {
            clearInterval(intervalRef.current);
            stateRef.current.paused = true;
            stateRef.current.remainingMs = recent.payload.remainingMs;
            setDisplay(fmt(recent.payload.remainingMs));
            setRunning(false);
        } else if (recent.type === 'pomodoro_start') {
            clearInterval(intervalRef.current);
            stateRef.current.paused = false;
            stateRef.current.endsAt = recent.payload.endsAt;
            stateRef.current.phase  = recent.payload.phase;
            setPhase(recent.payload.phase);
            setRunning(true);

            const totalMs = PRESETS[preset][recent.payload.phase === 'work' ? 'work' : 'brk'] * 60 * 1000;
            intervalRef.current = setInterval(() => {
                const rem = stateRef.current.endsAt - Date.now();
                if (rem <= 0) {
                    clearInterval(intervalRef.current);
                    setDisplay('0:00');
                    setRunning(false);
                    setProgress(1);
                    // Auto-switch phase (host sends the next start)
                    if (isHost) {
                        const nextPhase = stateRef.current.phase === 'work' ? 'break' : 'work';
                        const nextMs = PRESETS[preset][nextPhase === 'work' ? 'work' : 'brk'] * 60 * 1000;
                        send('pomodoro_start', { endsAt: Date.now() + nextMs, phase: nextPhase });
                    }
                    return;
                }
                setDisplay(fmt(rem));
                setProgress(1 - rem / totalMs);
            }, 500);
        }
    }, [events]); // eslint-disable-line

    useEffect(() => () => clearInterval(intervalRef.current), []);

    const fmt = (ms) => {
        const s = Math.max(0, Math.floor(ms / 1000));
        return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    const handleStart = () => {
        const p = PRESETS[preset];
        const ms = (stateRef.current.paused ? stateRef.current.remainingMs : p.work * 60 * 1000);
        send('pomodoro_start', { endsAt: Date.now() + ms, phase: stateRef.current.phase || 'work' });
    };

    const handlePause = () => {
        const rem = stateRef.current.endsAt - Date.now();
        send('pomodoro_pause', { remainingMs: Math.max(0, rem) });
    };

    const handleReset = () => {
        send('pomodoro_reset', {});
    };

    const circumference = 2 * Math.PI * 40;
    const dashoffset    = circumference * (1 - progress);
    const color = phase === 'work' ? 'var(--green-light)' : 'var(--gold-light)';

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaClock /> Pomodoro Timer
            </div>

            <div className="edm-pomodoro">
                {/* Phase badge */}
                <div className={`edm-pomo-phase ${phase}`}>
                    {phase === 'work' ? '📚 Focus Time' : '☕ Break Time'}
                </div>

                {/* Circular countdown */}
                <div className="edm-pomo-circle-wrap">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
                            strokeDasharray={circumference} strokeDashoffset={dashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'stroke-dashoffset .5s linear' }}
                        />
                    </svg>
                    <div className="edm-pomo-time">{display}</div>
                </div>

                {/* Preset selector (host only, when not running) */}
                {isHost && !running && (
                    <div className="edm-pomo-presets">
                        {PRESETS.map((p, i) => (
                            <button key={p.label} className={`edm-pomo-preset ${preset === i ? 'active' : ''}`}
                                onClick={() => setPreset(i)}>{p.label}</button>
                        ))}
                    </div>
                )}

                {/* Controls (host only) */}
                {isHost && (
                    <div className="edm-pomo-controls">
                        {running
                            ? <button onClick={handlePause}><FaPause /> Pause</button>
                            : <button onClick={handleStart}><FaPlay /> {stateRef.current.paused ? 'Resume' : 'Start'}</button>
                        }
                        <button onClick={handleReset}><FaRedo /> Reset</button>
                    </div>
                )}

                {!isHost && !running && (
                    <p className="edm-panel-empty" style={{ marginTop: '.5rem' }}>Teacher controls the timer</p>
                )}
            </div>
        </div>
    );
}
