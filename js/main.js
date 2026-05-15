'use strict';

function tryAgain() {
  document.getElementById('result-overlay').classList.remove('active');
  if (mode === 'math' || mode === 'sight' || mode === 'arabic' || mode === 'shapes' || mode === 'matching') {
    goHome();
  } else {
    clearDrawing();
  }
}

function nextChar() {
  document.getElementById('result-overlay').classList.remove('active');
  if (mode === 'math') {
    startMath();
  } else if (mode === 'sight') {
    startSight();
  } else if (mode === 'arabic') {
    startArabic();
  } else if (mode === 'shapes') {
    startShapes();
  } else if (mode === 'matching') {
    document.getElementById('result-overlay').classList.remove('active');
    document.getElementById('matching-screen').classList.remove('active');
    document.getElementById('matching-size-screen').classList.add('active');
  } else {
    idx = (idx + 1) % items.length;
    loadChar();
  }
}

// ── NAVIGATION ────────────────────────────────────────────────
function startMode(m) {
  mode  = m;
  items = m === 'letters' ? LETTERS : NUMBERS;
  idx   = 0;
  done.clear();

  document.getElementById('mode-select-emoji').textContent = m === 'letters' ? '🔤' : '🔢';
  document.getElementById('welcome').classList.remove('active');
  document.getElementById('mode-select').classList.add('active');
}

function startSubMode(sub) {
  submode = sub;
  document.getElementById('mode-select').classList.remove('active');
  document.getElementById('tracing').classList.add('active');
  buildDots();
  setLabel();
  document.fonts.ready.then(() => { resize(); });
}

function setLabel() {
  const verb = submode === 'writing' ? 'Write' : 'Trace';
  const noun = mode === 'letters' ? 'letter' : 'number';
  document.getElementById('char-label').textContent = `${verb} the ${noun} ${items[idx]}`;
}

function loadChar() {
  clearDrawing();
  setLabel();
  renderGuide();
  updateDots();
}

function skipCurrent() {
  idx = (idx + 1) % items.length;
  loadChar();
}

function goHome() {
  document.getElementById('result-overlay').classList.remove('active');
  document.getElementById('tracing').classList.remove('active');
  document.getElementById('mode-select').classList.remove('active');
  document.getElementById('math-screen').classList.remove('active');
  document.getElementById('sight-screen').classList.remove('active');
  document.getElementById('arabic-screen').classList.remove('active');
  document.getElementById('shapes-screen').classList.remove('active');
  document.getElementById('matching-size-screen').classList.remove('active');
  document.getElementById('matching-screen').classList.remove('active');
  document.getElementById('welcome').classList.add('active');
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── PROGRESS DOTS ─────────────────────────────────────────────
function buildDots() {
  const row = document.getElementById('progress-row');
  row.innerHTML = items.map((_, i) => `<div class="dot" id="d${i}"></div>`).join('');
  updateDots();
}

function updateDots() {
  items.forEach((_, i) => {
    const d = document.getElementById(`d${i}`);
    if (!d) return;
    d.className = 'dot' + (done.has(i) ? ' done' : i === idx ? ' current' : '');
  });
}


// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('touchmove',  e => e.preventDefault(), { passive: false });
document.addEventListener('touchstart', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
