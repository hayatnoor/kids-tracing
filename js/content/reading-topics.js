'use strict';

// ── READING TOPIC CONTENT ─────────────────────────────────────────
// Pure data: leveled sight words, phonics patterns, and vocabulary per
// grade. KG keeps its existing direct Sight Words button (sourced from
// SIGHT_WORDS_BY_GRADE.kg below) — the topic-select screen below is
// only used for 1st-5th grade.

const READING_TOPIC_CATALOG = {
  '1st': ['phonics', 'sight-words', 'vocabulary'],
  '2nd': ['phonics', 'sight-words', 'vocabulary'],
  '3rd': ['phonics', 'sight-words', 'vocabulary'],
  '4th': ['vocabulary'],
  '5th': ['vocabulary'],
};

const READING_TOPIC_META = {
  'phonics':     { label: '🔤 Phonics',       color: '#0d9488', textColor: 'white' },
  'sight-words': { label: '📖 Sight Words',   color: '#ec4899', textColor: 'white' },
  'vocabulary':  { label: '💬 Vocabulary',    color: '#6366f1', textColor: 'white' },
};

const SIGHT_WORDS_BY_GRADE = {
  kg: [
    'all','am','are','at','be','but', 'is', 'for',
    'did','do','get','good','have','he','into', 'it', 'go',
    'no','now','on','our','out','ran', 'hat', 'bat', 'cat',
    'saw','say','she','so','soon','that','there','they','this',
    'too','want','was','well','went','what', 'we',
    'who','will','with','yes', 'my'
  ],
  '1st': [
    'after','again','any','as','ask','by','could','every','fly','from',
    'give','going','had','her','him','how','just','know','let','live',
    'may','of','old','once','open','over','put','round','some','stop',
    'take','think','walk','were','when',
  ],
  '2nd': [
    'always','around','because','been','before','best','both','buy',
    'call','cold','does','don\'t','fast','first','five','found','gave',
    'goes','green','its','made','many','off','or','pull','read','right',
    'sing','sit','sleep','tell','their','these','those','upon','us','use',
  ],
  '3rd': [
    'about','better','bring','carry','clean','cut','done','draw','drink',
    'eight','fall','far','full','got','grow','hold','hot','hurt','if',
    'keep','kind','laugh','light','long','much','myself','never','only',
    'own','pick','seven','shall','show','six','small','start','ten','today',
    'together','try','warm',
  ],
};

const PHONICS_BY_GRADE = {
  '1st': [
    { pattern: 'sh', match: 'ship',  distractors: ['cat', 'sun', 'log'] },
    { pattern: 'ch', match: 'chip',  distractors: ['hat', 'mop', 'pig'] },
    { pattern: 'th', match: 'thin',  distractors: ['fox', 'bug', 'wet'] },
    { pattern: 'wh', match: 'whale', distractors: ['cup', 'box', 'sit'] },
    { pattern: 'bl', match: 'blue',  distractors: ['red', 'top', 'fan'] },
    { pattern: 'cr', match: 'crab',  distractors: ['dog', 'net', 'jam'] },
    { pattern: 'st', match: 'star',  distractors: ['cow', 'pen', 'rug'] },
  ],
  '2nd': [
    { pattern: 'ai', match: 'rain', distractors: ['cup', 'dog', 'mud'] },
    { pattern: 'ee', match: 'tree', distractors: ['box', 'pan', 'lip'] },
    { pattern: 'oa', match: 'boat', distractors: ['hat', 'web', 'sun'] },
    { pattern: 'ar', match: 'star', distractors: ['pen', 'six', 'mop'] },
    { pattern: 'er', match: 'fern', distractors: ['cat', 'log', 'jet'] },
    { pattern: 'or', match: 'corn', distractors: ['bug', 'fin', 'tap'] },
  ],
  '3rd': [
    { prefix: 're',  base: 'play',  result: 'replay',  distractors: ['playre', 'playing', 'played'] },
    { prefix: 'un',  base: 'happy', result: 'unhappy', distractors: ['happyun', 'happiness', 'happily'] },
    { prefix: 'un',  base: 'lock',  result: 'unlock',  distractors: ['lockun', 'locking', 'locked'] },
    { prefix: 're',  base: 'do',    result: 'redo',    distractors: ['dore', 'doing', 'done'] },
    { suffix: 'ing', base: 'jump',  result: 'jumping', distractors: ['jumped', 'jumper', 'jumps'] },
    { suffix: 'ed',  base: 'walk',  result: 'walked',  distractors: ['walking', 'walker', 'walks'] },
    { suffix: 'ly',  base: 'quick', result: 'quickly', distractors: ['quicker', 'quickest', 'quickness'] },
  ],
};

