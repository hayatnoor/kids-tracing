'use strict';

// ── SHAPES MODE ───────────────────────────────────────────────
const SHAPES = [
  { name: 'circle',    sides: 0 },
  { name: 'oval',      sides: 0 },
  { name: 'triangle',  sides: 3 },
  { name: 'square',    sides: 4 },
  { name: 'rectangle', sides: 4 },
  { name: 'pentagon',  sides: 5 },
  { name: 'hexagon',   sides: 6 },
  { name: 'octagon',   sides: 8 },
];

const SHAPES_TOTAL = 10;
const SIDES_POOL   = [0, 3, 4, 5, 6, 8];

let shapesDone            = 0;
let shapesQuestion        = 0;
let currentShape          = null;
let shapesUsed            = [];
let shapesAttempts        = [];
let shapesCurrentAttempts = 0;
let shapesQType           = 'sides'; // 'sides' | 'listen'

function startShapes() {
  mode                  = 'shapes';
  shapesDone            = 0;
  shapesQuestion        = 0;
  shapesUsed            = [];
  shapesAttempts        = [];
  shapesCurrentAttempts = 0;

  document.getElementById('welcome').classList.remove('active');
  document.getElementById('shapes-screen').classList.add('active');

  buildShapesDots();
  nextShape();
}

function nextShape() {
  shapesQuestion++;
  shapesCurrentAttempts = 0;
  shapesQType = Math.random() < 0.5 ? 'sides' : 'listen';
  document.getElementById('shapes-label').textContent = `Shape ${shapesQuestion} of ${SHAPES_TOTAL}`;

  const available = SHAPES.filter(s => !shapesUsed.includes(s.name));
  const pool = available.length ? available : SHAPES;
  currentShape = pool[Math.floor(Math.random() * pool.length)];
  shapesUsed.push(currentShape.name);
  if (shapesUsed.length > 6) shapesUsed.shift();

  renderShapesQuestion();
  if (shapesQType === 'listen') {
    setTimeout(() => speakShape(currentShape), 500);
  }
}

function renderShapesQuestion() {
  const contentWrap = document.getElementById('shapes-content-wrap');
  const gridEl      = document.getElementById('shapes-grid');

  if (shapesQType === 'sides') {
    contentWrap.innerHTML = `<div class="shapes-big-svg">${makeShapeSVG(currentShape)}</div>`;
    document.getElementById('shapes-question').textContent = 'How many sides does this shape have?';

    const wrongPool = SIDES_POOL.filter(n => n !== currentShape.sides);
    const wrongs = [];
    while (wrongs.length < 3) {
      const n = wrongPool[Math.floor(Math.random() * wrongPool.length)];
      if (!wrongs.includes(n)) wrongs.push(n);
    }
    const choices = [currentShape.sides, ...wrongs].sort(() => Math.random() - 0.5);
    gridEl.className = 'shapes-num-grid';
    gridEl.innerHTML = choices.map(n =>
      `<button class="shapes-num-btn" data-val="${n}" onclick="checkShapeAnswer('${n}')">${n}</button>`
    ).join('');

  } else {
    contentWrap.innerHTML = `<button id="shapes-listen-btn" class="shapes-listen-btn" onclick="speakShape(currentShape)">🔊 Hear it again!</button>`;
    document.getElementById('shapes-question').textContent = 'Which shape is it?';

    const others = SHAPES.filter(s => s.name !== currentShape.name);
    const wrongs = [];
    while (wrongs.length < 3) {
      const s = others[Math.floor(Math.random() * others.length)];
      if (!wrongs.find(w => w.name === s.name)) wrongs.push(s);
    }
    const choices = [currentShape, ...wrongs].sort(() => Math.random() - 0.5);
    gridEl.className = 'shapes-card-grid';
    gridEl.innerHTML = choices.map(s =>
      `<button class="shapes-card" data-name="${s.name}" onclick="checkShapeAnswer('${s.name}')">${makeShapeSVG(s)}</button>`
    ).join('');
  }
}

