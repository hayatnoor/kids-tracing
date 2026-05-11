// Derive the correct answer by parsing the equation rendered in the DOM.
// Text looks like "3 + 4 = ?" (addition) or "7 − 3 = ?" (subtraction, U+2212).
function answerFromEquation(text) {
  const nums = text.match(/\d+/g).map(Number);
  return text.includes('+') ? nums[0] + nums[1] : nums[0] - nums[1];
}

describe('Math Mode', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.contains('🧮 Math').click();
  });

  // ── Initial state ────────────────────────────────────────────

  it('shows "Question 1 of 10" on start', () => {
    cy.get('#math-label').should('have.text', 'Question 1 of 10');
  });

  it('renders a valid math equation', () => {
    cy.get('.math-equation')
      .invoke('text')
      .should('match', /\d+\s*[+−]\s*\d+\s*=\s*\?/);
  });

  it('renders 4 answer buttons', () => {
    cy.get('#math-choices .choice-btn').should('have.length', 4);
  });

  it('creates 10 progress dots with the first marked current', () => {
    cy.get('#math-progress-row .dot').should('have.length', 10);
    cy.get('#math-progress-row .dot.current').should('have.length', 1);
  });

  // ── Correct answer ───────────────────────────────────────────

  it('correct answer advances the question counter to 2', () => {
    cy.get('.math-equation').invoke('text').then(text => {
      const answer = answerFromEquation(text);
      cy.contains('#math-choices .choice-btn', String(answer)).click();
      cy.get('#math-label', { timeout: 2500 }).should('have.text', 'Question 2 of 10');
    });
  });

  it('correct answer marks the first progress dot as done', () => {
    cy.get('.math-equation').invoke('text').then(text => {
      const answer = answerFromEquation(text);
      cy.contains('#math-choices .choice-btn', String(answer)).click();
      cy.get('#math-progress-row .dot.done').should('have.length', 1);
    });
  });

  it('correct answer disables all choice buttons immediately', () => {
    cy.get('.math-equation').invoke('text').then(text => {
      const answer = answerFromEquation(text);
      cy.contains('#math-choices .choice-btn', String(answer)).click();
      cy.get('#math-choices .choice-btn').each($btn => {
        cy.wrap($btn).should('be.disabled');
      });
    });
  });

  // ── Wrong answer ─────────────────────────────────────────────

  it('wrong answer keeps the question counter at 1', () => {
    cy.get('.math-equation').invoke('text').then(text => {
      const answer = answerFromEquation(text);
      cy.get('#math-choices .choice-btn').then($btns => {
        const wrong = [...$btns].find(b => Number(b.textContent.trim()) !== answer);
        cy.wrap(wrong).click();
        cy.get('#math-label').should('have.text', 'Question 1 of 10');
      });
    });
  });

  it('wrong answer leaves all progress dots undone', () => {
    cy.get('.math-equation').invoke('text').then(text => {
      const answer = answerFromEquation(text);
      cy.get('#math-choices .choice-btn').then($btns => {
        const wrong = [...$btns].find(b => Number(b.textContent.trim()) !== answer);
        cy.wrap(wrong).click();
        cy.get('#math-progress-row .dot.done').should('not.exist');
      });
    });
  });

  // ── Game complete overlay ────────────────────────────────────

  it('result overlay shows the trophy emoji and Math Star heading', () => {
    cy.window().then(win => { win.showMathComplete(); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#r-emoji').should('have.text', '🏆');
    cy.get('#r-msg').should('have.text', 'Math Star!');
  });

  it('result overlay renders exactly 5 star items', () => {
    cy.window().then(win => { win.showMathComplete(); });
    cy.get('#r-stars .star-item').should('have.length', 5);
  });

  it('result overlay shows 5 filled stars for a perfect game', () => {
    cy.window().then(win => {
      // Set mathAttempts via indirect eval which resolves let bindings
      // in the global declarative environment.
      win.eval('mathAttempts = [0,0,0,0,0,0,0,0,0,0]');
      win.showMathComplete();
    });
    cy.get('#r-stars .star-item').each($star => {
      expect($star.text()).to.equal('⭐');
    });
  });

  it('Home button from result overlay returns to welcome', () => {
    cy.window().then(win => { win.showMathComplete(); });
    cy.get('#btn-try-again').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Play Again button from result overlay restarts math from question 1', () => {
    cy.window().then(win => { win.showMathComplete(); });
    cy.get('#btn-next').click();
    cy.get('#math-screen').should('have.class', 'active');
    cy.get('#math-label').should('have.text', 'Question 1 of 10');
  });
});
