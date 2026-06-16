// currentShape and shapesQType are `let` variables in shapes.js.
// win.eval() resolves them through the shared global declarative environment.
function getCurrentShapeName() {
  return cy.window().then(win => cy.wrap(win.eval('currentShape.name')));
}
function getCurrentShapeSides() {
  return cy.window().then(win => cy.wrap(win.eval('currentShape.sides')));
}

// Force a specific question type and re-render without changing the current shape.
function forceQType(type) {
  cy.window().then(win => {
    win.eval(`shapesQType = "${type}"`);
    win.renderShapesQuestion();
  });
}

describe('Shapes Mode', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.selectGrade('KG');
    cy.contains('🔷 Shapes').click();
  });

  // ── Initial state ─────────────────────────────────────────────

  it('shows "Shape 1 of 10" label on start', () => {
    cy.get('#shapes-label').should('have.text', 'Shape 1 of 10');
  });

  it('creates 10 progress dots with the first marked current', () => {
    cy.get('#shapes-progress-row .dot').should('have.length', 10);
    cy.get('#shapes-progress-row .dot.current').should('have.length', 1);
  });

  it('renders either a shape SVG or a listen button on start', () => {
    cy.get('#shapes-content-wrap').then($wrap => {
      const hasSVG    = $wrap.find('svg').length > 0;
      const hasListen = $wrap.find('.shapes-listen-btn').length > 0;
      expect(hasSVG || hasListen).to.be.true;
    });
  });

  // ── Sides question type ───────────────────────────────────────

  describe('sides question', () => {
    beforeEach(() => { forceQType('sides'); });

    it('shows a large shape SVG in the content area', () => {
      cy.get('#shapes-content-wrap .shapes-big-svg svg').should('exist');
    });

    it('shows the "How many sides" question text', () => {
      cy.get('#shapes-question').should('have.text', 'How many sides does this shape have?');
    });

    it('renders 4 number answer buttons', () => {
      cy.get('#shapes-grid .shapes-num-btn').should('have.length', 4);
    });

    it('every number button has a data-val attribute', () => {
      cy.get('.shapes-num-btn').each($btn => {
        expect($btn.attr('data-val')).to.match(/^\d+$/);
      });
    });

    it('correct number button receives the "correct" class', () => {
      getCurrentShapeSides().then(sides => {
        cy.get(`.shapes-num-btn[data-val="${sides}"]`).click();
        cy.get(`.shapes-num-btn[data-val="${sides}"]`).should('have.class', 'correct');
      });
    });

    it('correct answer disables all number buttons', () => {
      getCurrentShapeSides().then(sides => {
        cy.get(`.shapes-num-btn[data-val="${sides}"]`).click();
        cy.get('.shapes-num-btn').each($btn => {
          cy.wrap($btn).should('be.disabled');
        });
      });
    });

    it('correct answer advances to Shape 2', () => {
      getCurrentShapeSides().then(sides => {
        cy.get(`.shapes-num-btn[data-val="${sides}"]`).click();
        cy.get('#shapes-label', { timeout: 2500 }).should('have.text', 'Shape 2 of 10');
      });
    });

    it('correct first-try answer marks the dot green (dot.done)', () => {
      getCurrentShapeSides().then(sides => {
        cy.get(`.shapes-num-btn[data-val="${sides}"]`).click();
        cy.get('#shapes-progress-row .dot.done').should('have.length', 1);
      });
    });

    it('wrong answer keeps the label at Shape 1', () => {
      getCurrentShapeSides().then(sides => {
        cy.get('.shapes-num-btn').then($btns => {
          const wrong = [...$btns].find(b => b.dataset.val !== String(sides));
          cy.wrap(wrong).click();
          cy.get('#shapes-label').should('have.text', 'Shape 1 of 10');
        });
      });
    });

    it('wrong answer leaves all dots unscored', () => {
      getCurrentShapeSides().then(sides => {
        cy.get('.shapes-num-btn').then($btns => {
          const wrong = [...$btns].find(b => b.dataset.val !== String(sides));
          cy.wrap(wrong).click();
          cy.get('#shapes-progress-row .dot.done').should('not.exist');
          cy.get('#shapes-progress-row .dot.wrong').should('not.exist');
        });
      });
    });

    it('wrong-then-correct marks the dot red (dot.wrong), not green', () => {
      getCurrentShapeSides().then(sides => {
        cy.get('.shapes-num-btn').then($btns => {
          const wrong = [...$btns].find(b => b.dataset.val !== String(sides));
          cy.wrap(wrong).click();
          cy.get(`.shapes-num-btn[data-val="${sides}"]`).click();
          cy.get('#shapes-progress-row .dot.wrong').should('have.length', 1);
          cy.get('#shapes-progress-row .dot.done').should('not.exist');
        });
      });
    });
  });

  // ── Listen question type ──────────────────────────────────────

  describe('listen question', () => {
    beforeEach(() => { forceQType('listen'); });

    it('shows the listen button', () => {
      cy.get('#shapes-listen-btn').should('be.visible');
    });

    it('listen button is clickable without error', () => {
      cy.get('#shapes-listen-btn').click();
      cy.get('#shapes-screen').should('have.class', 'active');
    });

    it('shows the "Which shape is it?" question text', () => {
      cy.get('#shapes-question').should('have.text', 'Which shape is it?');
    });

    it('renders 4 shape cards', () => {
      cy.get('#shapes-grid .shapes-card').should('have.length', 4);
    });

    it('every shape card has a data-name attribute', () => {
      cy.get('.shapes-card').each($card => {
        expect($card.attr('data-name')).to.match(/^[a-z]+$/);
      });
    });

    it('every shape card contains an SVG', () => {
      cy.get('.shapes-card').each($card => {
        expect($card.find('svg').length).to.equal(1);
      });
    });

    it('correct shape card receives the "correct" class', () => {
      getCurrentShapeName().then(name => {
        cy.get(`.shapes-card[data-name="${name}"]`).click();
        cy.get(`.shapes-card[data-name="${name}"]`).should('have.class', 'correct');
      });
    });

    it('correct answer disables all shape cards', () => {
      getCurrentShapeName().then(name => {
        cy.get(`.shapes-card[data-name="${name}"]`).click();
        cy.get('.shapes-card').each($card => {
          cy.wrap($card).should('be.disabled');
        });
      });
    });

    it('correct answer advances to Shape 2', () => {
      getCurrentShapeName().then(name => {
        cy.get(`.shapes-card[data-name="${name}"]`).click();
        cy.get('#shapes-label', { timeout: 2500 }).should('have.text', 'Shape 2 of 10');
      });
    });

    it('correct first-try answer marks the dot green (dot.done)', () => {
      getCurrentShapeName().then(name => {
        cy.get(`.shapes-card[data-name="${name}"]`).click();
        cy.get('#shapes-progress-row .dot.done').should('have.length', 1);
      });
    });

    it('wrong answer keeps the label at Shape 1', () => {
      getCurrentShapeName().then(name => {
        cy.get('.shapes-card').then($cards => {
          const wrong = [...$cards].find(c => c.dataset.name !== name);
          cy.wrap(wrong).click();
          cy.get('#shapes-label').should('have.text', 'Shape 1 of 10');
        });
      });
    });

    it('wrong answer leaves all dots unscored', () => {
      getCurrentShapeName().then(name => {
        cy.get('.shapes-card').then($cards => {
          const wrong = [...$cards].find(c => c.dataset.name !== name);
          cy.wrap(wrong).click();
          cy.get('#shapes-progress-row .dot.done').should('not.exist');
          cy.get('#shapes-progress-row .dot.wrong').should('not.exist');
        });
      });
    });

    it('wrong-then-correct marks the dot red (dot.wrong), not green', () => {
      getCurrentShapeName().then(name => {
        cy.get('.shapes-card').then($cards => {
          const wrong = [...$cards].find(c => c.dataset.name !== name);
          cy.wrap(wrong).click();
          cy.get(`.shapes-card[data-name="${name}"]`).click();
          cy.get('#shapes-progress-row .dot.wrong').should('have.length', 1);
          cy.get('#shapes-progress-row .dot.done').should('not.exist');
        });
      });
    });
  });

  // ── Result overlay ────────────────────────────────────────────

  it('result overlay shows the diamond emoji and Shape Star heading', () => {
    cy.window().then(win => { win.showShapesComplete(); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#r-emoji').should('have.text', '🔷');
    cy.get('#r-msg').should('have.text', 'Shape Star!');
  });

  it('result overlay renders 5 star items', () => {
    cy.window().then(win => { win.showShapesComplete(); });
    cy.get('#r-stars .star-item').should('have.length', 5);
  });

  it('result overlay shows 5 filled stars for a perfect game', () => {
    cy.window().then(win => {
      win.eval('shapesAttempts = [0,0,0,0,0,0,0,0,0,0]');
      win.showShapesComplete();
    });
    cy.get('#r-stars .star-item').each($star => {
      expect($star.text()).to.equal('⭐');
    });
  });

  it('Home button from result overlay returns to welcome', () => {
    cy.window().then(win => { win.showShapesComplete(); });
    cy.get('#btn-try-again').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Play Again button from result overlay restarts shapes from Shape 1', () => {
    cy.window().then(win => { win.showShapesComplete(); });
    cy.get('#btn-next').click();
    cy.get('#shapes-screen').should('have.class', 'active');
    cy.get('#shapes-label').should('have.text', 'Shape 1 of 10');
  });
});
