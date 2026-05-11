'use strict';

'use strict';

// ── MATH MODE ─────────────────────────────────────────────────
const MATH_TOTAL = 10;
const MATH_EMOJI = ['⭐','🍎','🐶','🦋','🎈','🐠','🍭','🐸','🌸','🏀'];

let mathCorrect         = 0;
let mathQuestion        = 0;
let currentProblem      = null;
let mathAttempts        = [];
let mathCurrentAttempts = 0;

function startMath() {
  mode         = 'math';
  mathCorrect         = 0;
  mathQuestion        = 0;
  mathAttempts        = [];
  mathCurrentAttempts = 0;

  document.getElementById('welcome').classList.remove('active');
  document.getElementById('math-screen').classList.add('active');

  buildMathDots();
  nextMathProblem();
}

function generateProblem() {
  const emoji = MATH_EMOJI[Math.floor(Math.random() * MATH_EMOJI.length)];
  const isAdd = Math.random() > 0.35;

  let a, b, answer, op;
  if (isAdd) {
    a = Math.floor(Math.random() * 5) + 1; // 1–5
    b = Math.floor(Math.random() * 5) + 1; // 1–5
    while (a + b > 10) b = Math.floor(Math.random() * 5) + 1;
    answer = a + b;
    op = '+';
  } else {
    a = Math.floor(Math.random() * 7) + 3;               // 3–9
    b = Math.floor(Math.random() * Math.min(a - 1, 4)) + 1; // 1–min(a-1, 4)
    answer = a - b;
    op = '−';
  }

  // Three wrong choices close to the correct answer
  const wrongs = new Set();
  let tries = 0;
  while (wrongs.size < 3 && tries < 60) {
    tries++;
    const d = Math.floor(Math.random() * 3) + 1;
    const w = answer + (Math.random() > 0.5 ? d : -d);
    if (w !== answer && w >= 0 && w <= 10) wrongs.add(w);
  }
  for (let n = 0; n <= 10 && wrongs.size < 3; n++) {
    if (n !== answer) wrongs.add(n);
  }

  const choices = [answer, ...[...wrongs].slice(0, 3)].sort(() => Math.random() - 0.5);
  return { a, b, answer, op, choices, emoji };
}

function nextMathProblem() {
  mathCurrentAttempts = 0;
  mathQuestion++;
  document.getElementById('math-label').textContent = `Question ${mathQuestion} of ${MATH_TOTAL}`;
  currentProblem = generateProblem();
  renderMathProblem();
}

function renderMathProblem() {
  const { a, b, op, choices, emoji } = currentProblem;
  const display = document.getElementById('math-display');

  const makeRow = n => Array(n).fill(`<span>${emoji}</span>`).join('');

  let emojiHTML;
  if (op === '+') {
    emojiHTML = `
      <div class="math-emoji-group">
        <div class="math-emoji-row">${makeRow(a)}</div>
        <div class="math-op-label">plus</div>
        <div class="math-emoji-row">${makeRow(b)}</div>
      </div>`;
  } else {
    const subRow = Array(a).fill(0).map((_, i) =>
      `<span class="${i >= a - b ? 'math-emoji-faded' : ''}">${emoji}</span>`
    ).join('');
    emojiHTML = `
      <div class="math-emoji-group">
        <div class="math-emoji-row">${subRow}</div>
        <div class="math-op-label">take away ${b}</div>
      </div>`;
  }

  display.innerHTML = `${emojiHTML}<div class="math-equation">${a} ${op} ${b} = ?</div>`;

  const btnColors = ['yellow', 'blue', 'green', 'purple'];
  const shuffledColors = [...btnColors].sort(() => Math.random() - 0.5);
  document.getElementById('math-choices').innerHTML = choices.map((c, i) =>
    `<button class="btn choice-btn ${shuffledColors[i]}" onclick="checkMathAnswer(${c})">${c}</button>`
  ).join('');
}

function checkMathAnswer(answer) {
  if (answer === currentProblem.answer) {
    mathAttempts.push(mathCurrentAttempts);
    mathCorrect++;
    updateMathDots();
    playSound('win');
    launchConfetti();

    document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });

    if (mathCorrect >= MATH_TOTAL) {
      setTimeout(showMathComplete, 900);
    } else {
      setTimeout(nextMathProblem, 1100);
    }
  } else {
    mathCurrentAttempts++;
    playSound('error');
    const display = document.getElementById('math-display');
    display.classList.remove('shake');
    void display.offsetWidth;
    display.classList.add('shake');
    display.addEventListener('animationend', () => display.classList.remove('shake'), { once: true });
  }
}

function showMathComplete() {
  const firstTry = mathAttempts.filter(a => a === 0).length;
  const stars = firstTry >= 10 ? 5
              : firstTry >= 8  ? 4
              : firstTry >= 6  ? 3
              : firstTry >= 4  ? 2
              : 1;
  const subText = firstTry === MATH_TOTAL
    ? `Perfect! All ${MATH_TOTAL} problems on the first try! 🎊`
    : `${firstTry} out of ${MATH_TOTAL} on your first try!`;

  document.getElementById('r-emoji').textContent        = '🏆';
  document.getElementById('r-msg').textContent          = 'Math Star!';
  document.getElementById('r-msg').style.color          = '#a855f7';
  document.getElementById('r-sub').textContent          = subText;
  document.getElementById('btn-try-again').textContent  = '🏠 Home';
  document.getElementById('btn-next').textContent       = '🔄 Play Again';

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

function buildMathDots() {
  const row = document.getElementById('math-progress-row');
  row.innerHTML = Array.from({ length: MATH_TOTAL }, (_, i) =>
    `<div class="dot" id="md${i}"></div>`
  ).join('');
  updateMathDots();
}

function updateMathDots() {
  for (let i = 0; i < MATH_TOTAL; i++) {
    const d = document.getElementById(`md${i}`);
    if (!d) return;
    if (i < mathCorrect)        d.className = mathAttempts[i] === 0 ? 'dot done' : 'dot wrong';
    else if (i === mathCorrect) d.className = 'dot current';
    else                        d.className = 'dot';
  }
}
