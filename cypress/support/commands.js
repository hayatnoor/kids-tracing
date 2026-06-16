// Visit the app with speech synthesis and Web Audio stubbed out so tests
// run silently without browser permission prompts or audio output.
Cypress.Commands.add('visitApp', (path = '/') => {
  cy.visit(path, {
    onBeforeLoad(win) {
      // Stub speechSynthesis. getVoices returns [] so the doSpeak path
      // (which sets utt.voice) is never reached — avoids a TypeError in Chrome
      // when assigning a plain object to SpeechSynthesisUtterance.voice.
      try {
        Object.defineProperty(win, 'speechSynthesis', {
          configurable: true,
          writable: true,
          value: {
            speak:           () => {},
            cancel:          () => {},
            getVoices:       () => [],
            onvoiceschanged: null,
          },
        });
      } catch (_) {}

      // Stub AudioContext so playSound() (oscillator-based tones) is silent.
      const silentAudioContext = function() {
        return {
          currentTime: 0,
          destination: {},
          createOscillator() {
            return { type: 'sine', frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
          },
          createGain() {
            return {
              gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
              connect() {},
            };
          },
        };
      };
      win.AudioContext = silentAudioContext;
      win.webkitAudioContext = silentAudioContext;
    },
  });
});

// Parse a math equation string such as "3 + 4 = ?" or "7 − 3 = ?"
// and return the numeric answer.
Cypress.Commands.add('mathAnswer', { prevSubject: false }, (equationText) => {
  const nums    = equationText.match(/\d+/g).map(Number);
  const answer  = equationText.includes('+') ? nums[0] + nums[1] : nums[0] - nums[1];
  return cy.wrap(answer);
});

// The app always lands on the grade picker first — every test that
// exercises a grade's content needs to pick a grade before anything
// else on screen is visible.
Cypress.Commands.add('selectGrade', (grade) => {
  cy.get('#grade-select').contains(grade).click();
});
