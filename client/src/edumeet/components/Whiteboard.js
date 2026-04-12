import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaEraser, FaTrash } from 'react-icons/fa';

const COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#c9a227'];

/**
 * Collaborative whiteboard — draws locally and broadcasts strokes via WebSocket.
 */
export default function Whiteboard({ events, send, disabled, sessionId }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(2);
    const lastPos = useRef(null);

    // Resize canvas to fill container
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    const lastWbIdx = useRef(0);

    // Replay remote whiteboard strokes — process ALL new events since last render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !events.length) return;
        const ctx = canvas.getContext('2d');

        const start = lastWbIdx.current;
        const idx = start > events.length ? 0 : start;
        const newEvents = events.slice(idx);
        lastWbIdx.current = events.length;

        for (const evt of newEvents) {
            // Skip own events — we already drew locally
            if (evt.from === sessionId) continue;

            if (evt.type === 'whiteboard_clear') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                continue;
            }

            if (evt.type !== 'whiteboard_draw') continue;

            const { points, color: c, width: w } = evt.payload || {};
            if (!points || points.length < 2) continue;

            if (c === '__erase__') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = c || '#ffffff';
            }
            ctx.lineWidth = w || 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
    }, [events, sessionId]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
        if (disabled) return;
        setDrawing(true);
        lastPos.current = getPos(e);
    };

    const draw = useCallback((e) => {
        if (!drawing || disabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = lineWidth * 5;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
        }
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        // Broadcast stroke
        send('whiteboard_draw', {
            tool,
            points: [lastPos.current, pos],
            color: tool === 'eraser' ? '__erase__' : color,
            width: tool === 'eraser' ? lineWidth * 5 : lineWidth,
        });

        lastPos.current = pos;
    }, [drawing, tool, color, lineWidth, send]);

    const endDraw = () => setDrawing(false);

    const clearBoard = () => {
        const canvas = canvasRef.current;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        send('whiteboard_clear', {});
    };

    return (
        <div className="edm-whiteboard">
            <div className="edm-wb-toolbar">
                <button className={tool === 'pen' ? 'active' : ''} onClick={() => setTool('pen')} title="Pen"><FaPencilAlt /></button>
                <button className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')} title="Eraser"><FaEraser /></button>
                <button onClick={clearBoard} title="Clear"><FaTrash /></button>
                <span className="edm-wb-sep" />
                {COLORS.map(c => (
                    <button
                        key={c}
                        className={`edm-wb-color ${color === c ? 'active' : ''}`}
                        style={{ background: c }}
                        onClick={() => setColor(c)}
                    />
                ))}
                <span className="edm-wb-sep" />
                <input type="range" min="1" max="8" value={lineWidth} onChange={e => setLineWidth(+e.target.value)} title="Thickness" />
            </div>
            <div ref={containerRef} style={{ flex:1, position:'relative', minHeight:0 }}>
                <canvas
                    ref={canvasRef}
                    className="edm-wb-canvas"
                    style={disabled ? { cursor:'not-allowed', opacity:.6 } : {}}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
            </div>
        </div>
    );
}
