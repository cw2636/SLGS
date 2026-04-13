import { useEffect } from 'react';
import { FaTimes, FaDownload, FaFileAlt, FaFilePdf, FaFileWord } from 'react-icons/fa';

/**
 * DocumentViewer — modal for viewing and downloading student submission documents.
 *
 * Props:
 *   doc      { title, filename, textContent, studentName, submittedAt }
 *   onClose  () => void
 */
export default function DocumentViewer({ doc, onClose }) {
    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!doc) return null;

    // autoDownload: skip modal and trigger file download immediately
    if (doc.autoDownload) {
        const content = doc.textContent ||
            `Student: ${doc.studentName ?? ''}\nAssignment: ${doc.title ?? ''}\nSubmitted: ${doc.submittedAt ?? ''}\n\n[File: ${doc.filename}]\nNo text preview available.`;
        const filename = doc.textContent
            ? `${(doc.studentName ?? 'student').replace(/\s+/g, '_')}_${(doc.title ?? 'submission').replace(/\s+/g, '_')}.txt`
            : (doc.filename ?? 'submission.txt');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        // Close the "modal" immediately — it was never shown
        setTimeout(onClose, 0);
        return null;
    }

    const ext = doc.filename ? doc.filename.split('.').pop().toLowerCase() : 'txt';

    const FileIcon = ext === 'pdf'  ? FaFilePdf
                   : ext === 'docx' ? FaFileWord
                   : FaFileAlt;

    const iconColor = ext === 'pdf' ? '#ef4444' : ext === 'docx' ? '#3b82f6' : '#22c55e';

    // Build downloadable content
    const downloadContent = doc.textContent ||
        `Student: ${doc.studentName ?? 'Unknown'}\nAssignment: ${doc.title ?? ''}\nSubmitted: ${doc.submittedAt ?? ''}\n\n[File attachment: ${doc.filename}]\n\nNo text preview available for this file.`;

    const downloadFilename = doc.textContent
        ? `${(doc.studentName ?? 'student').replace(/\s+/g, '_')}_${(doc.title ?? 'submission').replace(/\s+/g, '_')}.txt`
        : doc.filename ?? 'submission.txt';

    const handleDownload = () => {
        const blob = new Blob([downloadContent], { type: 'text/plain;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(0,0,0,.72)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)',
                    width: '100%', maxWidth: '780px',
                    maxHeight: '88vh',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 24px 64px rgba(0,0,0,.5)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <FileIcon style={{ color: iconColor, fontSize: '1.25rem', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.filename ?? doc.title}
                        </div>
                        {(doc.studentName || doc.submittedAt) && (
                            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {doc.studentName}{doc.studentName && doc.submittedAt ? ' · ' : ''}{doc.submittedAt}
                            </div>
                        )}
                    </div>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={handleDownload}
                        title="Download"
                        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <FaDownload /> Download
                    </button>
                    <button
                        onClick={onClose}
                        title="Close"
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px', flexShrink: 0, lineHeight: 1 }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                    {doc.textContent ? (
                        <pre style={{
                            margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            fontFamily: 'inherit', fontSize: '.9rem', lineHeight: 1.75,
                            color: 'var(--text)',
                        }}>
                            {doc.textContent}
                        </pre>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <FileIcon style={{ fontSize: '3rem', color: iconColor, opacity: .6 }} />
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '.3rem', color: 'var(--text)' }}>{doc.filename}</p>
                                <p style={{ fontSize: '.85rem' }}>No inline preview available for this file type.</p>
                                <p style={{ fontSize: '.85rem' }}>Use the Download button to save and open it locally.</p>
                            </div>
                            <button className="btn btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaDownload /> Download {doc.filename}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
