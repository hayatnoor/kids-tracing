// currentArabicLetter is a `let` variable in arabic.js's script scope.
// Indirect eval resolves it through the shared global declarative environment.
function getCurrentChar() {
  return cy.window().then(win => cy.wrap(win.eval('currentArabicLetter.char')));
}

describe('Arabic Letters Mode', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.contains('🌙 Arabic').click();
  });

  // ── Initial state ────────────────────────────────────────────

  it('shows "Letter 1 of 10" on start', () => {
    cy.get('#arabic-label').should('have.text', 'Letter 1 of 10');
  });

  it('shows the Listen button', () => {
    cy.get('#arabic-listen-btn').should('be.visible');
  });

  it('renders 4 Arabic letter cards', () => {
    cy.get('#arabic-grid .arabic-card').should('have.length', 4);
  });

  it('creates 10 progress dots with the first marked current', () => {
    cy.get('#arabic-progress-row .dot').should('have.length', 10);
    cy.get('#arabic-progress-row .dot.current').should('have.length', 1);
  });

  it('every card carries a data-char attribute', () => {
    cy.get('.arabic-card').each($card => {
      expect($card.attr('data-char')).to.match(/\S/);
    });
  });

  // ── Correct answer ───────────────────────────────────────────

  it('correct card receives the "correct" class', () => {
    getCurrentChar().then(char => {
      cy.get(`.arabic-card[data-char="${char}"]`).click();
      cy.get(`.arabic-card[data-char="${char}"]`).should('have.class', 'correct');
    });
  });

  it('correct card disables all cards', () => {
    getCurrentChar().then(char => {
      cy.get(`.arabic-card[data-char="${char}"]`).click();
      cy.get('.arabic-card').each($card => {
        cy.wrap($card).should('be.disabled');
      });
    });
  });

  it('correct answer advances to Letter 2 after the delay', () => {
    getCurrentChar().then(char => {
      cy.get(`.arabic-card[data-char="${char}"]`).click();
      cy.get('#arabic-label', { timeout: 2000 }).should('have.text', 'Letter 2 of 10');
    });
  });

  it('correct answer marks the first progress dot as done', () => {
    getCurrentChar().then(char => {
      cy.get(`.arabic-card[data-char="${char}"]`).click();
      cy.get('#arabic-progress-row .dot.done').should('have.length', 1);
    });
  });

  // ── Wrong answer ─────────────────────────────────────────────

  it('wrong answer keeps the letter counter at 1', () => {
    getCurrentChar().then(char => {
      cy.get('.arabic-card').then($cards => {
        const wrong = [...$cards].find(c => c.dataset.char !== char);
        cy.wrap(wrong).click();
        cy.get('#arabic-label').should('have.text', 'Letter 1 of 10');
      });
    });
  });

  it('wrong answer leaves all progress dots undone', () => {
    getCurrentChar().then(char => {
      cy.get('.arabic-card').then($cards => {
        const wrong = [...$cards].find(c => c.dataset.char !== char);
        cy.wrap(wrong).click();
        cy.get('#arabic-progress-row .dot.done').should('not.exist');
      });
    });
  });

  it('wrong-then-correct marks the dot red (dot.wrong), not green', () => {
    getCurrentChar().then(char => {
      cy.get('.arabic-card').then($cards => {
        const wrong = [...$cards].find(c => c.dataset.char !== char);
        cy.wrap(wrong).click();
        cy.get(`.arabic-card[data-char="${char}"]`).click();
        cy.get('#arabic-progress-row .dot.wrong').should('have.length', 1);
        cy.get('#arabic-progress-row .dot.done').should('not.exist');
      });
    });
  });

  // ── Listen button ─────────────────────────────────────────────

  it('Listen button is clickable without error', () => {
    cy.get('#arabic-listen-btn').click();
    cy.get('#arabic-screen').should('have.class', 'active');
  });

  // ── Game complete overlay ─────────────────────────────────────

  it('result overlay shows the moon emoji and Arabic Star heading', () => {
    cy.window().then(win => { win.showArabicComplete(); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#r-emoji').should('have.text', '🌙');
    cy.get('#r-msg').should('have.text', 'Arabic Star!');
  });

  it('result overlay renders 5 star items', () => {
    cy.window().then(win => { win.showArabicComplete(); });
    cy.get('#r-stars .star-item').should('have.length', 5);
  });

  it('Home button from result overlay returns to welcome', () => {
    cy.window().then(win => { win.showArabicComplete(); });
    cy.get('#btn-try-again').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Play Again button from result overlay restarts arabic', () => {
    cy.window().then(win => { win.showArabicComplete(); });
    cy.get('#btn-next').click();
    cy.get('#arabic-screen').should('have.class', 'active');
    cy.get('#arabic-label').should('have.text', 'Letter 1 of 10');
  });
});
