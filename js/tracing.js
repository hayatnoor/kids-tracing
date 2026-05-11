'use strict';

// ── CONSTANTS ──────────────────────────────────────────────────
const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const NUMBERS = [...'0123456789'];
const BRUSH   = 26;
const DRAW_COLOR = '#7c3aed';

// ── STATE ──────────────────────────────────────────────────────
let mode    = 'letters';
let submode = 'tracing'; // 'tracing' | 'writing'
let items   = LETTERS;
let idx     = 0;
let drawing = false;
let done    = new Set();
let canvasW = 0, canvasH = 0;

// ── CANVAS REFS ────────────────────────────────────────────────
const wrap     = document.getElementById('canvas-wrap');
const guideC   = document.getElementById('guide-canvas');
const drawC    = document.getElementById('draw-canvas');
const guideCtx = guideC.getContext('2d');
const drawCtx  = drawC.getContext('2d');

const tmplC   = document.createElement('canvas');
const tmplCtx = tmplC.getContext('2d');
tmplC.style.cssText = 'position:fixed;top:-9999px;opacity:0;pointer-events:none;';
document.body.appendChild(tmplC);

// ── RESIZE ────────────────────────────────────────────────────
function resize() {
  const { width: W, height: H } = wrap.getBoundingClientRect();
  const dpr = Math.ceil(window.devicePixelRatio) || 1;
  canvasW = W;
  canvasH = H;
  [guideC, drawC, tmplC].forEach(c => {
    c.width        = W * dpr;
    c.height       = H * dpr;
    c.style.width  = `${W}px`;
    c.style.height = `${H}px`;
  });
  [guideCtx, drawCtx, tmplCtx].forEach(ctx => ctx.setTransform(dpr, 0, 0, dpr, 0, 0));
  renderGuide();
}
window.addEventListener('resize', () => { resize(); clearDrawing(); });

// ── GUIDE RENDERING ───────────────────────────────────────────
function renderGuide() {
  const W = canvasW, H = canvasH;
  if (!W || !H) return;

  const char = items[idx];
  const fs   = Math.round(Math.min(W, H) * 0.76);
  const font = `900 ${fs}px 'Nunito', 'Arial Black', Arial`;

  tmplCtx.clearRect(0, 0, W, H);
  tmplCtx.font            = font;
  tmplCtx.textAlign       = 'center';
  tmplCtx.textBaseline    = 'middle';
  tmplCtx.fillStyle       = '#000';
  tmplCtx.fillText(char, W / 2, H / 2);

  guideCtx.clearRect(0, 0, W, H);

  if (submode === 'tracing') {
    guideCtx.font         = font;
    guideCtx.textAlign    = 'center';
    guideCtx.textBaseline = 'middle';
    guideCtx.fillStyle = 'rgba(109,40,217,0.18)';
    guideCtx.fillText(char, W / 2, H / 2);
    guideCtx.strokeStyle = 'rgba(109,40,217,0.45)';
    guideCtx.lineWidth   = Math.max(2, fs * 0.012);
    guideCtx.lineJoin    = 'round';
    guideCtx.setLineDash([fs * 0.04, fs * 0.025]);
    guideCtx.strokeText(char, W / 2, H / 2);
    guideCtx.setLineDash([]);
  } else {
    // Writing mode: show a dashed box matching the template character's bounds
    guideCtx.font         = font;
    guideCtx.textAlign    = 'center';
    guideCtx.textBaseline = 'middle';
    const m   = guideCtx.measureText(char);
    const pad = fs * 0.14;
    const boxW = m.width + pad * 2;
    const boxH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2;
    const boxX = W / 2 - boxW / 2;
    const boxY = H / 2 - boxH / 2;
    const radius = 20;

    guideCtx.beginPath();
    guideCtx.roundRect(boxX, boxY, boxW, boxH, radius);
    guideCtx.fillStyle   = 'rgba(109,40,217,0.05)';
    guideCtx.fill();
    guideCtx.strokeStyle = 'rgba(109,40,217,0.4)';
    guideCtx.lineWidth   = 3;
    guideCtx.setLineDash([14, 9]);
    guideCtx.stroke();
    guideCtx.setLineDash([]);
  }
}

