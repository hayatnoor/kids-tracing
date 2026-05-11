'use strict';

'use strict';

// ── ARABIC LETTERS MODE ───────────────────────────────────────
const ARABIC_LETTERS = [
  { char: 'ا', name: 'ألف'  },
  { char: 'ب', name: 'باء'  },
  { char: 'ت', name: 'تاء'  },
  { char: 'ث', name: 'ثاء'  },
  { char: 'ج', name: 'جيم'  },
  { char: 'ح', name: 'حاء'  },
  { char: 'خ', name: 'خاء'  },
  { char: 'د', name: 'دال'  },
  { char: 'ذ', name: 'ذال'  },
  { char: 'ر', name: 'راء'  },
  { char: 'ز', name: 'زاي'  },
  { char: 'س', name: 'سين'  },
  { char: 'ش', name: 'شين'  },
  { char: 'ص', name: 'صاد'  },
  { char: 'ض', name: 'ضاد'  },
  { char: 'ط', name: 'طاء'  },
  { char: 'ظ', name: 'ظاء'  },
  { char: 'ع', name: 'عين'  },
  { char: 'غ', name: 'غين'  },
  { char: 'ف', name: 'فاء'  },
  { char: 'ق', name: 'قاف'  },
  { char: 'ك', name: 'كاف'  },
  { char: 'ل', name: 'لام'  },
  { char: 'م', name: 'ميم'  },
  { char: 'ن', name: 'نون'  },
  { char: 'ه', name: 'هاء'  },
  { char: 'و', name: 'واو'  },
  { char: 'ي', name: 'ياء'  },
];

const ARABIC_TOTAL = 10;
let arabicDone            = 0;
let arabicQuestion        = 0;
let currentArabicLetter   = null;
let arabicUsed            = [];
let arabicAttempts        = [];
let arabicCurrentAttempts = 0;

function startArabic() {
  mode                  = 'arabic';
  arabicDone            = 0;
  arabicQuestion        = 0;
  arabicUsed            = [];
  arabicAttempts        = [];
  arabicCurrentAttempts = 0;

  document.getElementById('welcome').classList.remove('active');
  document.getElementById('arabic-screen').classList.add('active');

  buildArabicDots();
  nextArabicLetter();
}

function nextArabicLetter() {
  arabicQuestion++;
  arabicCurrentAttempts = 0;
  document.getElementById('arabic-label').textContent = `Letter ${arabicQuestion} of ${ARABIC_TOTAL}`;

  const available = ARABIC_LETTERS.filter(l => !arabicUsed.includes(l.char));
  currentArabicLetter = available[Math.floor(Math.random() * available.length)];
  arabicUsed.push(currentArabicLetter.char);
  if (arabicUsed.length > 20) arabicUsed.shift();

  renderArabicChoices();
  setTimeout(() => speakArabicLetter(currentArabicLetter), 500);
}

function renderArabicChoices() {
  const others = ARABIC_LETTERS.filter(l => l.char !== currentArabicLetter.char);
  const wrongs = [];
  while (wrongs.length < 3) {
    const l = others[Math.floor(Math.random() * others.length)];
    if (!wrongs.find(w => w.char === l.char)) wrongs.push(l);
  }

  const choices = [currentArabicLetter, ...wrongs].sort(() => Math.random() - 0.5);
  document.getElementById('arabic-grid').innerHTML = choices.map(l =>
    `<button class="arabic-card" data-char="${l.char}" onclick="checkArabicAnswer(this.dataset.char)">${l.char}</button>`
  ).join('');
}

function speakArabicLetter(letter) {
  if (!window.speechSynthesis || !letter) return;
  window.speechSynthesis.cancel();

  const btn = document.getElementById('arabic-listen-btn');

  function doSpeak(voices) {
    const utt = new SpeechSynthesisUtterance(letter.name);
    utt.lang   = 'ar-SA';
    utt.rate   = 0.8;
    utt.pitch  = 1.0;
    utt.volume = 1;

    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) utt.voice = arabicVoice;

    if (btn) btn.classList.add('speaking');
    utt.onend  = () => { if (btn) btn.classList.remove('speaking'); };
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

function checkArabicAnswer(char) {
  const cards = document.querySelectorAll('.arabic-card');

  if (char === currentArabicLetter.char) {
    cards.forEach(c => {
      c.disabled = true;
      if (c.dataset.char === char) c.classList.add('correct');
    });
    arabicAttempts.push(arabicCurrentAttempts);
    arabicDone++;
    updateArabicDots();
    playSound('win');
    launchConfetti();

    if (arabicDone >= ARABIC_TOTAL) {
      setTimeout(showArabicComplete, 900);
    } else {
      setTimeout(nextArabicLetter, 1200);
    }
  } else {
    arabicCurrentAttempts++;
    playSound('error');
    cards.forEach(c => {
      if (c.dataset.char !== char) return;
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

function showArabicComplete() {
  const firstTry = arabicAttempts.filter(a => a === 0).length;
  const stars = firstTry >= 10 ? 5
              : firstTry >= 8  ? 4
              : firstTry >= 6  ? 3
              : firstTry >= 4  ? 2
              : 1;
  const subText = firstTry === ARABIC_TOTAL
    ? `Perfect! All ${ARABIC_TOTAL} letters on the first try! 🎊`
    : `${firstTry} out of ${ARABIC_TOTAL} on your first try!`;

  document.getElementById('r-emoji').textContent       = '🌙';
  document.getElementById('r-msg').textContent         = 'Arabic Star!';
  document.getElementById('r-msg').style.color         = '#059669';
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

function buildArabicDots() {
  const row = document.getElementById('arabic-progress-row');
  row.innerHTML = Array.from({ length: ARABIC_TOTAL }, (_, i) =>
    `<div class="dot" id="ad${i}"></div>`
  ).join('');
  updateArabicDots();
}

function updateArabicDots() {
  for (let i = 0; i < ARABIC_TOTAL; i++) {
    const d = document.getElementById(`ad${i}`);
    if (!d) return;
    if (i < arabicDone)        d.className = 'dot done';
    else if (i === arabicDone) d.className = 'dot current';
    else                       d.className = 'dot';
  }
}
