'use strict';

// ── SOUND ─────────────────────────────────────────────────────
let actx;
function getACtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  return actx;
}

function tone(freq, start, dur) {
  try {
    const ctx = getACtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.22, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime  + start + dur + 0.05);
  } catch (_) {}
}

function buzz(freq, start, dur) {
  try {
    const ctx = getACtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.18, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime  + start + dur + 0.05);
  } catch (_) {}
}

function playSound(type) {
  if (type === 'win')   { tone(523,.00,.12); tone(659,.13,.12); tone(784,.26,.12); tone(1047,.39,.3); }
  else if (type === 'error') { buzz(220,.00,.14); buzz(175,.15,.28); }
}

function shakeCanvas() {
  const el = document.getElementById('canvas-wrap');
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ── CONFETTI ──────────────────────────────────────────────────
function launchConfetti() {
  const palette = ['#f87171','#fde047','#4ade80','#60a5fa','#c084fc','#fb923c','#34d399'];
  for (let i = 0; i < 75; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetto';
      const size = 10 + Math.random() * 14;
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -50px;
        width: ${size}px;
        height: ${size}px;
        background: ${palette[Math.floor(Math.random() * palette.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '4px'};
        animation-duration: ${1.5 + Math.random()}s;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, i * 20);
  }
}
