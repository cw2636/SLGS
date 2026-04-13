import { useState, useMemo, useRef } from 'react';
import { FaStickyNote, FaThumbtack, FaDownload, FaTrash } from 'react-icons/fa';

/**
 * ClassNotes — shared collaborative notepad visible to all participants.
 * Teacher can pin key points. Notes are exportable as a text file.
 * Unique educational feature not available in Zoom or Teams.
 *
 * Events:
 *   note_add    { noteId, text, pinned }
 *   note_pin    { noteId }
 *   note_delete { noteId }
 */
export default function ClassNotes({ events, send, isHost, sessionId }) {
    const [input, setInput] = useState('');

    const notes = useMemo(() => {
        const map = {};
        events.forEach(e => {
            if (e.type === 'note_add') {
                map[e.payload.noteId] = {
                    ...e.payload,
                    author: e.payload.authorName || e.from,
                    fromHost: e.payload.fromHost,
                    pinned: !!e.payload.pinned,
                };
            }
            if (e.type === 'note_pin' && map[e.payload.noteId]) {
                map[e.payload.noteId].pinned = !map[e.payload.noteId].pinned;
            }
            if (e.type === 'note_delete') {
                delete map[e.payload.noteId];
            }
        });
        // Sort: pinned first, then by insertion order
        return Object.values(map).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    }, [events]);

    const addNote = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        send('note_add', {
            noteId:     `note-${Date.now()}`,
            text:       input.trim(),
            authorName: sessionId,
            fromHost:   isHost,
            pinned:     false,
        });
        setInput('');
    };

    const exportNotes = () => {
        const content = notes.map(n => `${n.pinned ? '📌 ' : ''}${n.text}\n— ${n.author}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'class-notes.txt';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    return (
        <div className="edm-panel">
            <div className="edm-panel-header">
                <FaStickyNote /> Class Notes
                {notes.length > 0 && (
                    <button className="edm-panel-action" onClick={exportNotes} title="Export notes">
                        <FaDownload />
                    </button>
                )}
            </div>

            {/* Note input */}
            <form className="edm-notes-input-row" onSubmit={addNote}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isHost ? 'Add a key point for the class…' : 'Add a note…'}
                />
                <button type="submit" disabled={!input.trim()}>Add</button>
            </form>

            {/* Notes list */}
            <div className="edm-notes-list">
                {notes.length === 0 && (
                    <p className="edm-panel-empty">No notes yet. Add key points during the lesson.</p>
                )}
                {notes.map(note => (
                    <div key={note.noteId} className={`edm-note-item ${note.pinned ? 'edm-note-pinned' : ''} ${note.fromHost ? 'edm-note-host' : ''}`}>
                        {note.pinned && <FaThumbtack className="edm-note-pin-icon" />}
                        <p className="edm-note-text">{note.text}</p>
                        <div className="edm-note-footer">
                            <span className="edm-note-author">{note.fromHost ? '👨‍🏫 Teacher' : note.author}</span>
                            <div className="edm-note-actions">
                                {isHost && (
                                    <button onClick={() => send('note_pin', { noteId: note.noteId })} title={note.pinned ? 'Unpin' : 'Pin'}>
                                        <FaThumbtack className={note.pinned ? 'pinned' : ''} />
                                    </button>
                                )}
                                {(isHost || note.author === sessionId) && (
                                    <button onClick={() => send('note_delete', { noteId: note.noteId })} title="Delete">
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