const VOCABULARY_BY_GRADE = {
  '1st': [
    { word: 'happy',  emoji: '😀', distractorEmoji: ['😢', '😡', '😴'] },
    { word: 'sad',    emoji: '😢', distractorEmoji: ['😀', '😡', '😴'] },
    { word: 'big',    emoji: '🐘', distractorEmoji: ['🐭', '🐝', '🐜'] },
    { word: 'small',  emoji: '🐜', distractorEmoji: ['🐘', '🐳', '🦏'] },
    { word: 'fast',   emoji: '🐆', distractorEmoji: ['🐢', '🐌', '🦥'] },
    { word: 'slow',   emoji: '🐢', distractorEmoji: ['🐆', '🐇', '🐎'] },
    { word: 'hot',    emoji: '🔥', distractorEmoji: ['❄️', '💧', '🌬️'] },
    { word: 'cold',   emoji: '❄️', distractorEmoji: ['🔥', '☀️', '🌋'] },
    { word: 'sleepy', emoji: '😴', distractorEmoji: ['😀', '😢', '😡'] },
    { word: 'angry',  emoji: '😡', distractorEmoji: ['😀', '😢', '😴'] },
  ],
  '2nd': [
    { word: 'enormous',  definition: 'very big',              distractors: ['very small', 'very fast', 'very loud'] },
    { word: 'tiny',      definition: 'very small',            distractors: ['very big', 'very old', 'very wet'] },
    { word: 'exhausted', definition: 'extremely tired',       distractors: ['extremely happy', 'extremely cold', 'extremely tall'] },
    { word: 'furious',   definition: 'very angry',            distractors: ['very calm', 'very sleepy', 'very shy'] },
    { word: 'ancient',   definition: 'very old',              distractors: ['very new', 'very fast', 'very quiet'] },
    { word: 'damp',      definition: 'slightly wet',          distractors: ['completely dry', 'very hot', 'very heavy'] },
    { word: 'brave',     definition: 'not afraid of danger',  distractors: ['afraid of everything', 'very quiet', 'very tall'] },
    { word: 'gentle',    definition: 'soft and kind',         distractors: ['loud and rough', 'fast and noisy', 'cold and hard'] },
  ],
  '3rd': [
    { word: 'fortunate', definition: 'lucky',                    distractors: ['unlucky', 'angry', 'tired'] },
    { word: 'frigid',    definition: 'extremely cold',           distractors: ['extremely hot', 'extremely loud', 'extremely soft'] },
    { word: 'glimpse',   definition: 'a quick look',             distractors: ['a long nap', 'a loud noise', 'a slow walk'] },
    { word: 'reluctant', definition: 'unwilling to do something', distractors: ['eager to help', 'happy to leave', 'quick to answer'] },
    { word: 'vanish',    definition: 'disappear suddenly',       distractors: ['appear suddenly', 'grow slowly', 'shine brightly'] },
    { word: 'cautious',  definition: 'careful to avoid danger',  distractors: ['careless and quick', 'loud and proud', 'tired and slow'] },
    { word: 'ancient',   definition: 'extremely old',            distractors: ['brand new', 'very fast', 'very colorful'] },
  ],
  '4th': [
    { sentence: 'The detective examined every clue to solve the mystery.',  word: 'examined',    definition: 'looked at closely',           distractors: ['ignored', 'destroyed', 'sold'] },
    { sentence: 'Her bright idea solved the problem instantly.',            word: 'instantly',   definition: 'immediately',                 distractors: ['slowly, over years', 'never', 'accidentally'] },
    { sentence: 'The old bridge looked sturdy enough to cross.',            word: 'sturdy',      definition: 'strong and well-built',       distractors: ['weak and shaky', 'tiny and thin', 'bright and shiny'] },
    { sentence: 'The crowd grew restless waiting for the show to start.',   word: 'restless',    definition: 'unable to stay still or relaxed', distractors: ['very sleepy', 'very calm', 'very quiet'] },
    { sentence: 'He gave a brief summary of the long book.',                word: 'brief',       definition: 'short',                       distractors: ['long', 'colorful', 'boring'] },
    { sentence: 'The trail was so narrow only one hiker could pass.',       word: 'narrow',      definition: 'not wide',                    distractors: ['very wide', 'very tall', 'very steep'] },
    { sentence: 'She felt triumphant after winning the race.',             word: 'triumphant',  definition: 'feeling like a winner',       distractors: ['feeling defeated', 'feeling sleepy', 'feeling confused'] },
    { sentence: 'The plan seemed flawless until the storm hit.',           word: 'flawless',    definition: 'perfect, without mistakes',   distractors: ['full of mistakes', 'very expensive', 'very slow'] },
  ],
  '5th': [
    { sentence: 'Time heals all wounds, so try to be patient.',             word: 'Time heals all wounds',                  definition: 'painful feelings get better over time',        distractors: ['injuries never get better', 'clocks can fix anything', 'wounds always take a year to heal'] },
    { sentence: 'After studying all night, she felt confident about the test.', word: 'confident',                          definition: 'sure of yourself',                              distractors: ['worried and unsure', 'very tired', 'very bored'] },
    { sentence: 'It was raining cats and dogs during the picnic.',          word: 'raining cats and dogs',                  definition: 'raining very heavily',                          distractors: ['animals fell from the sky', 'it was sunny outside', 'it was a light drizzle'] },
    { sentence: 'The marathon runner showed incredible endurance.',         word: 'endurance',                              definition: 'the ability to keep going despite difficulty', distractors: ['the ability to run fast for a moment', 'the ability to give up easily', 'the ability to win every race'] },
    { sentence: 'Don’t count your chickens before they hatch.',        word: 'count your chickens before they hatch',  definition: 'don’t assume something will happen before it does', distractors: ['always count farm animals carefully', 'chickens cannot be trusted', 'wait exactly one week before counting'] },
    { sentence: 'The scientist’s hypothesis turned out to be accurate.', word: 'hypothesis',                            definition: 'an educated guess used to start an experiment', distractors: ['a proven scientific law', 'a type of laboratory tool', 'a final conclusion'] },
    { sentence: 'He had a chip on his shoulder after losing the game.',     word: 'a chip on his shoulder',                  definition: 'feeling resentful or easily angered',           distractors: ['carrying a snack', 'feeling very relaxed', 'wearing new clothes'] },
    { sentence: 'Reading the map carefully, she navigated through the forest.', word: 'navigated',                          definition: 'found her way',                                 distractors: ['got completely lost', 'drew a picture', 'fell asleep'] },
  ],
};
