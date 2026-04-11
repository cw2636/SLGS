/**
 * Virtual Background Processor for EduMeet
 *
 * Uses MediaPipe SelfieSegmentation to separate the person from background,
 * then composites them onto a canvas-painted virtual scene.
 *
 * Scenes are painted programmatically using Canvas 2D — no images needed.
 * Person segmentation runs at ~25fps on modern hardware.
 */

// ─── MediaPipe loader ──────────────────────────────────────────────
let segmentationLoaded = false;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function ensureMediaPipe() {
    if (segmentationLoaded && window.SelfieSegmentation) return;
    await loadScript(
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js'
    );
    segmentationLoaded = true;
}

// ─── Scene Painters ────────────────────────────────────────────────

function paintClassroom(ctx, w, h) {
    // Cream wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    wallGrad.addColorStop(0, '#f5e6c8');
    wallGrad.addColorStop(1, '#e8d5a8');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h * 0.55);

    // Blackboard
    const bx = w * 0.12, by = h * 0.08, bw = w * 0.76, bh = h * 0.38;
    // Frame
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 16);
    // Board surface
    const board = ctx.createLinearGradient(bx, by, bx, by + bh);
    board.addColorStop(0, '#2d5a3f');
    board.addColorStop(0.5, '#1a4731');
    board.addColorStop(1, '#2d5a3f');
    ctx.fillStyle = board;
    ctx.fillRect(bx, by, bw, bh);
    // Chalk lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.08, by + bh * 0.3);
    ctx.lineTo(bx + bw * 0.5, by + bh * 0.3);
    ctx.moveTo(bx + bw * 0.08, by + bh * 0.5);
    ctx.lineTo(bx + bw * 0.4, by + bh * 0.5);
    ctx.moveTo(bx + bw * 0.08, by + bh * 0.7);
    ctx.lineTo(bx + bw * 0.6, by + bh * 0.7);
    ctx.stroke();
    // Chalk tray
    ctx.fillStyle = '#5c3a1e';
    ctx.fillRect(bx, by + bh + 6, bw, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx + bw * 0.3, by + bh + 3, 20, 4);
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(bx + bw * 0.36, by + bh + 3, 15, 4);

    // Wooden floor
    const floor = ctx.createLinearGradient(0, h * 0.55, 0, h);
    floor.addColorStop(0, '#c4903e');
    floor.addColorStop(1, '#7a5a20');
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
    // Floor boards
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let y = h * 0.6; y < h; y += h * 0.08) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    // Ceiling light glow
    const light = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.35);
    light.addColorStop(0, 'rgba(255,230,150,0.12)');
    light.addColorStop(1, 'transparent');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, w, h * 0.35);
}

function paintLibrary(ctx, w, h) {
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(0, 0, w, h);

    const colors = [
        '#b71c1c','#1b5e20','#0d47a1','#e65100','#4a148c',
        '#880e4f','#004d40','#bf360c','#1a237e','#33691e',
        '#f57f17','#311b92','#006064','#b71c1c','#e65100',
    ];
    const shelfH = h * 0.18;
    for (let s = 0; s < 4; s++) {
        const sy = s * (shelfH + h * 0.02) + h * 0.05;
        let x = w * 0.02, idx = s * 7;
        while (x < w * 0.98) {
            const bw = 8 + Math.abs(Math.sin(idx * 3.7)) * 16;
            const bh = shelfH - 4 - Math.abs(Math.cos(idx * 2.3)) * 12;
            ctx.fillStyle = colors[idx % colors.length];
            ctx.fillRect(x, sy + (shelfH - 4 - bh), bw - 1, bh);
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x + 1, sy + (shelfH - 4 - bh), 2, bh);
            x += bw;
            idx++;
        }
        // Shelf plank
        const plank = ctx.createLinearGradient(0, sy + shelfH - 4, 0, sy + shelfH + 6);
        plank.addColorStop(0, '#6d4c41');
        plank.addColorStop(0.5, '#8d6e63');
        plank.addColorStop(1, '#5d4037');
        ctx.fillStyle = plank;
        ctx.fillRect(0, sy + shelfH - 4, w, 10);
    }
    // Warm lamp glow
    const lamp = ctx.createRadialGradient(w * 0.2, h * 0.05, 0, w * 0.2, h * 0.05, h * 0.4);
    lamp.addColorStop(0, 'rgba(255,200,100,0.12)');
    lamp.addColorStop(1, 'transparent');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w * 0.5, h * 0.5);
}

