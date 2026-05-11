// currentWord is a `let` variable in sight.js's script scope.
// Indirect eval (win.eval) resolves it through the global declarative
// environment, which is shared across all classic scripts in the page.
function getCurrentWord() {
  return cy.window().then(win => cy.wrap(win.eval('currentWord')));
}

describe('Sight Words Mode', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.contains('📖 Sight Words').click();
  });

  // ── Initial state ────────────────────────────────────────────

  it('shows "Word 1 of 10" on start', () => {
    cy.get('#sight-label').should('have.text', 'Word 1 of 10');
  });

  it('shows the Listen button', () => {
    cy.get('#sight-listen-btn').should('be.visible');
  });

  it('renders 4 word choice cards', () => {
    cy.get('#sight-grid .sight-card').should('have.length', 4);
  });

  it('creates 10 progress dots with the first marked current', () => {
    cy.get('#sight-progress-row .dot').should('have.length', 10);
    cy.get('#sight-progress-row .dot.current').should('have.length', 1);
  });

  it('every card displays a single lowercase word', () => {
    cy.get('.sight-card').each($card => {
      expect($card.text().trim()).to.match(/^[a-z]+$/);
    });
  });

  // ── Correct answer ───────────────────────────────────────────

  it('correct card receives the "correct" class', () => {
    getCurrentWord().then(word => {
      cy.contains('.sight-card', word).click();
      cy.contains('.sight-card', word).should('have.class', 'correct');
    });
  });

  it('correct card disables all cards', () => {
    getCurrentWord().then(word => {
      cy.contains('.sight-card', word).click();
      cy.get('.sight-card').each($card => {
        cy.wrap($card).should('be.disabled');
      });
    });
  });

  it('correct answer advances to Word 2 after the delay', () => {
    getCurrentWord().then(word => {
      cy.contains('.sight-card', word).click();
      cy.get('#sight-label', { timeout: 2000 }).should('have.text', 'Word 2 of 10');
    });
  });

  it('correct answer marks the first progress dot as done', () => {
    getCurrentWord().then(word => {
      cy.contains('.sight-card', word).click();
      cy.get('#sight-progress-row .dot.done').should('have.length', 1);
    });
  });

  // ── Wrong answer ─────────────────────────────────────────────

  it('wrong answer keeps the word counter at 1', () => {
    getCurrentWord().then(word => {
      cy.get('.sight-card').then($cards => {
        const wrong = [...$cards].find(c => c.textContent.trim() !== word);
        cy.wrap(wrong).click();
        cy.get('#sight-label').should('have.text', 'Word 1 of 10');
      });
    });
  });

  it('wrong answer leaves all progress dots undone', () => {
    getCurrentWord().then(word => {
      cy.get('.sight-card').then($cards => {
        const wrong = [...$cards].find(c => c.textContent.trim() !== word);
        cy.wrap(wrong).click();
        cy.get('#sight-progress-row .dot.done').should('not.exist');
      });
    });
  });

  // ── Listen button ─────────────────────────────────────────────

  it('Listen button is clickable without error', () => {
    cy.get('#sight-listen-btn').click();
    // No crash = pass; speech is already stubbed to a no-op.
    cy.get('#sight-screen').should('have.class', 'active');
  });

  // ── Game complete overlay ─────────────────────────────────────

  it('result overlay shows the book emoji and Word Star heading', () => {
    cy.window().then(win => { win.showSightComplete(); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#r-emoji').should('have.text', '📚');
    cy.get('#r-msg').should('have.text', 'Word Star!');
  });

  it('result overlay renders 5 star items', () => {
    cy.window().then(win => { win.showSightComplete(); });
    cy.get('#r-stars .star-item').should('have.length', 5);
  });

  it('Home button from result overlay returns to welcome', () => {
    cy.window().then(win => { win.showSightComplete(); });
    cy.get('#btn-try-again').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Play Again button from result overlay restarts sight words', () => {
    cy.window().then(win => { win.showSightComplete(); });
    cy.get('#btn-next').click();
    cy.get('#sight-screen').should('have.class', 'active');
    cy.get('#sight-label').should('have.text', 'Word 1 of 10');
  });
});
