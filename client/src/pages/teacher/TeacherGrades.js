import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import PortalSidebar from '../../components/shared/PortalSidebar';
import DocumentViewer from '../../components/shared/DocumentViewer';
import {
    FaTasks, FaClipboardList, FaChevronDown, FaChevronUp,
    FaUser, FaFileAlt, FaSave, FaExclamationCircle, FaCheckCircle,
    FaTable, FaPen, FaEye, FaDownload,
} from 'react-icons/fa';
import {
    COURSES, MODULES, SUBMISSIONS, CLASS_ROSTER, scoreToGrade, gradeColor,
} from '../../data/mockData';

const gradeBg = g => {
    if (g === 'A*') return 'rgba(34,197,94,.15)';
    if (g === 'A')  return 'rgba(132,204,22,.15)';
    if (g === 'B')  return 'rgba(234,179,8,.15)';
    if (g === 'C')  return 'rgba(249,115,22,.12)';
    return 'rgba(239,68,68,.1)';
};

const statusBadge = (status) => {
    if (status === 'graded')    return { label: 'Graded',       bg: 'rgba(34,197,94,.15)',  color: '#86efac' };
    if (status === 'submitted') return { label: 'Submitted',    bg: 'rgba(99,102,241,.15)', color: '#a5b4fc' };
    return                             { label: 'Not submitted', bg: 'rgba(107,114,128,.1)', color: 'var(--text-muted)' };
};

