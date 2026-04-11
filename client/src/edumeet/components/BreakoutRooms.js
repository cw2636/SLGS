import React, { useState } from 'react';
import { FaPlus, FaTimes, FaUsers, FaDoorOpen, FaDoorClosed } from 'react-icons/fa';

/**
 * BreakoutRooms — Teacher creates sub-rooms, assigns students, manages breakout sessions.
 */
export default function BreakoutRooms({ send, events, participants, isHost, currentRoomId }) {
    const [rooms, setRooms] = useState([]);
    const [newName, setNewName] = useState('');
    const [active, setActive] = useState(false);

    // Parse breakout events from server
    const breakoutList = events.filter(e => e.type === 'breakout_list');
    const serverRooms = breakoutList.length > 0 ? breakoutList[breakoutList.length - 1].payload?.rooms || [] : rooms;

    const students = participants.filter(p => p.role === 'student');

    const addRoom = () => {
        if (!newName.trim()) return;
        const room = { id: `${currentRoomId}-br-${Date.now().toString(36)}`, name: newName.trim(), members: [] };
        const updated = [...rooms, room];
        setRooms(updated);
        setNewName('');
    };

    const removeRoom = (id) => {
        setRooms(rooms.filter(r => r.id !== id));
    };

    const assignToRoom = (studentId, roomId) => {
        setRooms(rooms.map(r => {
            // Remove from all rooms first
            const members = r.members.filter(m => m !== studentId);
            if (r.id === roomId) members.push(studentId);
            return { ...r, members };
        }));
    };

    const startBreakout = () => {
        send('breakout_create', { rooms: rooms.map(r => ({ id: r.id, name: r.name, members: r.members })) });
        setActive(true);
    };

    const closeBreakout = () => {
        send('breakout_close', {});
        setActive(false);
        setRooms([]);
    };

    const getStudentRoom = (studentId) => {
        const room = rooms.find(r => r.members.includes(studentId));
        return room ? room.name : 'Unassigned';
    };

    const getStudentName = (id) => {
        const p = participants.find(p => p.user_id === id);
        return p ? p.name : id;
    };

    // Student view — shows which breakout room they're in
    if (!isHost) {
        const myBreakout = serverRooms.find(r =>
            r.members?.includes(participants.find(p => p.role === 'student')?.user_id)
        );
        return (
            <div className="edm-breakout">
                <div className="edm-breakout-header"><FaUsers /> Breakout Rooms</div>
                <div className="edm-breakout-body">
                    {myBreakout ? (
                        <div className="edm-breakout-assigned">
                            <FaDoorOpen style={{ color: 'var(--gold)', fontSize: '1.5rem' }} />
                            <p>You're assigned to: <strong>{myBreakout.name}</strong></p>
                            <button className="btn btn-primary btn-sm" onClick={() => send('breakout_join', { roomId: myBreakout.id })}>
                                Join Breakout Room
                            </button>
                        </div>
                    ) : (
                        <p className="edm-breakout-waiting">
                            {serverRooms.length > 0 ? 'Waiting for assignment...' : 'No breakout rooms created yet.'}
                        </p>
                    )}
                    {serverRooms.length > 0 && (
                        <div className="edm-breakout-list">
                            {serverRooms.map(r => (
                                <div key={r.id} className="edm-breakout-item">
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

    // Teacher/host view
    return (
        <div className="edm-breakout">
            <div className="edm-breakout-header"><FaUsers /> Breakout Rooms</div>
            <div className="edm-breakout-body">
                {!active ? (
                    <>
                        {/* Create rooms */}
                        <div className="edm-breakout-create">
                            <input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Room name (e.g. Group A)"
                                onKeyDown={e => e.key === 'Enter' && addRoom()}
                            />
                            <button onClick={addRoom} title="Add room"><FaPlus /></button>
                        </div>

                        {/* Room list + assign */}
                        {rooms.length > 0 && (
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
                                            {room.members.length === 0 && <span className="edm-breakout-empty-room">No members</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Unassigned students */}
                        {students.length > 0 && rooms.length > 0 && (
                            <div className="edm-breakout-assign">
                                <div className="edm-breakout-assign-title">Assign Students</div>
                                {students.map(s => (
                                    <div key={s.user_id} className="edm-breakout-assign-row">
                                        <span>{s.name}</span>
                                        <select
                                            value={rooms.find(r => r.members.includes(s.user_id))?.id || ''}
                                            onChange={e => assignToRoom(s.user_id, e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {rooms.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {rooms.length > 0 && (
                            <button className="btn btn-primary btn-sm edm-breakout-start" onClick={startBreakout}>
                                <FaDoorOpen /> Start Breakout Session
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <div className="edm-breakout-active">
                            <FaDoorOpen style={{ color: '#22c55e', fontSize: '1.2rem' }} />
                            <span>Breakout session is active</span>
                        </div>
                        <div className="edm-breakout-rooms">
                            {rooms.map(room => (
                                <div key={room.id} className="edm-breakout-room">
                                    <div className="edm-breakout-room-head">
                                        <span>{room.name}</span>
                                        <span className="edm-breakout-count">{room.members.length} members</span>
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
                            <FaDoorClosed /> End Breakout Session
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