function clamp(min, val, max) { return Math.max(min, Math.min(max, val)); }

// ── DRAWING ───────────────────────────────────────────────────
function eventPos(e) {
  const rect = drawC.getBoundingClientRect();
  const src  = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
  return {
    x: src.clientX - rect.left,
    y: src.clientY - rect.top
  };
}

function onDown(e) {
  e.preventDefault();
  drawing = true;

  const col = DRAW_COLOR;
  drawCtx.lineWidth   = BRUSH * 2;
  drawCtx.lineCap     = 'round';
  drawCtx.lineJoin    = 'round';
  drawCtx.strokeStyle = col;
  drawCtx.fillStyle   = col;

  const p = eventPos(e);
  drawCtx.beginPath();
  drawCtx.arc(p.x, p.y, BRUSH, 0, Math.PI * 2);
  drawCtx.fill();

  drawCtx.beginPath();
  drawCtx.moveTo(p.x, p.y);
}

function onMove(e) {
  e.preventDefault();
  if (!drawing) return;
  const p = eventPos(e);
  drawCtx.lineTo(p.x, p.y);
  drawCtx.stroke();
  drawCtx.beginPath();
  drawCtx.moveTo(p.x, p.y);
}

function onUp(e) {
  e.preventDefault();
  if (!drawing) return;
  drawing = false;
  drawCtx.beginPath();
}

drawC.addEventListener('touchstart', onDown, { passive: false });
drawC.addEventListener('touchmove',  onMove, { passive: false });
drawC.addEventListener('touchend',   onUp,   { passive: false });
drawC.addEventListener('mousedown',  onDown);
drawC.addEventListener('mousemove',  onMove);
drawC.addEventListener('mouseup',    onUp);
drawC.addEventListener('mouseleave', onUp);

// ── CLEAR ─────────────────────────────────────────────────────
function clearDrawing() {
  drawCtx.clearRect(0, 0, canvasW, canvasH);
}

// ── ASSESSMENT ────────────────────────────────────────────────
function checkTrace() {
  const W = drawC.width, H = drawC.height;
  if (!W || !H) return;

  const STEP = 3;
  const SW = Math.ceil(W / STEP);
  const SH = Math.ceil(H / STEP);
  const N  = SW * SH;

  const tPx = tmplCtx.getImageData(0, 0, W, H).data;
  const dPx = drawCtx.getImageData(0, 0, W, H).data;

  const tGrid = new Uint8Array(N);
  const dGrid = new Uint8Array(N);

  for (let sy = 0; sy < SH; sy++) {
    for (let sx = 0; sx < SW; sx++) {
      let tMax = 0, dMax = 0;
      for (let dy = 0; dy < STEP; dy++) {
        for (let dx = 0; dx < STEP; dx++) {
          const px = sx * STEP + dx, py = sy * STEP + dy;
          if (px >= W || py >= H) continue;
          const i = (py * W + px) * 4;
          tMax = Math.max(tMax, tPx[i + 3]);
          dMax = Math.max(dMax, dPx[i + 3]);
        }
      }
      tGrid[sy * SW + sx] = tMax > 15 ? 1 : 0;
      dGrid[sy * SW + sx] = dMax > 15 ? 1 : 0;
    }
  }

  const DR = Math.ceil(BRUSH * (window.devicePixelRatio || 1) / STEP);

  function dilate(grid) {
    const out = new Uint8Array(N);
    for (let sy = 0; sy < SH; sy++) {
      for (let sx = 0; sx < SW; sx++) {
        if (!grid[sy * SW + sx]) continue;
        for (let dy = -DR; dy <= DR; dy++) {
          const ny = sy + dy;
          if (ny < 0 || ny >= SH) continue;
          for (let dx = -DR; dx <= DR; dx++) {
            if (dx * dx + dy * dy > DR * DR) continue;
            const nx = sx + dx;
            if (nx >= 0 && nx < SW) out[ny * SW + nx] = 1;
          }
        }
      }
    }
    return out;
  }

  const dDilated = dilate(dGrid);
  const tDilated = dilate(tGrid);

  let tTotal = 0, tCovered = 0, dTotal = 0, dInside = 0;
  for (let i = 0; i < N; i++) {
    if (tGrid[i]) { tTotal++;  if (dDilated[i]) tCovered++; }
    if (dGrid[i]) { dTotal++;  if (tDilated[i]) dInside++;  }
  }

  if (tTotal === 0) {
    renderGuide();
    const retryData = tmplCtx.getImageData(0, 0, W, H).data;
    for (let i = 3; i < retryData.length; i += 4) {
      if (retryData[i] > 15) { checkTrace(); return; }
    }
    return;
  }

  const coverage  = tCovered / tTotal;
  const precision = dTotal > 0 ? dInside / dTotal : 0;
  const score     = 0.60 * coverage + 0.40 * precision;

  let stars;
  if (dTotal < 150)      stars = 0;
  else if (score < 0.30) stars = 1;
  else if (score < 0.50) stars = 2;
  else if (score < 0.75) stars = 3;
  else if (score < 0.95) stars = 4;
  else                   stars = 5;

  showResult(stars, score);
}

