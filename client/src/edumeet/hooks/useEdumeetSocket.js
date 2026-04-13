import { useState, useEffect, useRef, useCallback } from 'react';

const GO_WS_URL = process.env.REACT_APP_GO_WS_URL || 'ws://localhost:4000';

/**
 * Custom hook to manage the Go WebSocket connection for EduMeet.
 * Handles connect, disconnect, message parsing, and reconnection.
 *
 * @param {string} roomId  - The classroom room ID
 * @param {object} user    - { id, name, role } from AuthContext
 * @returns {{ events, participants, send, connected }}
 */
export default function useEdumeetSocket(roomId, user) {
    const [events, setEvents] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const intentionalClose = useRef(false);
    const seqRef = useRef(0); // monotonic counter — survives array trimming
    // Unique session ID so the same user in two tabs can still signal each other
    const sessionId = useRef(`${user?.id || user?.studentId || 'guest'}-${Date.now().toString(36)}`);

    // Extract stable primitives — using the object itself as a dep causes reconnect
    // every render because AuthContext creates a new object reference each time.
    const userId   = user?.id || user?.studentId;
    const userName = user?.name;
    const userRole = user?.role;
    const userToken = user?.token;

    const connect = useCallback(() => {
        if (!roomId || !userId) return;

        const uid = sessionId.current;
        const params = new URLSearchParams({
            room: roomId,
            ...(userToken ? { token: userToken } : { user_id: uid, name: userName, role: userRole }),
        });

        const ws = new WebSocket(`${GO_WS_URL}/ws/join?${params}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            clearTimeout(reconnectTimer.current);
        };

        ws.onmessage = (e) => {
            // Handle possible newline-delimited JSON (multiple messages in one frame)
            const lines = e.data.split('\n').filter(Boolean);
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.type === 'participant_list') {
                        setParticipants(data.payload || []);
                    } else {
                        data.__seq = seqRef.current++; // monotonic ID survives array trimming
                        setEvents(prev => [...prev.slice(-200), data]);
                    }
                } catch { /* ignore malformed */ }
            }
        };

        ws.onclose = () => {
            setConnected(false);
            // Only auto-reconnect if this wasn't an intentional close (leaving the room)
            if (!intentionalClose.current) {
                reconnectTimer.current = setTimeout(connect, 3000);
            }
        };

        ws.onerror = () => ws.close();
    }, [roomId, userId, userName, userRole, userToken]); // stable primitives, not the user object

    useEffect(() => {
        intentionalClose.current = false;
        connect();
        return () => {
            intentionalClose.current = true;
            clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // suppress the reconnect triggered by cleanup
                wsRef.current.close();
            }
        };
    }, [connect]);

    const send = useCallback((type, payload = {}, target = null) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const msg = { type, room_id: roomId, payload };
            if (target) msg.target = target;
            wsRef.current.send(JSON.stringify(msg));
        }
    }, [roomId]);

    return { events, participants, send, connected, sessionId: sessionId.current };
}