function paintOffice(ctx, w, h) {
    // Wall
    const wall = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    wall.addColorStop(0, '#eceff1');
    wall.addColorStop(1, '#cfd8dc');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, h * 0.62);
    // Window
    const wx = w * 0.6, wy = h * 0.05, ww = w * 0.28, wh = h * 0.35;
    ctx.fillStyle = '#b3e5fc';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();
    // Desk
    const desk = ctx.createLinearGradient(0, h * 0.58, 0, h * 0.64);
    desk.addColorStop(0, '#8d6e63');
    desk.addColorStop(1, '#6d4c41');
    ctx.fillStyle = desk;
    ctx.fillRect(0, h * 0.58, w, h * 0.06);
    // Floor
    ctx.fillStyle = '#455a64';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
    // Plant
    ctx.fillStyle = '#33691e';
    ctx.beginPath();
    ctx.ellipse(w * 0.08, h * 0.5, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.1, h * 0.47, 15, 18, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(w * 0.05, h * 0.53, w * 0.06, h * 0.06);
}

function paintSunset(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0d1b2a');
    sky.addColorStop(0.15, '#1b2838');
    sky.addColorStop(0.3, '#2c1654');
    sky.addColorStop(0.45, '#6a1b3d');
    sky.addColorStop(0.55, '#c75b20');
    sky.addColorStop(0.65, '#e8a030');
    sky.addColorStop(0.75, '#1a1a2e');
    sky.addColorStop(1, '#0a0a14');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // Sun
    const sx = w * 0.65, sy = h * 0.48;
    const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, 50);
    sun.addColorStop(0, '#ffb300');
    sun.addColorStop(0.5, 'rgba(255,143,0,0.6)');
    sun.addColorStop(1, 'transparent');
    ctx.fillStyle = sun;
    ctx.beginPath(); ctx.arc(sx, sy, 50, 0, Math.PI * 2); ctx.fill();
    // Haze
    const haze = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150);
    haze.addColorStop(0, 'rgba(255,183,77,0.15)');
    haze.addColorStop(1, 'transparent');
    ctx.fillStyle = haze;
    ctx.beginPath(); ctx.arc(sx, sy, 150, 0, Math.PI * 2); ctx.fill();
    // Stars
    ctx.fillStyle = '#fff';
    [[.1,.1],[.2,.05],[.35,.12],[.5,.03],[.65,.08],[.85,.06],[.15,.2],[.45,.18]].forEach(([px,py]) => {
        ctx.beginPath(); ctx.arc(w*px, h*py, 1, 0, Math.PI*2); ctx.fill();
    });
}

