import { useState, useEffect, useMemo } from 'react';
import { FaBrain, FaCheck, FaTimes, FaClock, FaTrophy } from 'react-icons/fa';

/**
 * QuizMode — teacher launches a timed single-question quiz during class.
 * Students answer A/B/C/D in real time. After time expires, correct answer
 * is revealed and scores are shown. Unique: results can feed into gradebook.
 *
 * Events:
 *   quiz_start  { quizId, question, options[4], correctIndex, duration (sec), topic }
 *   quiz_answer { quizId, answerIndex }
 *   quiz_end    { quizId }   (auto or teacher-triggered)
 */
export default function QuizMode({ events, send, isHost, sessionId }) {
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct: 0, duration: 30, topic: '' });
    const [myAnswers, setMyAnswers] = useState({});
    const [timeLeft, setTimeLeft]   = useState(null);
    const [activeQuizId, setActiveQuizId] = useState(null);

    // Derive quiz state from events
    const quizzes = useMemo(() => {
        const map = {};
        events.forEach(e => {
            if (e.type === 'quiz_start') {
                map[e.payload.quizId] = {
                    ...e.payload, answers: {}, ended: false, startedAt: Date.now(),
                };
            }
            if (e.type === 'quiz_answer' && map[e.payload.quizId]) {
                map[e.payload.quizId].answers[e.from] = e.payload.answerIndex;
            }
            if (e.type === 'quiz_end' && map[e.payload.quizId]) {
                map[e.payload.quizId].ended = true;
            }
        });
        return map;
    }, [events]);

    const activeQuiz = activeQuizId ? quizzes[activeQuizId] : Object.values(quizzes).find(q => !q.ended);

    // Auto-select newest active quiz
    useEffect(() => {
        const newest = Object.values(quizzes).filter(q => !q.ended).at(-1);
        if (newest) setActiveQuizId(newest.quizId);
    }, [quizzes]);

    // Countdown timer
    useEffect(() => {
        if (!activeQuiz || activeQuiz.ended) { setTimeLeft(null); return; }
        const elapsed = Math.floor((Date.now() - activeQuiz.startedAt) / 1000);
        const remaining = activeQuiz.duration - elapsed;
        if (remaining <= 0) { send('quiz_end', { quizId: activeQuiz.quizId }); return; }
        setTimeLeft(remaining);
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(t);
                    if (isHost) send('quiz_end', { quizId: activeQuiz.quizId });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [activeQuiz?.quizId]); // eslint-disable-line

    const startQuiz = () => {
        const opts = form.options.filter(o => o.trim());
        if (!form.question.trim() || opts.length < 2) return;
        send('quiz_start', {
            quizId:       `quiz-${Date.now()}`,
            question:     form.question.trim(),
            options:      form.options.map(o => o.trim()),
            correctIndex: form.correct,
            duration:     form.duration,
            topic:        form.topic.trim(),
        });
        setCreating(false);
        setForm({ question: '', options: ['', '', '', ''], correct: 0, duration: 30, topic: '' });
    };

    const answer = (quizId, idx) => {
        if (myAnswers[quizId] !== undefined) return;
        send('quiz_answer', { quizId, answerIndex: idx });
        setMyAnswers(a => ({ ...a, [quizId]: idx }));
    };

    const labels = ['A', 'B', 'C', 'D'];
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaBrain /> Quiz Mode
                {isHost && (
                    <button className="edm-panel-action" onClick={() => setCreating(p => !p)}>
                        {creating ? <FaTimes /> : '＋ New Quiz'}
                    </button>
                )}
            </div>

            {/* Create form */}
            {creating && (
                <div className="edm-quiz-create">
                    <input placeholder="Topic (e.g. Quadratic Equations)" value={form.topic}
                        onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
                    <textarea placeholder="Question…" rows={2} value={form.question}
                        onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
                    {[0,1,2,3].map(i => (
                        <div key={i} className="edm-quiz-opt-row">
                            <span className="edm-quiz-label" style={{ background: colors[i] }}>{labels[i]}</span>
                            <input placeholder={`Option ${labels[i]}`} value={form.options[i]}
                                onChange={e => setForm(f => ({ ...f, options: f.options.map((o,j) => j===i ? e.target.value : o) }))} />
                            <input type="radio" name="correct" checked={form.correct === i}
                                onChange={() => setForm(f => ({ ...f, correct: i }))} title="Mark as correct" />
                        </div>
                    ))}
                    <div className="edm-quiz-duration-row">
                        <FaClock />
                        <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))}>
                            {[15,20,30,45,60,90,120].map(s => <option key={s} value={s}>{s}s</option>)}
                        </select>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={startQuiz}>Launch Quiz</button>
                </div>
            )}

            {/* Active quiz */}
            {activeQuiz && !activeQuiz.ended && (
                <div className="edm-quiz-card">
                    {activeQuiz.topic && <div className="edm-quiz-topic">{activeQuiz.topic}</div>}
                    <div className="edm-quiz-timer" style={{ color: timeLeft <= 10 ? '#ef4444' : 'var(--text)' }}>
                        <FaClock /> {timeLeft ?? activeQuiz.duration}s
                    </div>
                    <div className="edm-quiz-question">{activeQuiz.question}</div>
                    <div className="edm-quiz-answers">
                        {activeQuiz.options.filter(o => o).map((opt, i) => {
                            const myA = myAnswers[activeQuiz.quizId];
                            return (
                                <button
                                    key={i}
                                    className={`edm-quiz-btn ${myA === i ? 'edm-quiz-selected' : ''}`}
                                    style={{ borderColor: colors[i] }}
                                    onClick={() => answer(activeQuiz.quizId, i)}
                                    disabled={myA !== undefined}
                                >
                                    <span className="edm-quiz-label" style={{ background: colors[i] }}>{labels[i]}</span>
                                    {opt}
                                    {myA === i && <FaCheck style={{ marginLeft: 'auto', color: colors[i] }} />}
                                </button>
                            );
                        })}
                    </div>
                    {isHost && (
                        <button className="edm-poll-close-btn" onClick={() => send('quiz_end', { quizId: activeQuiz.quizId })}>
                            End Quiz Early
                        </button>
                    )}
                    <div className="edm-quiz-answered">
                        {Object.keys(activeQuiz.answers).length} / {Object.keys(quizzes).length || '?'} answered
                    </div>
                </div>
            )}

            {/* Results */}
            {activeQuiz?.ended && (
                <QuizResults quiz={activeQuiz} myAnswer={myAnswers[activeQuiz.quizId]} labels={labels} colors={colors} />
            )}

            {!activeQuiz && !creating && (
                <p className="edm-panel-empty">{isHost ? 'Launch a quiz to test comprehension in real time.' : 'No quiz active. Teacher will launch one.'}</p>
            )}
        </div>
    );
}

