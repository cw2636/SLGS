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

    const connect = useCallback(() => {
        if (!roomId || !user) return;

        const token = user.token || '';
        const params = new URLSearchParams({
            room: roomId,
            ...(token ? { token } : { user_id: user.id || user.studentId || 'guest', name: user.name, role: user.role }),
        });

        const ws = new WebSocket(`${GO_WS_URL}/ws/join?${params}`);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            clearTimeout(reconnectTimer.current);
        };

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'participant_list') {
                    setParticipants(data.payload || []);
                } else {
                    setEvents(prev => [...prev.slice(-200), data]); // keep last 200
                }
            } catch { /* ignore malformed */ }
        };

        ws.onclose = () => {
            setConnected(false);
            // Auto-reconnect after 3s
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => ws.close();
    }, [roomId, user]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    const send = useCallback((type, payload = {}, target = null) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const msg = { type, room_id: roomId, payload };
            if (target) msg.target = target;
            wsRef.current.send(JSON.stringify(msg));
        }
    }, [roomId]);

    return { events, participants, send, connected };
}
