'use strict';

// ── MATH GENERATORS ───────────────────────────────────────────────
// One generator + render function per question type, each parameterized
// by the grade's params from MATH_PARAMS (js/content/math-topics.js).
// Generalizes the existing generateProblem/generateProblem1st pattern
// (js/math.js) across many more grades instead of one function per grade.

const COUNT_EMOJI = ['🍎', '⭐', '🐶', '🦋', '🎈', '🐠', '🍭', '🐸', '🌸', '🏀'];

function numericDistractors(answer, count, min, max) {
  const wrongs = new Set();
  let tries = 0;
  while (wrongs.size < count && tries < 80) {
    tries++;
    const d = Math.floor(Math.random() * 5) + 1;
    const w = answer + (Math.random() > 0.5 ? d : -d);
    if (w !== answer && w >= min && w <= max) wrongs.add(w);
  }
  for (let n = min; n <= max && wrongs.size < count; n++) {
    if (n !== answer) wrongs.add(n);
  }
  return [...wrongs].slice(0, count);
}

// ── Counting & number sense (1st grade) ───────────────────────────
function generateCounting(params) {
  const n = Math.floor(Math.random() * params.countMax) + 1;
  const emoji = COUNT_EMOJI[Math.floor(Math.random() * COUNT_EMOJI.length)];
  const wrongs = numericDistractors(n, 3, 1, params.countMax);
  const choices = shuffle([n, ...wrongs]);
  return { n, emoji, choices, answer: n };
}

function renderCounting(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML = `
    <div class="math-emoji-group">
      <div class="math-emoji-row">${Array(q.n).fill(`<span>${q.emoji}</span>`).join('')}</div>
    </div>
    <div class="math-equation" style="font-size:clamp(1.3rem,5vw,2rem);">How many are there?</div>`;
  renderChoiceGrid(q.choices, onAnswer);
}

// ── Place value (1st-5th: scales from 2-digit add/sub to decimals+rounding) ──
function generatePlaceValue(params) {
  if (params.rounding && Math.random() < 0.3) return generateRounding(params);
  if (params.decimals) return generateDecimalProblem(params);

  const max = params.max;
  const isAdd = Math.random() > 0.35;
  let a, b, answer, op;
  if (isAdd) {
    a = Math.floor(Math.random() * max * 0.6) + 1;
    b = Math.floor(Math.random() * (max - a)) + 1;
    answer = a + b;
    op = '+';
  } else {
    a = Math.floor(Math.random() * max) + 2;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    answer = a - b;
    op = '−';
  }
  const wrongs = numericDistractors(answer, 3, 0, max * 2);
  const choices = shuffle([answer, ...wrongs]);
  return { a, b, op, choices, answer };
}

function generateDecimalProblem(params) {
  const decimals = params.decimals;
  const scale = Math.pow(10, decimals);
  const maxUnits = 50 * scale;
  const isAdd = Math.random() > 0.35;
  let aUnits, bUnits, answerUnits, op;
  if (isAdd) {
    aUnits = Math.floor(Math.random() * maxUnits * 0.6) + 1;
    bUnits = Math.floor(Math.random() * (maxUnits - aUnits)) + 1;
    answerUnits = aUnits + bUnits;
    op = '+';
  } else {
    aUnits = Math.floor(Math.random() * maxUnits) + 2;
    bUnits = Math.floor(Math.random() * (aUnits - 1)) + 1;
    answerUnits = aUnits - bUnits;
    op = '−';
  }
  const toStr = u => (u / scale).toFixed(decimals);
  const wrongUnits = numericDistractors(answerUnits, 3, 0, maxUnits * 2);
  const choices = shuffle([answerUnits, ...wrongUnits]).map(toStr);
  return { a: toStr(aUnits), b: toStr(bUnits), op, choices, answer: toStr(answerUnits) };
}

function generateRounding(params) {
  const decimals = params.decimals;
  const extraScale = Math.pow(10, decimals + 1);
  const raw = Math.floor(Math.random() * 50 * extraScale) + 1;
  const value = raw / extraScale;
  const roundedScale = Math.pow(10, decimals);
  const answerUnits = Math.round(value * roundedScale);
  const placeName = decimals === 1 ? 'tenth' : decimals === 2 ? 'hundredth' : 'thousandth';
  const valueStr = value.toFixed(decimals + 1);
  const wrongUnits = numericDistractors(answerUnits, 3, 0, 50 * roundedScale + 10);
  const choices = shuffle([answerUnits, ...wrongUnits]).map(u => (u / roundedScale).toFixed(decimals));
  return { rounding: true, value: valueStr, placeName, choices, answer: (answerUnits / roundedScale).toFixed(decimals) };
}

function renderPlaceValue(q, onAnswer) {
  const display = document.getElementById('quiz-display');
  if (q.rounding) {
    display.innerHTML = `<div class="math-equation" style="font-size:clamp(1.1rem,4vw,1.6rem);">Round ${q.value} to the nearest ${q.placeName}</div>`;
  } else {
    display.innerHTML = `<div class="math-equation">${q.a} ${q.op} ${q.b} = ?</div>`;
  }
  renderChoiceGrid(q.choices, onAnswer);
}