// ── RESULT UI ─────────────────────────────────────────────────
const RESULTS = [
  { emoji:'✏️', msg:'Try Again!',     sub:'Draw on the letter and try again.',     color:'#94a3b8' },
  { emoji:'😬', msg:'Not Quite!',     sub:'Stay closer to the letter.',            color:'#f97316' },
  { emoji:'😐', msg:'Keep Going!',    sub:'Trace the whole letter to move on.',    color:'#eab308' },
  { emoji:'😅', msg:'Almost There!',  sub:'Trace more carefully to move on.',      color:'#f59e0b' },
  { emoji:'🔥', msg:'So Close!',      sub:'Nearly perfect — give it one more try!',color:'#3b82f6' },
  { emoji:'🏆', msg:'AMAZING!',       sub:'Perfect! You rock! 🎊',                color:'#a855f7' },
];

let _scoreDebugTimer = null;
function showResult(stars, score) {
  const minStars = submode === 'writing' ? 4 : 5;
  if (stars < minStars) {
    playSound('error');
    shakeCanvas();
    clearDrawing();
    const el = document.getElementById('score-debug');
    if (el) {
      el.textContent = `Score: ${Math.round((score ?? 0) * 100)}%`;
      el.style.opacity = '1';
      clearTimeout(_scoreDebugTimer);
      _scoreDebugTimer = setTimeout(() => { el.style.opacity = '0'; }, 2500);
    }
    return;
  }

  done.add(idx);
  updateDots();

  document.getElementById('btn-try-again').textContent = '🔄 Try Again';
  document.getElementById('btn-next').textContent      = 'Next ▶';

  const r = RESULTS[5];
  document.getElementById('r-emoji').textContent   = r.emoji;
  document.getElementById('r-msg').textContent     = r.msg;
  document.getElementById('r-msg').style.color     = r.color;
  document.getElementById('r-sub').textContent     = submode === 'writing'
    ? 'You wrote it! Great job! 🎊'
    : r.sub;

  const row = document.getElementById('r-stars');
  row.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.className = 'star-item';
    s.textContent = '⭐';
    s.style.animationDelay = `${i * 0.12}s`;
    s.style.color = '#facc15';
    row.appendChild(s);
  }

  document.getElementById('result-overlay').classList.add('active');
  playSound('win');
  launchConfetti();
}