function makeShapeSVG(shape) {
  const fill   = '#818cf8';
  const stroke = '#4338ca';
  const sw     = 4;
  let inner    = '';

  switch (shape.name) {
    case 'circle':
      inner = `<circle cx="50" cy="50" r="42" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'oval':
      inner = `<ellipse cx="50" cy="50" rx="46" ry="28" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'triangle':
      inner = `<polygon points="50,8 92,88 8,88" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'square':
      inner = `<rect x="9" y="9" width="82" height="82" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'rectangle':
      inner = `<rect x="4" y="22" width="92" height="56" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'pentagon':
      inner = `<polygon points="50,8 92,36 76,84 24,84 8,36" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'hexagon':
      inner = `<polygon points="50,8 88,29 88,71 50,92 12,71 12,29" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'octagon':
      inner = `<polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function speakShape(shape) {
  if (!window.speechSynthesis || !shape) return;
  window.speechSynthesis.cancel();

  const btn = document.getElementById('shapes-listen-btn');

  function doSpeak(voices) {
    const utt  = new SpeechSynthesisUtterance(shape.name);
    utt.rate   = 0.8;
    utt.pitch  = 1.15;
    utt.volume = 1;
    const preferred = ['Samantha (Enhanced)', 'Samantha', 'Karen', 'Moira'];
    const pick = preferred.map(n => voices.find(v => v.name === n)).find(Boolean)
              || voices.find(v => v.lang.startsWith('en-US'))
              || voices.find(v => v.lang.startsWith('en'));
    if (pick) utt.voice = pick;
    if (btn) btn.classList.add('speaking');
    utt.onend   = () => { if (btn) btn.classList.remove('speaking'); };
    utt.onerror = () => { if (btn) btn.classList.remove('speaking'); };
    window.speechSynthesis.speak(utt);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    doSpeak(voices);
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak(window.speechSynthesis.getVoices());
    };
  }
}

function checkShapeAnswer(val) {
  const isCorrect = shapesQType === 'sides'
    ? parseInt(val) === currentShape.sides
    : val === currentShape.name;

  const sel = shapesQType === 'sides' ? '.shapes-num-btn' : '.shapes-card';

  if (isCorrect) {
    document.querySelectorAll(sel).forEach(b => {
      b.disabled = true;
      const match = shapesQType === 'sides' ? b.dataset.val === val : b.dataset.name === val;
      if (match) b.classList.add('correct');
    });

    shapesAttempts.push(shapesCurrentAttempts);
    shapesDone++;
    updateShapesDots();
    playSound('win');
    launchConfetti();

    if (shapesDone >= SHAPES_TOTAL) {
      setTimeout(showShapesComplete, 900);
    } else {
      setTimeout(nextShape, 1200);
    }
  } else {
    shapesCurrentAttempts++;
    playSound('error');

    document.querySelectorAll(sel).forEach(b => {
      const match = shapesQType === 'sides' ? b.dataset.val === val : b.dataset.name === val;
      if (!match) return;
      b.style.background  = '#fee2e2';
      b.style.borderColor = '#f87171';
      b.style.color       = '#dc2626';
      b.style.animation   = 'sightShake 0.45s ease-in-out';
      b.addEventListener('animationend', () => {
        b.style.background  = '';
        b.style.borderColor = '';
        b.style.color       = '';
        b.style.animation   = '';
      }, { once: true });
    });
  }
}

function showShapesComplete() {
  const firstTry = shapesAttempts.filter(a => a === 0).length;
  const stars = firstTry >= 10 ? 5
              : firstTry >= 8  ? 4
              : firstTry >= 6  ? 3
              : firstTry >= 4  ? 2
              : 1;
  const subText = firstTry === SHAPES_TOTAL
    ? `Perfect! All ${SHAPES_TOTAL} shapes on the first try! 🎊`
    : `${firstTry} out of ${SHAPES_TOTAL} on your first try!`;

  document.getElementById('r-emoji').textContent       = '🔷';
  document.getElementById('r-msg').textContent         = 'Shape Star!';
  document.getElementById('r-msg').style.color         = '#4338ca';
  document.getElementById('r-sub').textContent         = subText;
  document.getElementById('btn-try-again').textContent = '🏠 Home';
  document.getElementById('btn-next').textContent      = '🔄 Play Again';

  const row = document.getElementById('r-stars');
  row.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.className = 'star-item';
    s.textContent = i < stars ? '⭐' : '☆';
    s.style.animationDelay = `${i * 0.12}s`;
    s.style.color = i < stars ? '#facc15' : '#d1d5db';
    row.appendChild(s);
  }

  document.getElementById('result-overlay').classList.add('active');
  playSound('win');
  launchConfetti();
}

function buildShapesDots() {
  const row = document.getElementById('shapes-progress-row');
  row.innerHTML = Array.from({ length: SHAPES_TOTAL }, (_, i) =>
    `<div class="dot" id="shd${i}"></div>`
  ).join('');
  updateShapesDots();
}

function updateShapesDots() {
  for (let i = 0; i < SHAPES_TOTAL; i++) {
    const d = document.getElementById(`shd${i}`);
    if (!d) return;
    if (i < shapesDone)        d.className = shapesAttempts[i] === 0 ? 'dot done' : 'dot wrong';
    else if (i === shapesDone) d.className = 'dot current';
    else                       d.className = 'dot';
  }
}