// ── Skip counting / multiplication & division (2nd-5th) ───────────
function generateSkipSequence(params) {
  const step = params.steps[Math.floor(Math.random() * params.steps.length)];
  const startN = Math.floor(Math.random() * 6) + 1;
  const seq = [0, 1, 2, 3].map(i => step * (startN + i));
  const answer = seq[3];
  const wrongs = numericDistractors(answer, 3, 0, step * 30);
  const choices = shuffle([answer, ...wrongs]);
  return { kind: 'skip', shown: seq.slice(0, 3), choices, answer };
}

function generateMultiplyFact(params) {
  if (params.multiDigit && Math.random() > 0.4) {
    const a = Math.floor(Math.random() * 79) + 11;
    const b = Math.floor(Math.random() * 8) + 2;
    const answer = a * b;
    const wrongs = numericDistractors(answer, 3, 0, answer * 2 + 20);
    const choices = shuffle([answer, ...wrongs]);
    return { kind: 'multiply', a, b, choices, answer };
  }

  const a = Math.floor(Math.random() * params.factorMax) + 1;
  const b = Math.floor(Math.random() * params.factorMax) + 1;
  if (params.includeDivision && Math.random() > 0.5) {
    const wrongs = numericDistractors(b, 3, 1, params.factorMax + 5);
    const choices = shuffle([b, ...wrongs]);
    return { kind: 'divide', a: a * b, b: a, choices, answer: b };
  }

  const answer = a * b;
  const wrongs = numericDistractors(answer, 3, 0, params.factorMax * params.factorMax * 2 + 10);
  const choices = shuffle([answer, ...wrongs]);
  return { kind: 'multiply', a, b, choices, answer };
}

function generateSkipMultiply(params) {
  if (params.kind === 'skip') return generateSkipSequence(params);
  if (params.kind === 'mixed') return Math.random() > 0.5 ? generateSkipSequence(params) : generateMultiplyFact(params);
  return generateMultiplyFact(params);
}

function renderSkipMultiply(q, onAnswer) {
  const display = document.getElementById('quiz-display');
  if (q.kind === 'skip') {
    display.innerHTML = `<div class="math-equation" style="font-size:clamp(1.8rem,7vw,3rem);">${q.shown.join(', ')}, ?</div>`;
  } else if (q.kind === 'divide') {
    display.innerHTML = `<div class="math-equation">${q.a} ÷ ${q.b} = ?</div>`;
  } else {
    display.innerHTML = `<div class="math-equation">${q.a} × ${q.b} = ?</div>`;
  }
  renderChoiceGrid(q.choices, onAnswer);
}

// ── Time (2nd-5th: clock-reading, then elapsed-time word problems) ──
function formatTime(hour, minute) {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function clockSVG(hour, minute) {
  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const tip = (len, angle) => ({
    x: 50 + len * Math.sin(angle * Math.PI / 180),
    y: 50 - len * Math.cos(angle * Math.PI / 180),
  });
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const outer = tip(42, angle);
    const inner = tip(36, angle);
    return `<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="#1e293b" stroke-width="2"/>`;
  }).join('');
  const hourTip = tip(24, hourAngle);
  const minuteTip = tip(36, minuteAngle);
  return `
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="white" stroke="#1e293b" stroke-width="3"/>
      ${ticks}
      <line x1="50" y1="50" x2="${hourTip.x}" y2="${hourTip.y}" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="${minuteTip.x}" y2="${minuteTip.y}" stroke="#0d9488" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="#1e293b"/>
    </svg>`;
}

function randomWrongTimes(answer, count, minuteOptions) {
  const wrongs = new Set();
  let tries = 0;
  while (wrongs.size < count && tries < 50) {
    tries++;
    const h = Math.floor(Math.random() * 12) + 1;
    const m = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
    const t = formatTime(h, m);
    if (t !== answer) wrongs.add(t);
  }
  return [...wrongs];
}

function generateTime(params) {
  if (params.granularity === 'half-hour' || params.granularity === 'five-minute') {
    const hour = Math.floor(Math.random() * 12) + 1;
    const minuteOptions = params.granularity === 'half-hour'
      ? [0, 30]
      : Array.from({ length: 12 }, (_, i) => i * 5);
    const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
    const answer = formatTime(hour, minute);
    const choices = shuffle([answer, ...randomWrongTimes(answer, 3, minuteOptions)]);
    return { kind: 'read-clock', hour, minute, choices, answer };
  }

  const minuteOptions = [0, 15, 30, 45];
  const startHour = Math.floor(Math.random() * 12) + 1;
  const startMinute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  const durationMinutes = (Math.floor(Math.random() * 8) + 1) * 15;
  const totalMinutes = startHour * 60 + startMinute + durationMinutes;
  const endHour = Math.floor((totalMinutes / 60) % 12) || 12;
  const endMinute = totalMinutes % 60;
  const answer = formatTime(endHour, endMinute);
  const choices = shuffle([answer, ...randomWrongTimes(answer, 3, minuteOptions)]);
  return { kind: 'elapsed', startHour, startMinute, durationMinutes, choices, answer };
}