export default function TeacherGrades() {
    const { user } = useAuth();

    const myCourses = useMemo(
        () => COURSES.filter(c => c.teacherId === user?.staffId),
        [user]
    );

    const [courseId,     setCourseId]     = useState(myCourses[0]?.id ?? null);
    const [view,         setView]         = useState('gradebook');   // 'gradebook' | 'submissions'
    const [selectedItem, setSelectedItem] = useState(null);
    const [expanded,     setExpanded]     = useState(null);
    const [submissions,  setSubmissions]  = useState(SUBMISSIONS);
    const [gradeInputs,  setGradeInputs]  = useState({});
    const [saved,        setSaved]        = useState({});
    // Inline cell editing (gradebook view)
    const [editCell, setEditCell] = useState(null); // { key: 'studentId_itemId' }
    const [editVal,  setEditVal]  = useState('');
    // Document viewer
    const [viewDoc,  setViewDoc]  = useState(null); // doc object passed to DocumentViewer

    const course = myCourses.find(c => c.id === courseId);

    const courseItems = useMemo(() => {
        if (!courseId) return [];
        return MODULES
            .filter(m => m.courseId === courseId)
            .flatMap(m => m.items.filter(it => it.type === 'assignment' || it.type === 'exam'));
    }, [courseId]);

    const classKey = course ? `${course.form}${course.section}` : null;
    const roster   = useMemo(() => (classKey ? (CLASS_ROSTER[classKey] ?? []) : []), [classKey]);

    // All submissions for this course, keyed by `studentId_itemId`
    const subMatrix = useMemo(() => {
        const m = {};
        submissions
            .filter(s => s.courseId === courseId)
            .forEach(s => { m[`${s.studentId}_${s.itemId}`] = s; });
        return m;
    }, [submissions, courseId]);

    // Per-student totals across all items
    const studentTotals = useMemo(() => {
        const totals = {};
        roster.forEach(student => {
            const sid = student.studentId ?? student.id;
            let earned = 0, possible = 0;
            courseItems.forEach(item => {
                possible += item.points;
                const sub = subMatrix[`${sid}_${item.id}`];
                if (sub && sub.grade !== null && sub.grade !== undefined) {
                    earned += sub.grade;
                }
                // Missing / ungraded counts as 0 toward possible
            });
            const pct   = possible > 0 ? Math.round((earned / possible) * 100) : 0;
            totals[student.id] = { earned, possible, pct, grade: scoreToGrade(pct) };
        });
        return totals;
    }, [roster, courseItems, subMatrix]);

    // Per-item class averages (only graded scores)
    const itemAverages = useMemo(() => {
        const avgs = {};
        courseItems.forEach(item => {
            const scores = roster
                .map(s => subMatrix[`${s.studentId ?? s.id}_${item.id}`]?.grade)
                .filter(g => g !== null && g !== undefined);
            avgs[item.id] = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : null;
        });
        return avgs;
    }, [roster, courseItems, subMatrix]);

    // Inline grade save (gradebook cells)
    const saveCellGrade = (studentId, item, value) => {
        const raw   = parseInt(value);
        const score = isNaN(raw) ? null : Math.min(item.points, Math.max(0, raw));
        const key   = `${studentId}_${item.id}`;
        const existing = subMatrix[key];
        if (existing) {
            setSubmissions(prev => prev.map(s =>
                s.id !== existing.id ? s : {
                    ...s, grade: score,
                    status: score !== null ? 'graded' : s.status,
                }
            ));
        } else if (score !== null) {
            // Teacher entering a grade with no prior submission — create one
            setSubmissions(prev => [...prev, {
                id: `m_${studentId}_${item.id}`,
                itemId: item.id, courseId,
                studentId,
                studentName: roster.find(r => (r.studentId ?? r.id) === studentId)?.name ?? '',
                submittedAt: '', status: 'graded',
                grade: score, feedback: '', filePath: '', textContent: '',
            }]);
        }
        setEditCell(null);
    };

    // Submission-view helpers
    const itemSubs = useMemo(() => {
        if (!selectedItem) return {};
        const map = {};
        submissions
            .filter(s => s.itemId === selectedItem.id && s.courseId === courseId)
            .forEach(s => { map[s.studentId] = s; });
        return map;
    }, [selectedItem, submissions, courseId]);

    const submittedCount = Object.keys(itemSubs).length;
    const gradedCount    = Object.values(itemSubs).filter(s => s.status === 'graded').length;

    const saveGrade = (student) => {
        const sub = itemSubs[student.studentId ?? student.id];
        if (!sub) return;
        const raw   = parseInt(gradeInputs[sub.id]?.score ?? '');
        const score = isNaN(raw) ? null : Math.min(selectedItem.points, Math.max(0, raw));
        const feedback = gradeInputs[sub.id]?.feedback ?? '';
        setSubmissions(prev =>
            prev.map(s => s.id !== sub.id ? s : {
                ...s, grade: score, feedback,
                status: score !== null ? 'graded' : s.status,
            })
        );
        setSaved(p => ({ ...p, [sub.id]: true }));
        setTimeout(() => setSaved(p => { const n = { ...p }; delete n[sub.id]; return n; }), 2500);
    };

    const switchCourse = (id) => {
        setCourseId(id); setSelectedItem(null); setExpanded(null); setEditCell(null);
    };

    return (
        <>
        <div className="portal-layout">
            <PortalSidebar />
            <div className="portal-main">
                <div className="portal-topbar">
                    <span className="pt-title">Grade Centre</span>
                    <div className="pt-right" style={{ display: 'flex', gap: '.4rem' }}>
                        <button
                            className={`btn btn-sm ${view === 'gradebook' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setView('gradebook')}
                        ><FaTable /> Gradebook</button>
                        <button
                            className={`btn btn-sm ${view === 'submissions' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setView('submissions')}
                        ><FaPen /> Grade Submissions</button>
                    </div>
                </div>

                <div className="portal-content" style={{ padding: '1.5rem' }}>
                    {/* ── Course tabs ── */}
                    <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {myCourses.map(c => (
                            <button key={c.id}
                                onClick={() => switchCourse(c.id)}
                                className={`btn btn-sm ${courseId === c.id ? 'btn-primary' : 'btn-outline'}`}
                            >
                                {c.code} — {c.title}
                                <span style={{ opacity: .6, marginLeft: '6px' }}>({c.form}{c.section})</span>
                            </button>
                        ))}
                        {myCourses.length === 0 && (
                            <p style={{ color: 'var(--text-muted)' }}>No courses assigned.</p>
                        )}
                    </div>

                    {/* ══════════════ GRADEBOOK VIEW ══════════════ */}
                    {view === 'gradebook' && course && (
                        <div>
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Playfair Display',serif" }}>
                                    {course.title} — {classKey}
                                </h2>
                                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                    {roster.length} students · {courseItems.length} graded items · Click any cell to enter/edit a grade
                                </span>
                            </div>

                            <div style={{ overflowX: 'auto', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${200 + courseItems.length * 120 + 260}px` }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-card)' }}>
                                            {/* Student column */}
                                            <th style={{ padding: '.7rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: 'var(--bg-card)', minWidth: '180px', zIndex: 2 }}>
                                                Student
                                            </th>
                                            {/* One column per assignment/exam */}
                                            {courseItems.map(item => (
                                                <th key={item.id} style={{ padding: '.7rem .85rem', textAlign: 'center', fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', minWidth: '110px', verticalAlign: 'bottom' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                                                        {item.type === 'exam'
                                                            ? <FaClipboardList style={{ color: 'var(--gold)', fontSize: '.75rem' }} />
                                                            : <FaTasks style={{ color: '#8b5cf6', fontSize: '.75rem' }} />}
                                                        <span style={{ textTransform: 'none' }}>{item.title}</span>
                                                    </div>
                                                    <div style={{ color: 'var(--text-dim)', fontSize: '.7rem' }}>/ {item.points} pts</div>
                                                </th>
                                            ))}
                                            {/* Summary columns */}
                                            <th style={{ padding: '.7rem .85rem', textAlign: 'center', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)', borderLeft: '2px solid var(--border)', minWidth: '90px' }}>Total</th>
                                            <th style={{ padding: '.7rem .85rem', textAlign: 'center', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)', minWidth: '80px' }}>%</th>
                                            <th style={{ padding: '.7rem .85rem', textAlign: 'center', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', borderBottom: '1px solid var(--border)', minWidth: '70px' }}>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roster.map((student, idx) => {
                                            const sid    = student.studentId ?? student.id;
                                            const totals = studentTotals[student.id] ?? { earned: 0, possible: 0, pct: 0, grade: 'F' };
                                            return (
                                                <tr key={student.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.018)' }}>
                                                    {/* Student name */}
                                                    <td style={{ padding: '.65rem 1rem', fontWeight: 600, fontSize: '.88rem', borderBottom: '1px solid var(--border)', position: 'sticky', left: 0, background: idx % 2 === 0 ? 'var(--bg)' : 'var(--bg-card)', zIndex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <FaUser style={{ color: 'var(--gold)', fontSize: '.7rem' }} />
                                                            </div>
                                                            {student.name}
                                                        </div>
                                                    </td>

                                                    {/* Score cells */}
                                                    {courseItems.map(item => {
                                                        const cellKey = `${sid}_${item.id}`;
                                                        const sub     = subMatrix[cellKey];
                                                        const grade   = sub?.grade;
                                                        const isEditing = editCell === cellKey;

                                                        return (
                                                            <td key={item.id} style={{ padding: '0', textAlign: 'center', borderBottom: '1px solid var(--border)', cursor: 'pointer', position: 'relative' }}
                                                                onClick={() => { if (!isEditing) { setEditCell(cellKey); setEditVal(grade !== null && grade !== undefined ? String(grade) : ''); } }}
                                                            >
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number" min={0} max={item.points}
                                                                        autoFocus
                                                                        value={editVal}
                                                                        onChange={e => setEditVal(e.target.value)}
                                                                        onBlur={() => saveCellGrade(sid, item, editVal)}
                                                                        onKeyDown={e => {
                                                                            if (e.key === 'Enter') saveCellGrade(sid, item, editVal);
                                                                            if (e.key === 'Escape') setEditCell(null);
                                                                        }}
                                                                        onClick={e => e.stopPropagation()}
                                                                        style={{ width: '100%', height: '100%', padding: '.5rem', border: '2px solid var(--gold)', borderRadius: 0, background: 'var(--bg-card)', color: 'var(--text)', textAlign: 'center', fontSize: '.88rem', outline: 'none' }}
                                                                    />
                                                                ) : (
                                                                    <div style={{ padding: '.6rem .5rem', minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        {grade !== null && grade !== undefined ? (
                                                                            <span style={{ fontWeight: 600, fontSize: '.88rem', color: gradeColor(scoreToGrade(Math.round(grade / item.points * 100))) }}>
                                                                                {grade}
                                                                            </span>
                                                                        ) : sub?.status === 'submitted' ? (
                                                                            <span style={{ fontSize: '.75rem', color: '#a5b4fc' }}>sub</span>
                                                                        ) : (
                                                                            <span style={{ color: 'var(--text-dim)', fontSize: '.82rem' }}>—</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}

                                                    {/* Totals */}
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', fontWeight: 600, fontSize: '.85rem', borderBottom: '1px solid var(--border)', borderLeft: '2px solid var(--border)' }}>
                                                        {totals.earned} / {totals.possible}
                                                    </td>
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', fontWeight: 600, fontSize: '.85rem', borderBottom: '1px solid var(--border)', color: gradeColor(scoreToGrade(totals.pct)) }}>
                                                        {totals.pct}%
                                                    </td>
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                                                        <span className="grade-badge" style={{ background: gradeBg(totals.grade), color: gradeColor(totals.grade) }}>
                                                            {totals.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* Class average row */}
                                        {roster.length > 0 && (() => {
                                            const classEarned   = Object.values(studentTotals).reduce((s, t) => s + t.earned, 0);
                                            const classPossible = Object.values(studentTotals).reduce((s, t) => s + t.possible, 0);
                                            const classPct      = classPossible > 0 ? Math.round(classEarned / classPossible * 100) : 0;
                                            return (
                                                <tr style={{ background: 'var(--gold-dim)', fontStyle: 'italic' }}>
                                                    <td style={{ padding: '.65rem 1rem', fontSize: '.83rem', fontWeight: 700, color: 'var(--gold)', borderTop: '2px solid var(--border)', position: 'sticky', left: 0, background: 'var(--gold-dim)', zIndex: 1 }}>
                                                        Class Average
                                                    </td>
                                                    {courseItems.map(item => {
                                                        const avg = itemAverages[item.id];
                                                        return (
                                                            <td key={item.id} style={{ padding: '.65rem .5rem', textAlign: 'center', fontSize: '.83rem', fontWeight: 600, borderTop: '2px solid var(--border)', color: avg !== null ? gradeColor(scoreToGrade(Math.round(avg / item.points * 100))) : 'var(--text-dim)' }}>
                                                                {avg !== null ? avg : '—'}
                                                            </td>
                                                        );
                                                    })}
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', borderTop: '2px solid var(--border)', borderLeft: '2px solid var(--border)' }}>
                                                        {Math.round(classEarned / roster.length)} / {Math.round(classPossible / roster.length)}
                                                    </td>
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', fontWeight: 700, fontSize: '.85rem', borderTop: '2px solid var(--border)', color: gradeColor(scoreToGrade(classPct)) }}>
                                                        {classPct}%
                                                    </td>
                                                    <td style={{ padding: '.65rem .85rem', textAlign: 'center', borderTop: '2px solid var(--border)' }}>
                                                        <span className="grade-badge" style={{ background: gradeBg(scoreToGrade(classPct)), color: gradeColor(scoreToGrade(classPct)) }}>
                                                            {scoreToGrade(classPct)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>

                            {/* Legend */}
                            <div style={{ marginTop: '.75rem', fontSize: '.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <span><strong style={{ color: '#a5b4fc' }}>sub</strong> = submitted, awaiting grade</span>
                                <span><strong style={{ color: 'var(--text-dim)' }}>—</strong> = not submitted (counts as 0)</span>
                                <span>Click any score cell to edit</span>
                            </div>
                        </div>
                    )}

                    {/* ══════════════ SUBMISSIONS VIEW ══════════════ */}
                    {view === 'submissions' && course && (
                        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.25rem', alignItems: 'start' }}>
                            {/* Left: assignment list */}
                            <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="d-card-title" style={{ padding: '.85rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
                                    Assignments &amp; Exams
                                </div>
                                {courseItems.length === 0 && (
                                    <p style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '.85rem' }}>None published yet.</p>
                                )}
                                {courseItems.map(item => {
                                    const subs   = submissions.filter(s => s.itemId === item.id && s.courseId === courseId);
                                    const graded = subs.filter(s => s.status === 'graded').length;
                                    const active = selectedItem?.id === item.id;
                                    return (
                                        <div key={item.id}
                                            onClick={() => { setSelectedItem(item); setExpanded(null); }}
                                            style={{ padding: '.85rem 1rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: active ? 'var(--gold-dim)' : 'transparent', borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent', transition: 'var(--t)' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                                                {item.type === 'exam' ? <FaClipboardList style={{ color: 'var(--gold)' }} /> : <FaTasks style={{ color: '#8b5cf6' }} />}
                                                <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{item.title}</span>
                                            </div>
                                            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                                                <span>{item.points} pts</span>
                                                <span style={{ color: graded > 0 ? '#86efac' : 'var(--text-muted)' }}>{graded}/{subs.length} graded</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right: student submissions */}
                            <div>
                                {!selectedItem ? (
                                    <div className="d-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                                        <FaTasks style={{ fontSize: '2rem', opacity: .3, marginBottom: '.75rem' }} />
                                        <p>Select an assignment or exam to view submissions.</p>
                                    </div>
                                ) : (
                                    <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
                                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{selectedItem.title}</h3>
                                                <p style={{ margin: '.2rem 0 0', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                                                    {selectedItem.points} pts &nbsp;·&nbsp; {submittedCount} submitted &nbsp;·&nbsp; {gradedCount} graded &nbsp;·&nbsp; {roster.length - submittedCount} missing
                                                </p>
                                            </div>
                                            <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '.75rem', background: 'rgba(99,102,241,.15)', color: '#a5b4fc' }}>{classKey}</span>
                                        </div>

                                        {roster.map(student => {
                                            const sub    = itemSubs[student.studentId] ?? itemSubs[student.id] ?? null;
                                            const { label, bg, color } = statusBadge(sub?.status);
                                            const isOpen = expanded === student.id;
                                            const gi     = gradeInputs[sub?.id] ?? {};
                                            return (
                                                <div key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <div onClick={() => setExpanded(isOpen ? null : student.id)}
                                                        style={{ padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer', transition: 'var(--t)' }}
                                                        className="d-row-hover"
                                                    >
                                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <FaUser style={{ color: 'var(--gold)', fontSize: '.85rem' }} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{student.name}</div>
                                                            {sub?.submittedAt && <div style={{ fontSize: '.76rem', color: 'var(--text-muted)' }}>Submitted {sub.submittedAt}</div>}
                                                        </div>
                                                        <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '.75rem', background: bg, color }}>{label}</span>
                                                        {sub?.grade !== null && sub?.grade !== undefined && (
                                                            <span className="grade-badge" style={{ background: gradeBg(scoreToGrade(sub.grade)), color: gradeColor(scoreToGrade(sub.grade)) }}>
                                                                {sub.grade}/{selectedItem.points} · {scoreToGrade(sub.grade)}
                                                            </span>
                                                        )}
                                                        {isOpen ? <FaChevronUp style={{ opacity: .4 }} /> : <FaChevronDown style={{ opacity: .4 }} />}
                                                    </div>

                                                    {isOpen && (
                                                        <div style={{ padding: '1rem 1.25rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                                                            {!sub ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'var(--text-muted)', fontSize: '.88rem' }}>
                                                                    <FaExclamationCircle /><span>No submission from this student.</span>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Student submission</div>
                                                                        {sub.filePath && (
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem .9rem', background: 'var(--bg-card)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', marginBottom: '.75rem', fontSize: '.85rem' }}>
                                                                                <FaFileAlt style={{ color: 'var(--gold)', flexShrink: 0 }} />
                                                                                <span style={{ fontWeight: 500, flex: 1 }}>{sub.filePath}</span>
                                                                                <button className="btn btn-sm btn-outline" style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px' }}
                                                                                    onClick={() => setViewDoc({ title: selectedItem.title, filename: sub.filePath, textContent: sub.textContent, studentName: sub.studentName, submittedAt: sub.submittedAt })}>
                                                                                    <FaEye /> View
                                                                                </button>
                                                                                <button className="btn btn-sm btn-outline" style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px' }}
                                                                                    onClick={() => setViewDoc({ title: selectedItem.title, filename: sub.filePath, textContent: sub.textContent, studentName: sub.studentName, submittedAt: sub.submittedAt, autoDownload: true })}>
                                                                                    <FaDownload /> Download
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {sub.textContent && (
                                                                            <div>
                                                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.4rem', marginBottom: '.4rem' }}>
                                                                                    <button className="btn btn-sm btn-outline" style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px' }}
                                                                                        onClick={() => setViewDoc({ title: selectedItem.title, filename: null, textContent: sub.textContent, studentName: sub.studentName, submittedAt: sub.submittedAt })}>
                                                                                        <FaEye /> View
                                                                                    </button>
                                                                                    <button className="btn btn-sm btn-outline" style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 10px' }}
                                                                                        onClick={() => setViewDoc({ title: selectedItem.title, filename: null, textContent: sub.textContent, studentName: sub.studentName, submittedAt: sub.submittedAt, autoDownload: true })}>
                                                                                        <FaDownload /> Download
                                                                                    </button>
                                                                                </div>
                                                                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '.9rem 1rem', fontSize: '.87rem', lineHeight: 1.65, maxHeight: '220px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                                                                                    {sub.textContent}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {!sub.filePath && !sub.textContent && <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>No content attached.</p>}
                                                                    </div>
                                                                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.25rem' }}>
                                                                        <div style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text-muted)', marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Grade</div>
                                                                        <div className="fg">
                                                                            <label>Score (0 – {selectedItem.points})</label>
                                                                            <input type="number" min={0} max={selectedItem.points} placeholder={`/ ${selectedItem.points}`}
                                                                                value={gi.score ?? ''}
                                                                                onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...p[sub.id], score: e.target.value } }))}
                                                                            />
                                                                            {gi.score !== '' && gi.score !== undefined && (
                                                                                <div style={{ fontSize: '.8rem', marginTop: '4px' }}>
                                                                                    Letter:&nbsp;<strong style={{ color: gradeColor(scoreToGrade(parseInt(gi.score) || 0)) }}>{scoreToGrade(parseInt(gi.score) || 0)}</strong>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="fg">
                                                                            <label>Feedback to student</label>
                                                                            <textarea rows={4} placeholder="Enter comments..."
                                                                                value={gi.feedback ?? ''}
                                                                                onChange={e => setGradeInputs(p => ({ ...p, [sub.id]: { ...p[sub.id], feedback: e.target.value } }))}
                                                                                style={{ fontSize: '.87rem' }}
                                                                            />
                                                                        </div>
                                                                        <button className="btn btn-primary btn-sm" onClick={() => saveGrade(student)} style={{ width: '100%', justifyContent: 'center' }}>
                                                                            {saved[sub.id] ? <><FaCheckCircle /> Saved!</> : <><FaSave /> Save Grade</>}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Document viewer modal */}
        {viewDoc && (
            <DocumentViewer
                doc={viewDoc}
                onClose={() => setViewDoc(null)}
            />
        )}
        </>
    );
}
