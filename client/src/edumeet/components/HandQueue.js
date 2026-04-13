import { useMemo } from 'react';
import { FaHandPaper, FaArrowRight, FaUserCheck } from 'react-icons/fa';

/**
 * HandQueue — ordered hand-raise queue. Unlike Zoom's flag system, students
 * see their position ("You're #2 in queue") and teacher calls next in order.
 *
 * Events:
 *   hand_raise  { name }     — student joins queue
 *   hand_lower  {}           — student leaves queue
 *   hand_call   { userId }   — teacher calls on a student (removes from queue)
 */
export default function HandQueue({ events, send, isHost, sessionId, participants }) {
    // Build ordered queue from event log
    const queue = useMemo(() => {
        const q = [];
        const inQueue = new Set();
        events.forEach(e => {
            if (e.type === 'hand_raise' && !inQueue.has(e.from)) {
                q.push({ userId: e.from, name: e.payload?.name || e.from });
                inQueue.add(e.from);
            }
            if ((e.type === 'hand_lower') && inQueue.has(e.from)) {
                const idx = q.findIndex(x => x.userId === e.from);
                if (idx !== -1) q.splice(idx, 1);
                inQueue.delete(e.from);
            }
            if (e.type === 'hand_call' && e.payload?.userId) {
                const idx = q.findIndex(x => x.userId === e.payload.userId);
                if (idx !== -1) { q.splice(idx, 1); inQueue.delete(e.payload.userId); }
            }
        });
        return q;
    }, [events]);

    const myPosition = queue.findIndex(x => x.userId === sessionId);
    const myInQueue  = myPosition !== -1;

    const toggleHand = () => {
        if (myInQueue) {
            send('hand_lower', {});
        } else {
            const me = participants.find(p => p.user_id === sessionId);
            send('hand_raise', { name: me?.name || 'Student' });
        }
    };

    const callNext = () => {
        if (queue.length === 0) return;
        send('hand_call', { userId: queue[0].userId });
    };

    const callStudent = (userId) => {
        send('hand_call', { userId });
    };

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaHandPaper /> Hand Raise Queue
                <span className="edm-badge-sm">{queue.length}</span>
            </div>

            {/* Student controls */}
            {!isHost && (
                <div className="edm-hand-student">
                    <button
                        className={`edm-hand-toggle ${myInQueue ? 'edm-hand-in-queue' : ''}`}
                        onClick={toggleHand}
                    >
                        <FaHandPaper />
                        {myInQueue ? `Lower hand (you're #${myPosition + 1})` : 'Raise my hand'}
                    </button>
                    {myInQueue && (
                        <p className="edm-hand-position">
                            You are <strong>#{myPosition + 1}</strong> in the queue.
                            {myPosition === 0 && ' 🎉 You\'re next!'}
                        </p>
                    )}
                </div>
            )}

            {/* Teacher controls */}
            {isHost && queue.length > 0 && (
                <button className="btn btn-primary btn-sm edm-hand-call-btn" onClick={callNext}>
                    <FaArrowRight /> Call on {queue[0].name}
                </button>
            )}

            {/* Queue list */}
            {queue.length > 0 ? (
                <div className="edm-hand-queue">
                    {queue.map((entry, i) => (
                        <div key={entry.userId} className="edm-hand-entry">
                            <span className="edm-hand-pos">#{i + 1}</span>
                            <span className="edm-hand-name">{entry.name}</span>
                            {entry.userId === sessionId && (
                                <span className="edm-hand-you">You</span>
                            )}
                            {isHost && (
                                <button className="edm-hand-call" onClick={() => callStudent(entry.userId)} title="Call on this student">
                                    <FaUserCheck />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="edm-panel-empty">
                    {isHost ? 'No hands raised.' : 'Raise your hand to join the queue.'}
                </p>
            )}
        </div>
    );
}
