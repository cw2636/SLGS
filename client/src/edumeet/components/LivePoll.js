import { useState, useMemo } from 'react';
import { FaPoll, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

/**
 * LivePoll — real-time in-class polling.
 * Teacher creates a poll; students vote; results shown as live bar chart.
 * Unlike Zoom polls, results are visible to all in real time.
 *
 * Events used (via Go WebSocket):
 *   send:    poll_create  { question, options }
 *   send:    poll_vote    { pollId, optionIndex }
 *   send:    poll_close   { pollId }
 *   receive: poll_create, poll_vote, poll_close (same payloads)
 */
export default function LivePoll({ events, send, isHost, sessionId }) {
    const [creating, setCreating] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions]   = useState(['', '']);
    const [myVotes, setMyVotes]   = useState({}); // pollId → optionIndex

    // Derive active polls from event log
    const polls = useMemo(() => {
        const map = {};
        events.forEach(e => {
            if (e.type === 'poll_create') {
                map[e.payload.pollId] = {
                    ...e.payload,
                    votes: new Array(e.payload.options.length).fill(0),
                    closed: false,
                    voters: {},
                };
            }
            if (e.type === 'poll_vote' && map[e.payload.pollId]) {
                const poll = map[e.payload.pollId];
                const prev = poll.voters[e.from];
                if (prev !== undefined) poll.votes[prev]--;
                poll.votes[e.payload.optionIndex]++;
                poll.voters[e.from] = e.payload.optionIndex;
            }
            if (e.type === 'poll_close' && map[e.payload.pollId]) {
                map[e.payload.pollId].closed = true;
            }
        });
        return Object.values(map).reverse(); // newest first
    }, [events]);

    const activePoll = polls.find(p => !p.closed);

    const createPoll = () => {
        const opts = options.filter(o => o.trim());
        if (!question.trim() || opts.length < 2) return;
        send('poll_create', {
            pollId:   `poll-${Date.now()}`,
            question: question.trim(),
            options:  opts,
            hostId:   sessionId,
        });
        setQuestion('');
        setOptions(['', '']);
        setCreating(false);
    };

    const vote = (pollId, optIdx) => {
        if (myVotes[pollId] === optIdx) return; // no re-vote same option
        send('poll_vote', { pollId, optionIndex: optIdx });
        setMyVotes(v => ({ ...v, [pollId]: optIdx }));
    };

    const closePoll = (pollId) => send('poll_close', { pollId });

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaPoll /> Live Polls
                {isHost && (
                    <button className="edm-panel-action" onClick={() => setCreating(p => !p)}>
                        {creating ? <FaTimes /> : <FaPlus />} {creating ? 'Cancel' : 'New Poll'}
                    </button>
                )}
            </div>

            {/* Create form (host only) */}
            {creating && (
                <div className="edm-poll-create">
                    <input
                        className="edm-poll-q-input"
                        placeholder="Poll question…"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />
                    {options.map((o, i) => (
                        <div key={i} className="edm-poll-opt-row">
                            <input
                                placeholder={`Option ${i + 1}`}
                                value={o}
                                onChange={e => setOptions(opts => opts.map((x, j) => j === i ? e.target.value : x))}
                            />
                            {options.length > 2 && (
                                <button onClick={() => setOptions(opts => opts.filter((_, j) => j !== i))}><FaTimes /></button>
                            )}
                        </div>
                    ))}
                    {options.length < 6 && (
                        <button className="edm-poll-add-opt" onClick={() => setOptions(o => [...o, ''])}>
                            <FaPlus /> Add option
                        </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={createPoll}>Launch Poll</button>
                </div>
            )}

            {/* Active poll */}
            {activePoll && (
                <PollCard
                    poll={activePoll}
                    myVote={myVotes[activePoll.pollId]}
                    onVote={(i) => vote(activePoll.pollId, i)}
                    onClose={isHost ? () => closePoll(activePoll.pollId) : null}
                    showResults={isHost || myVotes[activePoll.pollId] !== undefined}
                />
            )}

            {/* Past polls */}
            {polls.filter(p => p.closed).map(poll => (
                <PollCard key={poll.pollId} poll={poll} myVote={myVotes[poll.pollId]} showResults closed />
            ))}

            {polls.length === 0 && !creating && (
                <p className="edm-panel-empty">{isHost ? 'Create a poll to get instant class feedback.' : 'No polls yet. Teacher will launch one.'}</p>
            )}
        </div>
    );
}

function PollCard({ poll, myVote, onVote, onClose, showResults, closed }) {
    const total = poll.votes.reduce((a, b) => a + b, 0) || 1;
    return (
        <div className={`edm-poll-card ${closed ? 'edm-poll-closed' : ''}`}>
            <div className="edm-poll-question">{poll.question}</div>
            {closed && <span className="edm-poll-closed-badge">Closed</span>}
            <div className="edm-poll-options">
                {poll.options.map((opt, i) => {
                    const pct = Math.round((poll.votes[i] / total) * 100);
                    const voted = myVote === i;
                    return (
                        <div key={i} className={`edm-poll-opt ${voted ? 'edm-poll-opted' : ''}`}
                            onClick={() => !closed && onVote?.(i)}>
                            <div className="edm-poll-opt-label">
                                {voted && <FaCheck style={{ marginRight: 4, color: 'var(--green-light)' }} />}
                                {opt}
                            </div>
                            {showResults && (
                                <>
                                    <div className="edm-poll-bar-wrap">
                                        <div className="edm-poll-bar" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="edm-poll-pct">{pct}% ({poll.votes[i]})</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            {onClose && !closed && (
                <button className="edm-poll-close-btn" onClick={onClose}>End Poll &amp; Show Results</button>
            )}
            {!closed && !showResults && <p className="edm-poll-waiting">Results visible after you vote.</p>}
        </div>
    );
}
