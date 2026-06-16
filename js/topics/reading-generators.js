'use strict';

// ── READING GENERATORS ────────────────────────────────────────────
// One generator + render function per question type, parameterized by
// grade-leveled content from js/content/reading-topics.js.

// ── Sight words (1st-3rd; KG uses the legacy startSight() directly) ──
function generateSightWord(words, used) {
  const word = pickFromPool(words, used);
  const others = words.filter(w => w !== word);
  const wrongs = [];
  while (wrongs.length < 3 && others.length) {
    const w = others[Math.floor(Math.random() * others.length)];
    if (!wrongs.includes(w)) wrongs.push(w);
  }
  return { word, choices: shuffle([word, ...wrongs]), answer: word };
}

function renderSightWord(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML =
    `<button class="listen-btn" onclick="speakWord('${q.word}')">🔊 Hear it again!</button>`;
  renderCardGrid(q.choices, onAnswer);
  setTimeout(() => speakWord(q.word), 400);
}

// ── Phonics ────────────────────────────────────────────────────────
function generatePhonicsPattern(list, used) {
  const item = pickFromPool(list, used);
  return { pattern: item.pattern, match: item.match, choices: shuffle([item.match, ...item.distractors]), answer: item.match };
}

function renderPhonicsPattern(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML = `
    <div class="math-equation" style="font-size:clamp(2.2rem,9vw,4rem);">${q.pattern}</div>
    <button class="listen-btn" onclick="speakWord('${q.match}')" style="margin-top:10px;">🔊 Hear a word</button>
    <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#6b7280;margin-top:8px;font-size:clamp(0.9rem,3vw,1.1rem);">Which word has this sound?</div>`;
  renderCardGrid(q.choices, onAnswer);
}

function generatePhonicsWordPart(list, used) {
  const item = pickFromPool(list, used);
  const prompt = item.prefix ? `${item.prefix} + ${item.base}` : `${item.base} + ${item.suffix}`;
  return { prompt, choices: shuffle([item.result, ...item.distractors]), answer: item.result };
}

function renderPhonicsWordPart(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML =
    `<div class="math-equation" style="font-size:clamp(1.6rem,6vw,2.6rem);">${q.prompt} = ?</div>`;
  renderCardGrid(q.choices, onAnswer);
}

function generatePhonics(grade, used) {
  return grade === '3rd' ? generatePhonicsWordPart(PHONICS_BY_GRADE['3rd'], used)
                         : generatePhonicsPattern(PHONICS_BY_GRADE[grade], used);
}

function renderPhonics(grade, q, onAnswer) {
  return grade === '3rd' ? renderPhonicsWordPart(q, onAnswer) : renderPhonicsPattern(q, onAnswer);
}

// ── Vocabulary ─────────────────────────────────────────────────────
function generateVocabEmoji(list, used) {
  const item = pickFromPool(list, used);
  return { word: item.word, choices: shuffle([item.emoji, ...item.distractorEmoji]), answer: item.emoji };
}

function renderVocabEmoji(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML =
    `<div class="math-equation" style="font-size:clamp(1.6rem,6vw,2.6rem);">${q.word}</div>`;
  renderCardGrid(q.choices, onAnswer, c => `<span style="font-size:2.2rem;">${c}</span>`);
}

function generateVocabDefinition(list, used) {
  const item = pickFromPool(list, used);
  return { word: item.word, choices: shuffle([item.definition, ...item.distractors]), answer: item.definition };
}

function renderVocabDefinition(q, onAnswer) {
  document.getElementById('quiz-display').innerHTML = `
    <div class="math-equation" style="font-size:clamp(1.6rem,6vw,2.6rem);">${q.word}</div>
    <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#6b7280;margin-top:6px;font-size:clamp(0.9rem,3vw,1.1rem);">What does this word mean?</div>`;
  renderCardGrid(q.choices, onAnswer);
}

function generateVocabContext(list, used) {
  const item = pickFromPool(list, used);
  return { sentence: item.sentence, word: item.word, choices: shuffle([item.definition, ...item.distractors]), answer: item.definition };
}

function renderVocabContext(q, onAnswer) {
  const highlighted = q.sentence.replace(q.word, `<strong>${q.word}</strong>`);
  document.getElementById('quiz-display').innerHTML = `
    <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#1e293b;font-size:clamp(1rem,3.5vw,1.3rem);line-height:1.4;">${highlighted}</div>
    <div style="font-family:'Nunito',sans-serif;font-weight:700;color:#6b7280;margin-top:10px;font-size:clamp(0.9rem,3vw,1.1rem);">What does "${q.word}" mean?</div>`;
  renderCardGrid(q.choices, onAnswer);
}

function generateVocabulary(grade, used) {
  const list = VOCABULARY_BY_GRADE[grade];
  if (grade === '1st') return generateVocabEmoji(list, used);
  if (grade === '2nd' || grade === '3rd') return generateVocabDefinition(list, used);
  return generateVocabContext(list, used);
}

function renderVocabulary(grade, q, onAnswer) {
  if (grade === '1st') return renderVocabEmoji(q, onAnswer);
  if (grade === '2nd' || grade === '3rd') return renderVocabDefinition(q, onAnswer);
  return renderVocabContext(q, onAnswer);
}

// ── Topic dispatcher ───────────────────────────────────────────────
function startReadingTopic(topicKey, grade) {
  const used = [];

  if (topicKey === 'sight-words') {
    const words = SIGHT_WORDS_BY_GRADE[grade];
    createQuiz({
      total: 10,
      labelNoun: 'Word',
      modeKey: `reading-sight-words-${grade}`,
      generateQuestion: () => generateSightWord(words, used),
      render: renderSightWord,
      isCorrect: (q, choice) => choice === q.answer,
      resultEmoji: '📚',
      resultTitle: 'Word Star!',
      resultColor: '#db2777',
    }).start();
    return;
  }

  if (topicKey === 'phonics') {
    createQuiz({
      total: 10,
      labelNoun: 'Question',
      modeKey: `reading-phonics-${grade}`,
      generateQuestion: () => generatePhonics(grade, used),
      render: (q, onAnswer) => renderPhonics(grade, q, onAnswer),
      isCorrect: (q, choice) => choice === q.answer,
      resultEmoji: '🔤',
      resultTitle: 'Phonics Star!',
      resultColor: '#0d9488',
    }).start();
    return;
  }

  createQuiz({
    total: 10,
    labelNoun: 'Word',
    modeKey: `reading-vocabulary-${grade}`,
    generateQuestion: () => generateVocabulary(grade, used),
    render: (q, onAnswer) => renderVocabulary(grade, q, onAnswer),
    isCorrect: (q, choice) => choice === q.answer,
    resultEmoji: '💬',
    resultTitle: 'Vocabulary Star!',
    resultColor: '#6366f1',
  }).start();
}