function QuizResults({ quiz, myAnswer, labels, colors }) {
    const total = Object.keys(quiz.answers).length || 1;
    const tally = quiz.options.map((_, i) => Object.values(quiz.answers).filter(a => a === i).length);
    const myCorrect = myAnswer === quiz.correctIndex;

    return (
        <div className="edm-quiz-results">
            <div className={`edm-quiz-verdict ${myCorrect ? 'correct' : 'wrong'}`}>
                {myAnswer !== undefined
                    ? (myCorrect ? <><FaCheck /> Correct!</> : <><FaTimes /> Incorrect</>)
                    : 'Time\'s up!'}
            </div>
            <div className="edm-quiz-question">{quiz.question}</div>
            {quiz.options.filter(o => o).map((opt, i) => {
                const pct = Math.round((tally[i] / total) * 100);
                const isCorrect = i === quiz.correctIndex;
                return (
                    <div key={i} className={`edm-quiz-result-row ${isCorrect ? 'edm-quiz-correct-row' : ''}`}>
                        <span className="edm-quiz-label" style={{ background: colors[i] }}>{labels[i]}</span>
                        <span>{opt}</span>
                        {isCorrect && <FaCheck style={{ color: '#10b981', marginLeft: 4 }} />}
                        <div className="edm-quiz-bar-wrap" style={{ flex: 1 }}>
                            <div className="edm-quiz-bar" style={{ width: `${pct}%`, background: isCorrect ? '#10b981' : colors[i] }} />
                        </div>
                        <span className="edm-poll-pct">{pct}%</span>
                    </div>
                );
            })}
            <div className="edm-quiz-score-summary">
                <FaTrophy /> {tally[quiz.correctIndex]} / {total} correct ({Math.round((tally[quiz.correctIndex]/total)*100)}%)
            </div>
        </div>
    );
}
