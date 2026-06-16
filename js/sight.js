'use strict';

// ── SIGHT WORDS MODE (KG) ────────────────────────────────────
// Word list now sourced from the shared SIGHT_WORDS_BY_GRADE registry
// (js/content/reading-topics.js) so KG and the 1st-3rd topic-select
// flow share one source of truth, even though this KG flow/screen
// itself is otherwise unchanged.
const SIGHT_WORDS = SIGHT_WORDS_BY_GRADE.kg;

const SIGHT_TOTAL = 10;
let sightDone            = 0;
let sightQuestion        = 0;
let currentWord          = null;
let sightUsed            = [];
let sightAttempts        = []; // wrong-answer count per question
let sightCurrentAttempts = 0;

function startSight() {
  mode          = 'sight';
  sightDone            = 0;
  sightQuestion        = 0;
  sightUsed            = [];
  sightAttempts        = [];
  sightCurrentAttempts = 0;

  document.getElementById('welcome').classList.remove('active');
  document.getElementById('sight-screen').classList.add('active');

  buildSightDots();
  nextSightWord();
}

function nextSightWord() {
  sightQuestion++;
  sightCurrentAttempts = 0;
  document.getElementById('sight-label').textContent = `Word ${sightQuestion} of ${SIGHT_TOTAL}`;

  const available = SIGHT_WORDS.filter(w => !sightUsed.includes(w));
  currentWord = available[Math.floor(Math.random() * available.length)];
  sightUsed.push(currentWord);
  if (sightUsed.length > 20) sightUsed.shift();

  renderSightChoices();
  setTimeout(() => speakWord(currentWord), 500);
}

function renderSightChoices() {
  const others = SIGHT_WORDS.filter(w => w !== currentWord);
  const wrongs = [];
  while (wrongs.length < 3) {
    const w = others[Math.floor(Math.random() * others.length)];
    if (!wrongs.includes(w)) wrongs.push(w);
  }

  const choices = [currentWord, ...wrongs].sort(() => Math.random() - 0.5);
  document.getElementById('sight-grid').innerHTML = choices.map(w =>
    `<button class="sight-card" onclick="checkSightAnswer('${w}')">${w}</button>`
  ).join('');
}

function checkSightAnswer(word) {
  const cards = document.querySelectorAll('.sight-card');

  if (word === currentWord) {
    cards.forEach(c => {
      c.disabled = true;
      if (c.textContent.trim() === word) c.classList.add('correct');
    });
    sightAttempts.push(sightCurrentAttempts);
    sightDone++;
    updateSightDots();
    playSound('win');
    launchConfetti();

    if (sightDone >= SIGHT_TOTAL) {
      setTimeout(showSightComplete, 900);
    } else {
      setTimeout(nextSightWord, 1200);
    }
  } else {
    sightCurrentAttempts++;
    playSound('error');
    cards.forEach(c => {
      if (c.textContent.trim() !== word) return;
      c.style.background  = '#fee2e2';
      c.style.borderColor = '#f87171';
      c.style.color       = '#dc2626';
      c.style.animation   = 'sightShake 0.45s ease-in-out';
      c.addEventListener('animationend', () => {
        c.style.background  = '';
        c.style.borderColor = '';
        c.style.color       = '';
        c.style.animation   = '';
      }, { once: true });
    });
  }
}

function showSightComplete() {
  const firstTry = sightAttempts.filter(a => a === 0).length;
  const stars = firstTry >= 10 ? 5
              : firstTry >= 8  ? 4
              : firstTry >= 6  ? 3
              : firstTry >= 4  ? 2
              : 1;
  const subText = firstTry === SIGHT_TOTAL
    ? `Perfect! All ${SIGHT_TOTAL} words on the first try! 🎊`
    : `${firstTry} out of ${SIGHT_TOTAL} on your first try!`;

  document.getElementById('r-emoji').textContent       = '📚';
  document.getElementById('r-msg').textContent         = 'Word Star!';
  document.getElementById('r-msg').style.color         = '#db2777';
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

function buildSightDots() {
  const row = document.getElementById('sight-progress-row');
  row.innerHTML = Array.from({ length: SIGHT_TOTAL }, (_, i) =>
    `<div class="dot" id="sd${i}"></div>`
  ).join('');
  updateSightDots();
}

function updateSightDots() {
  for (let i = 0; i < SIGHT_TOTAL; i++) {
    const d = document.getElementById(`sd${i}`);
    if (!d) return;
    if (i < sightDone)        d.className = sightAttempts[i] === 0 ? 'dot done' : 'dot wrong';
    else if (i === sightDone) d.className = 'dot current';
    else                      d.className = 'dot';
  }
}
