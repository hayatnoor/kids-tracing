'use strict';

function tryAgain() {
  document.getElementById('result-overlay').classList.remove('active');
  if (currentQuiz || mode === 'math' || mode === 'sight' || mode === 'arabic' || mode === 'shapes' || mode === 'matching') {
    goHome();
  } else {
    clearDrawing();
  }
}

function nextChar() {
  document.getElementById('result-overlay').classList.remove('active');
  if (currentQuiz) {
    currentQuiz.start();
  } else if (mode === 'math') {
    if (mathGrade === '1st') { startMath1st(); } else { startMath(); }
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

let currentGrade = 'kg';
let currentTopicCategory = null;

const GRADE_HOME_SCREEN = {
  kg:    'welcome',
  '1st': 'grade-1-screen',
  '2nd': 'grade-2-screen',
  '3rd': 'grade-3-screen',
  '4th': 'grade-4-screen',
  '5th': 'grade-5-screen',
};

function selectGrade(grade) {
  currentGrade = grade;
  document.getElementById('grade-select').classList.remove('active');
  document.getElementById(GRADE_HOME_SCREEN[grade]).classList.add('active');
}

function goGradePicker() {
  document.querySelectorAll('.screen.active').forEach(el => el.classList.remove('active'));
  document.getElementById('grade-select').classList.add('active');
}

function goHome() {
  document.getElementById('result-overlay').classList.remove('active');
  document.querySelectorAll('.screen.active').forEach(el => el.classList.remove('active'));
  document.getElementById(GRADE_HOME_SCREEN[currentGrade]).classList.add('active');
  currentQuiz = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── TOPIC SELECT (1st-5th: Math/Reading -> topic -> quiz) ──────
function showTopicSelect(category) {
  currentTopicCategory = category;
  const catalog = category === 'math' ? MATH_TOPIC_CATALOG : READING_TOPIC_CATALOG;
  const meta    = category === 'math' ? MATH_TOPIC_META    : READING_TOPIC_META;
  const topics  = catalog[currentGrade] || [];

  document.getElementById('topic-select-emoji').textContent = category === 'math' ? '🧮' : '📖';
  document.getElementById('topic-select-title').textContent = category === 'math' ? 'Choose a math topic' : 'Choose a reading topic';
  document.getElementById('topic-grid').innerHTML = topics.map(key => {
    const m = meta[key];
    return `<button class="btn btn-xl" style="background:${m.color};color:${m.textColor};box-shadow:0 9px 0 rgba(0,0,0,0.22);" onclick="startTopic('${key}')">${m.label}</button>`;
  }).join('');

  document.querySelectorAll('.screen.active').forEach(el => el.classList.remove('active'));
  document.getElementById('topic-select-screen').classList.add('active');
}

function startTopic(topicKey) {
  if (currentTopicCategory === 'math') {
    startMathTopic(topicKey, currentGrade);
  } else {
    startReadingTopic(topicKey, currentGrade);
  }
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