function renderTime(q, onAnswer) {
  const display = document.getElementById('quiz-display');
  if (q.kind === 'read-clock') {
    display.innerHTML = `
      <div class="shapes-big-svg">${clockSVG(q.hour, q.minute)}</div>
      <div class="math-equation" style="font-size:clamp(1.1rem,4vw,1.6rem);">What time is it?</div>`;
  } else {
    display.innerHTML = `<div class="math-equation" style="font-size:clamp(1rem,3.5vw,1.4rem);line-height:1.4;">It is ${formatTime(q.startHour, q.startMinute)}.<br>What time will it be in ${q.durationMinutes} minutes?</div>`;
  }
  renderChoiceGrid(q.choices, onAnswer);
}

// ── Money (2nd-5th: coin counting, then making-change word problems) ──
const COINS = [
  { name: 'quarter', value: 25, label: '25¢' },
  { name: 'dime',    value: 10, label: '10¢' },
  { name: 'nickel',  value: 5,  label: '5¢' },
  { name: 'penny',   value: 1,  label: '1¢' },
];

function formatCents(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function centsDistractors(answer, count, maxCents) {
  const wrongs = new Set();
  let tries = 0;
  while (wrongs.size < count && tries < 80) {
    tries++;
    const d = (Math.floor(Math.random() * 5) + 1) * 5;
    const w = answer + (Math.random() > 0.5 ? d : -d);
    if (w !== answer && w >= 0 && w <= maxCents * 1.5) wrongs.add(w);
  }
  for (let n = 0; n <= maxCents && wrongs.size < count; n += 5) {
    if (n !== answer) wrongs.add(n);
  }
  return [...wrongs].slice(0, count);
}

function generateMoney(params) {
  if (!params.makingChange) {
    let remaining = Math.floor(Math.random() * (params.maxCents - 10)) + 10;
    const picked = [];
    for (const coin of COINS) {
      while (remaining >= coin.value && picked.length < 8 && Math.random() > 0.3) {
        picked.push(coin);
        remaining -= coin.value;
      }
    }
    if (picked.length === 0) picked.push(COINS[3]);
    const total = picked.reduce((sum, c) => sum + c.value, 0);
    const answer = formatCents(total);
    const choices = shuffle([total, ...centsDistractors(total, 3, params.maxCents)]).map(formatCents);
    return { kind: 'coins', coins: picked, choices, answer };
  }

  const price = Math.floor(Math.random() * (params.maxCents * 0.6)) + 50;
  const paid = price + (Math.floor(Math.random() * 10) + 1) * 25;
  const change = paid - price;
  const answer = formatCents(change);
  const choices = shuffle([change, ...centsDistractors(change, 3, params.maxCents)]).map(formatCents);
  return { kind: 'change', price, paid, choices, answer };
}

function renderMoney(q, onAnswer) {
  const display = document.getElementById('quiz-display');
  if (q.kind === 'coins') {
    const row = q.coins.map(c => `<span class="money-coin">${c.label}</span>`).join('');
    display.innerHTML = `
      <div class="money-coin-row">${row}</div>
      <div class="math-equation" style="font-size:clamp(1.1rem,4vw,1.6rem);">How much money is this?</div>`;
  } else {
    display.innerHTML = `<div class="math-equation" style="font-size:clamp(1rem,3.5vw,1.4rem);line-height:1.4;">An item costs ${formatCents(q.price)}.<br>You pay with ${formatCents(q.paid)}.<br>How much change do you get?</div>`;
  }
  renderChoiceGrid(q.choices, onAnswer);
}

// ── Topic dispatcher ───────────────────────────────────────────────
const MATH_TOPIC_HANDLERS = {
  'counting':                     { generate: generateCounting,     render: renderCounting },
  'place-value':                  { generate: generatePlaceValue,   render: renderPlaceValue },
  'skip-counting-multiplication': { generate: generateSkipMultiply, render: renderSkipMultiply },
  'time':                         { generate: generateTime,         render: renderTime },
  'money':                        { generate: generateMoney,        render: renderMoney },
};

function startMathTopic(topicKey, grade) {
  if (topicKey === 'addition-subtraction') {
    if (grade === '1st') { startMath1st(); } else { startMath(); }
    return;
  }
  const params  = MATH_PARAMS[topicKey][grade];
  const handler = MATH_TOPIC_HANDLERS[topicKey];
  createQuiz({
    total: 10,
    labelNoun: 'Question',
    modeKey: `math-${topicKey}-${grade}`,
    generateQuestion: () => handler.generate(params),
    render: (q, onAnswer) => handler.render(q, onAnswer),
    isCorrect: (q, choice) => choice === q.answer,
    resultEmoji: '🏆',
    resultTitle: 'Math Star!',
    resultColor: '#a855f7',
  }).start();
}
