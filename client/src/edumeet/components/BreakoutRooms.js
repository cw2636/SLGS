import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTimes, FaUsers, FaDoorOpen, FaDoorClosed, FaClock, FaRandom } from 'react-icons/fa';

/**
 * BreakoutRooms — fully enhanced breakout room manager.
 *
 * New vs old version:
 *   ✦ Auto-group: assigns students to N balanced groups randomly
 *   ✦ Countdown timer per breakout session with auto-return
 *   ✦ LiveKit room switching: students reconnect to sub-room via livekit-token API
 *   ✦ Teacher monitoring: see which room each student is in while they're in breakout
 *
 * Events:
 *   breakout_create  { rooms: [{id, name, members[]}], durationMin }
 *   breakout_close   {}
 *   breakout_join    { roomId }
 *   breakout_token   { roomId, token, url }   ← server sends this to each student
 *   breakout_list    { rooms }                ← broadcast current state
 */
export default function BreakoutRooms({ send, events, participants, isHost, currentRoomId, onLiveKitSwitch }) {
    const [rooms, setRooms]         = useState([]);
    const [newName, setNewName]     = useState('');
    const [active, setActive]       = useState(false);
    const [durationMin, setDuration]= useState(10);
    const [timeLeft, setTimeLeft]   = useState(null);   // seconds remaining
    const [myBreakoutToken, setMyBreakoutToken] = useState(null);
    const timerRef = useRef(null);

    const students = participants.filter(p => p.role === 'student');

    // ── Event handling ────────────────────────────────────────────
    useEffect(() => {
        if (!events.length) return;
        const last = events[events.length - 1];

        if (last.type === 'breakout_create') {
            setRooms(last.payload.rooms);
            setActive(true);
            startCountdown(last.payload.durationMin * 60);
        }
        if (last.type === 'breakout_close') {
            setActive(false);
            setRooms([]);
            setMyBreakoutToken(null);
            clearInterval(timerRef.current);
            setTimeLeft(null);
            onLiveKitSwitch?.(null); // return to main room
        }
        // Server sends the student their breakout-room token
        if (last.type === 'breakout_token') {
            setMyBreakoutToken({ token: last.payload.token, url: last.payload.url });
            onLiveKitSwitch?.({ token: last.payload.token, url: last.payload.url, roomId: last.payload.roomId });
        }
        if (last.type === 'breakout_list') {
            setRooms(last.payload.rooms);
        }
    }, [events]); // eslint-disable-line

    const startCountdown = (seconds) => {
        clearInterval(timerRef.current);
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (isHost) send('breakout_close', {});
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    // ── Helpers ───────────────────────────────────────────────────
    const addRoom = () => {
        if (!newName.trim()) return;
        setRooms(r => [...r, { id: `${currentRoomId}-br-${Date.now().toString(36)}`, name: newName.trim(), members: [] }]);
        setNewName('');
    };

    const removeRoom = (id) => setRooms(r => r.filter(x => x.id !== id));

    const assignToRoom = (studentId, roomId) => {
        setRooms(r => r.map(room => {
            const members = room.members.filter(m => m !== studentId);
            if (room.id === roomId) members.push(studentId);
            return { ...room, members };
        }));
    };

    /** Auto-group: randomly distribute students into existing rooms evenly */
    const autoGroup = () => {
        if (rooms.length === 0 || students.length === 0) return;
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        const updated = rooms.map(r => ({ ...r, members: [] }));
        shuffled.forEach((s, i) => {
            updated[i % updated.length].members.push(s.user_id);
        });
        setRooms(updated);
    };

    /** Auto-create N groups and evenly distribute */
    const autoCreateGroups = (n) => {
        const newRooms = Array.from({ length: n }, (_, i) => ({
            id: `${currentRoomId}-br-${i + 1}-${Date.now().toString(36)}`,
            name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C...
            members: [],
        }));
        const shuffled = [...students].sort(() => Math.random() - 0.5);
        shuffled.forEach((s, i) => newRooms[i % n].members.push(s.user_id));
        setRooms(newRooms);
    };

    const startBreakout = () => {
        send('breakout_create', {
            rooms: rooms.map(r => ({ id: r.id, name: r.name, members: r.members })),
            durationMin,
            mainRoomId: currentRoomId,
        });
        setActive(true);
        startCountdown(durationMin * 60);
    };

    const closeBreakout = () => {
        send('breakout_close', {});
        setActive(false);
        setRooms([]);
        clearInterval(timerRef.current);
        setTimeLeft(null);
    };

    const getStudentName = (id) => participants.find(p => p.user_id === id)?.name || id;
    const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    // ── Student view ──────────────────────────────────────────────
    if (!isHost) {
        const myId = participants.find(p => p.role === 'student')?.user_id;
        const myRoom = rooms.find(r => r.members?.includes(myId));
        return (
            <div className="edm-breakout">
                <div className="edm-breakout-header"><FaUsers /> Breakout Rooms</div>
                <div className="edm-breakout-body">
                    {timeLeft !== null && (
                        <div className="edm-br-timer">
                            <FaClock /> {fmtTime(timeLeft)} remaining
                        </div>
                    )}
                    {myRoom ? (
                        <div className="edm-breakout-assigned">
                            <FaDoorOpen style={{ color: 'var(--gold)', fontSize: '1.5rem' }} />
                            <p>You're in: <strong>{myRoom.name}</strong></p>
                            {myBreakoutToken
                                ? <p className="edm-br-connected">✅ Connected to breakout room</p>
                                : (
                                    <button className="btn btn-primary btn-sm"
                                        onClick={() => send('breakout_join', { roomId: myRoom.id })}>
                                        Join Breakout Room
                                    </button>
                                )
                            }
                        </div>
                    ) : (
                        <p className="edm-breakout-waiting">
                            {rooms.length > 0 ? 'Waiting for assignment…' : 'No breakout rooms active.'}
                        </p>
                    )}
                    {rooms.length > 0 && (
                        <div className="edm-breakout-list">
                            {rooms.map(r => (
                                <div key={r.id} className={`edm-breakout-item ${myRoom?.id === r.id ? 'edm-br-mine' : ''}`}>
                                    <span className="edm-breakout-name">{r.name}</span>
                                    <span className="edm-breakout-count">{r.members?.length || 0} members</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Teacher / Host view ───────────────────────────────────────
    return (
        <div className="edm-breakout">
            <div className="edm-breakout-header"><FaUsers /> Breakout Rooms</div>
            <div className="edm-breakout-body">

                {!active ? (
                    <>
                        {/* Quick auto-create buttons */}
                        <div className="edm-br-auto">
                            <span className="edm-br-auto-label">Quick groups:</span>
                            {[2,3,4,5,6].map(n => (
                                <button key={n} className="edm-br-auto-btn" onClick={() => autoCreateGroups(n)}>
                                    {n} groups
                                </button>
                            ))}
                        </div>

                        {/* Manual room creation */}
                        <div className="edm-breakout-create">
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                                placeholder="Room name (e.g. Group A)"
                                onKeyDown={e => e.key === 'Enter' && addRoom()} />
                            <button onClick={addRoom} title="Add room"><FaPlus /></button>
                        </div>

                        {/* Room list + assign */}
                        {rooms.length > 0 && (
                            <>
                                <div className="edm-breakout-rooms">
                                    {rooms.map(room => (
                                        <div key={room.id} className="edm-breakout-room">
                                            <div className="edm-breakout-room-head">
                                                <span>{room.name}</span>
                                                <span className="edm-breakout-count">{room.members.length} members</span>
                                                <button onClick={() => removeRoom(room.id)} className="edm-breakout-remove"><FaTimes /></button>
                                            </div>
                                            <div className="edm-breakout-members">
                                                {room.members.map(m => (
                                                    <span key={m} className="edm-breakout-member">{getStudentName(m)}</span>
                                                ))}
                                                {room.members.length === 0 && <span className="edm-breakout-empty-room">Empty</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Assign students */}
                                {students.length > 0 && (
                                    <div className="edm-breakout-assign">
                                        <div className="edm-breakout-assign-title">
                                            Assign Students
                                            <button className="edm-br-shuffle" onClick={autoGroup} title="Randomly shuffle">
                                                <FaRandom /> Shuffle
                                            </button>
                                        </div>
                                        {students.map(s => (
                                            <div key={s.user_id} className="edm-breakout-assign-row">
                                                <span>{s.name}</span>
                                                <select
                                                    value={rooms.find(r => r.members.includes(s.user_id))?.id || ''}
                                                    onChange={e => assignToRoom(s.user_id, e.target.value)}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Duration + Start */}
                                <div className="edm-br-duration">
                                    <FaClock />
                                    <select value={durationMin} onChange={e => setDuration(+e.target.value)}>
                                        {[5,10,15,20,30,45].map(m => <option key={m} value={m}>{m} min</option>)}
                                    </select>
                                </div>
                                <button className="btn btn-primary btn-sm edm-breakout-start" onClick={startBreakout}>
                                    <FaDoorOpen /> Start Breakout ({durationMin} min)
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Active session monitor */}
                        <div className="edm-breakout-active">
                            <FaDoorOpen style={{ color: '#22c55e' }} />
                            <span>Breakout active</span>
                            {timeLeft !== null && (
                                <span className={`edm-br-timer ${timeLeft < 60 ? 'edm-br-timer-warn' : ''}`}>
                                    <FaClock /> {fmtTime(timeLeft)}
                                </span>
                            )}
                        </div>

                        <div className="edm-breakout-rooms">
                            {rooms.map(room => (
                                <div key={room.id} className="edm-breakout-room">
                                    <div className="edm-breakout-room-head">
                                        <span>{room.name}</span>
                                        <span className="edm-breakout-count">{room.members.length}</span>
                                    </div>
                                    <div className="edm-breakout-members">
                                        {room.members.map(m => (
                                            <span key={m} className="edm-breakout-member">{getStudentName(m)}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-sm edm-breakout-close" onClick={closeBreakout}>
                            <FaDoorClosed /> End &amp; Return All to Main Room
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
