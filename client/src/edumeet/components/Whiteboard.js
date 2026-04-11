import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaEraser, FaTrash } from 'react-icons/fa';

const COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#c9a227'];

/**
 * Collaborative whiteboard — draws locally and broadcasts strokes via WebSocket.
 */
export default function Whiteboard({ events, send }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(2);
    const lastPos = useRef(null);

    // Replay remote whiteboard strokes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const wbEvents = events.filter(e => e.type === 'whiteboard_draw' || e.type === 'whiteboard_clear');
        const last = wbEvents[wbEvents.length - 1];
        if (!last) return;

        if (last.type === 'whiteboard_clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const { points, color: c, width: w } = last.payload || {};
        if (!points || points.length < 2) return;

        ctx.strokeStyle = c || '#ffffff';
        ctx.lineWidth = w || 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }, [events]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
        setDrawing(true);
        lastPos.current = getPos(e);
    };

    const draw = useCallback((e) => {
        if (!drawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);

        ctx.strokeStyle = tool === 'eraser' ? '#0a1a0e' : color;
        ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        // Broadcast stroke
        send('whiteboard_draw', {
            tool,
            points: [lastPos.current, pos],
            color: tool === 'eraser' ? '#0a1a0e' : color,
            width: tool === 'eraser' ? lineWidth * 4 : lineWidth,
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
            <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="edm-wb-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
            />
        </div>
    );
}
