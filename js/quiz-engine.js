'use strict';

// ── SHARED QUIZ ENGINE ───────────────────────────────────────────
// Generalizes the dots/attempts/stars/result-overlay flow that math.js,
// sight.js, arabic.js and shapes.js each implement by hand. New grade x
// topic content (added from 1st grade onward) plugs into this instead of
// re-implementing that flow per topic.
//
// All new topics share one generic screen (#quiz-screen, #quiz-display,
// #quiz-choices, #quiz-progress-row in index.html) since only one quiz
// runs at a time — no per-topic screen markup needed.
//
// cfg shape:
// {
//   total:         10,
//   labelNoun:     'Question',             // "Question 1 of 10"
//   modeKey:       'math-place-value-2nd', // stored in global `mode`
//   generateQuestion: () => ({ ...question data..., choices: [...] }),
//   render:        (question, onAnswer) => { /* writes #quiz-display/#quiz-choices, wires onAnswer(choice) */ },
//   isCorrect:     (question, choice) => boolean,
//   resultEmoji:   '🏆',
//   resultTitle:   'Math Star!',
//   resultColor:   '#a855f7',
// }

let currentQuiz = null;

function createQuiz(cfg) {
  const total = cfg.total || 10;
  let done = 0;
  let question = 0;
  let attempts = [];
  let currentAttempts = 0;
  let currentQuestion = null;

  function buildDots() {
    const row = document.getElementById('quiz-progress-row');
    row.innerHTML = Array.from({ length: total }, (_, i) =>
      `<div class="dot" id="qd${i}"></div>`
    ).join('');
    updateDots();
  }

  function updateDots() {
    for (let i = 0; i < total; i++) {
      const d = document.getElementById(`qd${i}`);
      if (!d) return;
      if (i < done)        d.className = 'dot ' + (attempts[i] === 0 ? 'done' : 'wrong');
      else if (i === done) d.className = 'dot current';
      else                 d.className = 'dot';
    }
  }

  function nextQuestion() {
    currentAttempts = 0;
    question++;
    document.getElementById('quiz-label').textContent = `${cfg.labelNoun} ${question} of ${total}`;
    currentQuestion = cfg.generateQuestion();
    cfg.render(currentQuestion, checkAnswer);
  }

  function checkAnswer(choice) {
    if (cfg.isCorrect(currentQuestion, choice)) {
      attempts.push(currentAttempts);
      done++;
      updateDots();
      playSound('win');
      launchConfetti();
      document.querySelectorAll('#quiz-choices button').forEach(b => { b.disabled = true; });
      if (done >= total) {
        setTimeout(showComplete, 900);
      } else {
        setTimeout(nextQuestion, 1100);
      }
    } else {
      currentAttempts++;
      playSound('error');
      const display = document.getElementById('quiz-display');
      if (display) {
        display.classList.remove('shake');
        void display.offsetWidth;
        display.classList.add('shake');
        display.addEventListener('animationend', () => display.classList.remove('shake'), { once: true });
      }
    }
  }

  function showComplete() {
    const firstTry = attempts.filter(a => a === 0).length;
    const stars = firstTry >= total             ? 5
                : firstTry >= Math.ceil(total * 0.8) ? 4
                : firstTry >= Math.ceil(total * 0.6) ? 3
                : firstTry >= Math.ceil(total * 0.4) ? 2
                : 1;
    const subText = firstTry === total
      ? `Perfect! All ${total} on the first try! 🎊`
      : `${firstTry} out of ${total} on your first try!`;

    document.getElementById('r-emoji').textContent       = cfg.resultEmoji;
    document.getElementById('r-msg').textContent         = cfg.resultTitle;
    document.getElementById('r-msg').style.color         = cfg.resultColor;
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

  const controller = {
    start() {
      mode = cfg.modeKey;
      done = 0;
      question = 0;
      attempts = [];
      currentAttempts = 0;
      currentQuiz = controller;

      document.querySelectorAll('.screen.active').forEach(el => el.classList.remove('active'));
      document.getElementById('quiz-screen').classList.add('active');

      buildDots();
      nextQuestion();
    },
  };
  return controller;
}

// ── SHARED HELPERS ────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Draws an item from `pool` avoiding recent repeats tracked in `used`
// (mutated in place), the same no-immediate-repeat pattern js/sight.js
// used locally — generalized here for any topic with a small content pool.
function pickFromPool(pool, used) {
  const available = pool.filter(item => !used.includes(item));
  const item = available.length
    ? available[Math.floor(Math.random() * available.length)]
    : pool[Math.floor(Math.random() * pool.length)];
  used.push(item);
  if (used.length > Math.min(pool.length, 8)) used.shift();
  return item;
}

// ── SHARED RENDER HELPERS ────────────────────────────────────────
// Pill-shaped answer buttons for numeric/equation-style questions
// (reuses .math-choices/.choice-btn, the look of the existing math quiz).
function renderChoiceGrid(choices, onAnswer, formatLabel) {
  const container = document.getElementById('quiz-choices');
  container.className = 'math-choices';
  const colors = ['yellow', 'blue', 'green', 'purple'];
  const shuffled = [...colors].sort(() => Math.random() - 0.5);
  container.innerHTML = choices.map((c, i) =>
    `<button class="btn choice-btn ${shuffled[i]}">${formatLabel ? formatLabel(c) : c}</button>`
  ).join('');
  [...container.querySelectorAll('.choice-btn')].forEach((btn, i) => {
    btn.onclick = () => onAnswer(choices[i]);
  });
}

// 2-column word/text cards (reuses .sight-grid/.sight-card) for
// reading topics — sight words, vocabulary, phonics.
function renderCardGrid(choices, onAnswer, formatLabel) {
  const container = document.getElementById('quiz-choices');
  container.className = 'sight-grid';
  container.innerHTML = choices.map((c, i) =>
    `<button class="sight-card">${formatLabel ? formatLabel(c) : c}</button>`
  ).join('');
  [...container.querySelectorAll('.sight-card')].forEach((btn, i) => {
    btn.onclick = () => onAnswer(choices[i]);
  });
}