function paintSpace(ctx, w, h) {
    const deep = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h));
    deep.addColorStop(0, '#0a0a2e');
    deep.addColorStop(1, '#000005');
    ctx.fillStyle = deep;
    ctx.fillRect(0, 0, w, h);
    // Nebula
    const n1 = ctx.createRadialGradient(w*.3, h*.4, 0, w*.3, h*.4, w*.3);
    n1.addColorStop(0, 'rgba(106,27,154,0.2)');
    n1.addColorStop(1, 'transparent');
    ctx.fillStyle = n1; ctx.fillRect(0, 0, w, h);
    const n2 = ctx.createRadialGradient(w*.7, h*.6, 0, w*.7, h*.6, w*.25);
    n2.addColorStop(0, 'rgba(13,71,161,0.2)');
    n2.addColorStop(1, 'transparent');
    ctx.fillStyle = n2; ctx.fillRect(0, 0, w, h);
    // Stars
    const stars = [
        [.05,.1],[.15,.3],[.25,.05],[.35,.7],[.45,.15],[.55,.9],[.65,.25],
        [.75,.6],[.85,.1],[.95,.45],[.1,.8],[.3,.55],[.5,.4],[.7,.85],[.9,.3],
        [.2,.95],[.4,.35],[.6,.05],[.8,.75],[.12,.5],[.38,.88],[.58,.62],
    ];
    stars.forEach(([sx,sy], i) => {
        ctx.globalAlpha = 0.5 + (i%2)*0.5;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(w*sx, h*sy, 0.5+(i%3)*0.5, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Planet
    const px = w*0.78, py = h*0.7, pr = 25;
    const planet = ctx.createRadialGradient(px-5, py-5, 0, px, py, pr);
    planet.addColorStop(0, '#42a5f5');
    planet.addColorStop(0.7, '#1565c0');
    planet.addColorStop(1, '#0d47a1');
    ctx.fillStyle = planet;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
    // Ring
    ctx.strokeStyle = 'rgba(200,200,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(px, py, pr*1.6, pr*0.3, -0.2, 0, Math.PI*2); ctx.stroke();
}

const PAINTERS = { classroom: paintClassroom, library: paintLibrary, office: paintOffice, sunset: paintSunset, space: paintSpace };

// ─── VirtualBackground class ───────────────────────────────────────

export default class VirtualBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        // Pre-rendered background canvas
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        // Hidden video element for reading camera frames
        this.video = document.createElement('video');
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.setAttribute('playsinline', '');
        this.segmenter = null;
        this.bgId = 'none';
        this.running = false;
        this._processing = false;
        this._rawStream = null;
        this._outputStream = null;
        this._animFrame = null;
    }

    async _init() {
        await ensureMediaPipe();
        this.segmenter = new window.SelfieSegmentation({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        this.segmenter.setOptions({ modelSelection: 1, selfieMode: true });
        this.segmenter.onResults((r) => this._onResults(r));
        // Warm up the segmenter (loads model file)
        // We'll send the first real frame in the loop
    }

    /**
     * Process a raw camera stream with virtual background.
     * Returns a new MediaStream with the composited video + original audio.
     * If already processing the same stream, just updates the background.
     */
    async process(rawStream, bgId) {
        this.bgId = bgId;

        if (!bgId || bgId === 'none') {
            this.stop();
            return rawStream;
        }

        // Same stream, just changing background → update scene and reuse output
        if (this._rawStream === rawStream && this._outputStream) {
            this._prerenderBg();
            return this._outputStream;
        }

        // New stream: full setup
        if (!this.segmenter) await this._init();

        this._rawStream = rawStream;
        this.video.srcObject = rawStream;
        await this.video.play();

        const vw = this.video.videoWidth || 640;
        const vh = this.video.videoHeight || 480;
        this.canvas.width = vw;
        this.canvas.height = vh;
        this.bgCanvas.width = vw;
        this.bgCanvas.height = vh;
        this._prerenderBg();

        this.running = true;
        this._loop();

        this._outputStream = this.canvas.captureStream(25);
        // Pass through audio tracks
        rawStream.getAudioTracks().forEach((t) => this._outputStream.addTrack(t));

        return this._outputStream;
    }

    /** Change the background scene without recreating the stream. */
    changeBg(bgId) {
        this.bgId = bgId;
        if (bgId && bgId !== 'none') {
            this._prerenderBg();
        }
    }

    /** Pre-render the scene background to the background canvas. */
    _prerenderBg() {
        const painter = PAINTERS[this.bgId];
        if (painter) {
            this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
            painter(this.bgCtx, this.bgCanvas.width, this.bgCanvas.height);
        }
    }

    /** Animation loop: send frames to the segmenter. */
    _loop = () => {
        if (!this.running) return;

        if (this.video.readyState >= 2 && !this._processing) {
            this._processing = true;
            this.segmenter
                .send({ image: this.video })
                .then(() => { this._processing = false; })
                .catch(() => {
                    this._processing = false;
                    // Fallback: draw raw frame
                    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                });
        }

        this._animFrame = requestAnimationFrame(this._loop);
    };

    /** Compositing callback from MediaPipe. */
    _onResults(results) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // 1. Draw segmentation mask (person = white, bg = black)
        //    Soften edges with a slight blur
        ctx.filter = 'blur(3px)';
        ctx.drawImage(results.segmentationMask, 0, 0, w, h);
        ctx.filter = 'none';

        // 2. Keep only person pixels from the original frame
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(results.image, 0, 0, w, h);

        // 3. Draw background behind the person
        ctx.globalCompositeOperation = 'destination-over';
        if (this.bgId === 'blur') {
            ctx.filter = 'blur(12px)';
            ctx.drawImage(results.image, 0, 0, w, h);
            ctx.filter = 'none';
        } else {
            ctx.drawImage(this.bgCanvas, 0, 0);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }

    /** Pause processing (keeps segmenter alive for quick resume). */
    stop() {
        this.running = false;
        if (this._animFrame) cancelAnimationFrame(this._animFrame);
    }

    /** Full cleanup — close segmenter, release resources. */
    destroy() {
        this.stop();
        if (this.segmenter) {
            try { this.segmenter.close(); } catch { /* ignore */ }
            this.segmenter = null;
        }
        this.video.srcObject = null;
        this._rawStream = null;
        this._outputStream = null;
    }
}
