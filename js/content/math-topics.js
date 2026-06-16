'use strict';

// ── MATH TOPIC CONTENT ───────────────────────────────────────────
// Pure data: which math topics exist at each grade (1st-5th — KG keeps
// its own untouched flow) and the difficulty parameters for each.
// addition-subtraction stays a standalone topic only at 1st grade
// (handled by the existing legacy math.js); from 2nd grade on it folds
// into the place-value topic as multi-digit add/sub with regrouping.

const MATH_TOPIC_CATALOG = {
  '1st': ['addition-subtraction', 'counting', 'place-value'],
  '2nd': ['place-value', 'skip-counting-multiplication', 'time', 'money'],
  '3rd': ['place-value', 'skip-counting-multiplication', 'time', 'money'],
  '4th': ['place-value', 'skip-counting-multiplication', 'time', 'money'],
  '5th': ['place-value', 'skip-counting-multiplication', 'time', 'money'],
};

const MATH_TOPIC_META = {
  'addition-subtraction':         { label: '➕ Addition & Subtraction', color: '#fb923c', textColor: '#7c2d12' },
  'counting':                     { label: '🔢 Counting & Numbers',    color: '#4ade80', textColor: '#14532d' },
  'place-value':                  { label: '🧱 Place Value',           color: '#60a5fa', textColor: 'white'   },
  'skip-counting-multiplication': { label: '✖️ Skip Count & Multiply', color: '#f59e0b', textColor: '#78350f' },
  'time':                         { label: '🕐 Time',                  color: '#0d9488', textColor: 'white'   },
  'money':                        { label: '💰 Money',                 color: '#ca8a04', textColor: 'white'   },
};

const MATH_PARAMS = {
  'counting': {
    '1st': { countMax: 20 },
  },
  'place-value': {
    '1st': { max: 99 },
    '2nd': { max: 999 },
    '3rd': { max: 9999 },
    '4th': { max: 9999, decimals: 2 },
    '5th': { max: 9999, decimals: 3, rounding: true },
  },
  'skip-counting-multiplication': {
    '2nd': { kind: 'skip',     steps: [2, 5, 10] },
    '3rd': { kind: 'mixed',    steps: [2, 3, 4, 5, 10], factorMax: 5 },
    '4th': { kind: 'multiply', factorMax: 10, includeDivision: true },
    '5th': { kind: 'multiply', factorMax: 12, includeDivision: true, multiDigit: true },
  },
  'time': {
    '2nd': { granularity: 'half-hour' },
    '3rd': { granularity: 'five-minute' },
    '4th': { granularity: 'elapsed' },
    '5th': { granularity: 'elapsed-word' },
  },
  'money': {
    '2nd': { maxCents: 100,  makingChange: false },
    '3rd': { maxCents: 500,  makingChange: true },
    '4th': { maxCents: 2000, makingChange: true, wordProblem: true },
    '5th': { maxCents: 5000, makingChange: true, wordProblem: true },
  },
};
