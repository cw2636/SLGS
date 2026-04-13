import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaPencilAlt, FaEraser, FaTrash } from 'react-icons/fa';

const COLORS = ['#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#c9a227'];

// Fixed internal resolution — identical on every client so coordinates match exactly.
// CSS scales the canvas to fit the container; drawing uses this coordinate space.
const CW = 1920;
const CH = 1080;

/**
 * Collaborative whiteboard — draws locally and broadcasts strokes via WebSocket.
 */
export default function Whiteboard({ events, send, disabled, sessionId }) {
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [tool, setTool] = useState('pen');
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(2);
    const lastPos = useRef(null);

    // Set fixed internal resolution once
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = CW;
        canvas.height = CH;
    }, []);

    // Store all strokes so we can redraw on clear or late-join
    const strokesRef = useRef([]);
    const lastWbSeq = useRef(-1);

    const drawStroke = useCallback((ctx, points, c, w) => {
        if (!points || points.length < 2) return;
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
    }, []);

    // Replay remote whiteboard strokes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !events.length) return;
        const ctx = canvas.getContext('2d');

        const newEvents = events.filter(e => (e.__seq ?? 0) > lastWbSeq.current);
        if (!newEvents.length) return;
        lastWbSeq.current = newEvents[newEvents.length - 1].__seq ?? lastWbSeq.current;

        for (const evt of newEvents) {
            if (evt.from === sessionId) continue;

            if (evt.type === 'whiteboard_clear') {
                ctx.clearRect(0, 0, CW, CH);
                strokesRef.current = [];
                continue;
            }

            if (evt.type !== 'whiteboard_draw') continue;

            const { points, color: c, width: w } = evt.payload || {};
            drawStroke(ctx, points, c, w);
            strokesRef.current.push({ points, color: c, width: w });
        }
    }, [events, sessionId, drawStroke]);

    // Map mouse/touch position to the fixed canvas coordinate space
    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: ((clientX - rect.left) / rect.width) * CW,
            y: ((clientY - rect.top) / rect.height) * CH,
        };
    };

    const startDraw = (e) => {
        if (disabled) return;
        setDrawing(true);
        lastPos.current = getPos(e);
        pendingPoints.current = [lastPos.current];
    };

    // Batch points and flush every 50ms so we stay under the server 10 msg/sec rate limit.
    // Each message carries the full polyline segment instead of just 2 points.
    const pendingPoints = useRef([]);
    const flushTimer = useRef(null);

    const flushPoints = useCallback(() => {
        const pts = pendingPoints.current;
        if (pts.length < 2) return;
        const strokeColor = tool === 'eraser' ? '__erase__' : color;
        const strokeWidth = tool === 'eraser' ? lineWidth * 5 : lineWidth;
        send('whiteboard_draw', {
            tool,
            points: pts,
            color: strokeColor,
            width: strokeWidth,
        });
        // Keep the last point as the start of the next batch
        pendingPoints.current = [pts[pts.length - 1]];
    }, [tool, color, lineWidth, send]);

    const draw = useCallback((e) => {
        if (!drawing || disabled) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getPos(e);

        const strokeColor = tool === 'eraser' ? '__erase__' : color;
        const strokeWidth = tool === 'eraser' ? lineWidth * 5 : lineWidth;

        // Draw locally immediately for responsive feel
        drawStroke(ctx, [lastPos.current, pos], strokeColor, strokeWidth);
        strokesRef.current.push({ points: [lastPos.current, pos], color: strokeColor, width: strokeWidth });

        // Accumulate point for batched send
        pendingPoints.current.push(pos);

        // Schedule flush if not already scheduled
        if (!flushTimer.current) {
            flushTimer.current = setTimeout(() => {
                flushTimer.current = null;
                flushPoints();
            }, 50);
        }

        lastPos.current = pos;
    }, [drawing, tool, color, lineWidth, send, drawStroke, flushPoints]);

    const endDraw = useCallback(() => {
        setDrawing(false);
        // Flush any remaining points
        clearTimeout(flushTimer.current);
        flushTimer.current = null;
        flushPoints();
    }, [flushPoints]);

    const clearBoard = () => {
        const canvas = canvasRef.current;
        canvas.getContext('2d').clearRect(0, 0, CW, CH);
        strokesRef.current = [];
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
            <div style={{ flex:1, position:'relative', minHeight:0 }}>
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
