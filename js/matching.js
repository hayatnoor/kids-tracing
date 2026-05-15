'use strict';

const CARS = [
  { id: 'car',       emoji: '🚗' },
  { id: 'suv',       emoji: '🚙' },
  { id: 'taxi',      emoji: '🚕' },
  { id: 'bus',       emoji: '🚌' },
  { id: 'firetruck', emoji: '🚒' },
  { id: 'ambulance', emoji: '🚑' },
  { id: 'racecar',   emoji: '🏎️' },
  { id: 'van',       emoji: '🚐' },
  { id: 'truck',     emoji: '🚛' },
  { id: 'pickup',    emoji: '🛻' },
];

let matchingPairs     = 6;
let matchingTiles     = [];
let matchingFlipped   = [];
let matchingMatched   = 0;
let matchingLocked    = false;
let matchingMoves     = 0;
let matchingStartTime = 0;

function startMatching() {
  mode = 'matching';
  document.getElementById('welcome').classList.remove('active');
  document.getElementById('matching-size-screen').classList.add('active');
}

function startMatchingWithSize(n) {
  matchingPairs     = n / 2;
  matchingFlipped   = [];
  matchingMatched   = 0;
  matchingLocked    = false;
  matchingMoves     = 0;
  matchingStartTime = Date.now();

  document.getElementById('matching-size-screen').classList.remove('active');
  document.getElementById('matching-screen').classList.add('active');

  buildMatchingGrid();
}

function buildMatchingGrid() {
  const pool  = CARS.slice(0, matchingPairs);
  const pairs = [...pool, ...pool];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  matchingTiles = pairs.map((car, i) => ({ ...car, idx: i, matched: false, flipped: false }));

  const wide = window.innerWidth >= 900;
  const cols = wide
    ? (matchingPairs <= 4 ? 4 : matchingPairs <= 6 ? 6 : matchingPairs <= 8 ? 8 : 10)
    : (matchingPairs <= 8 ? 4 : 5);
  const grid = document.getElementById('matching-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 90px))`;
  grid.innerHTML = matchingTiles.map((tile, i) => `
    <div class="matching-tile" id="mt${i}" onclick="flipTile(${i})">
      <div class="matching-tile-inner">
        <div class="matching-tile-front">?</div>
        <div class="matching-tile-back">${tile.emoji}</div>
      </div>
    </div>
  `).join('');

  updateMatchingStats();
}

function flipTile(i) {
  const tile = matchingTiles[i];
  if (matchingLocked || tile.matched || tile.flipped) return;

  tile.flipped = true;
  document.getElementById(`mt${i}`).classList.add('flipped');
  matchingFlipped.push(i);

  if (matchingFlipped.length === 2) {
    matchingLocked = true;
    matchingMoves++;
    updateMatchingStats();
    checkMatchingPair();
  }
}

function checkMatchingPair() {
  const [a, b] = matchingFlipped;
  const tileA  = matchingTiles[a];
  const tileB  = matchingTiles[b];

  if (tileA.id === tileB.id) {
    tileA.matched = true;
    tileB.matched = true;
    document.getElementById(`mt${a}`).classList.add('matched');
    document.getElementById(`mt${b}`).classList.add('matched');
    matchingFlipped = [];
    matchingMatched++;
    matchingLocked  = false;
    playSound('win');
    updateMatchingStats();

    if (matchingMatched === matchingPairs) {
      setTimeout(showMatchingComplete, 700);
    }
  } else {
    setTimeout(() => {
      tileA.flipped = false;
      tileB.flipped = false;
      document.getElementById(`mt${a}`).classList.remove('flipped');
      document.getElementById(`mt${b}`).classList.remove('flipped');
      matchingFlipped = [];
      matchingLocked  = false;
      playSound('error');
    }, 1000);
  }
}

function updateMatchingStats() {
  document.getElementById('matching-moves').textContent = `Moves: ${matchingMoves}`;
  document.getElementById('matching-pairs').textContent = `${matchingMatched}/${matchingPairs} pairs`;
}

function showMatchingComplete() {
  const elapsed = Math.round((Date.now() - matchingStartTime) / 1000);
  const stars   = matchingMoves <= matchingPairs               ? 5
                : matchingMoves <= Math.round(matchingPairs * 1.5) ? 4
                : matchingMoves <= matchingPairs * 2           ? 3
                : matchingMoves <= matchingPairs * 3           ? 2
                : 1;

  document.getElementById('r-emoji').textContent       = '🚗';
  document.getElementById('r-msg').textContent         = 'Great Memory!';
  document.getElementById('r-msg').style.color         = '#b45309';
  document.getElementById('r-sub').textContent         = `${matchingMoves} moves · ${elapsed}s`;
  document.getElementById('btn-try-again').textContent = '🏠 Home';
  document.getElementById('btn-next').textContent      = '🔄 Play Again';

  const row = document.getElementById('r-stars');
  row.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('span');
    s.className            = 'star-item';
    s.textContent          = i < stars ? '⭐' : '☆';
    s.style.animationDelay = `${i * 0.12}s`;
    s.style.color          = i < stars ? '#facc15' : '#d1d5db';
    row.appendChild(s);
  }

  document.getElementById('result-overlay').classList.add('active');
  playSound('win');
  launchConfetti();
}
