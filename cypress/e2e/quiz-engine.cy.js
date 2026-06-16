// Engine-level behavior (dots, star thresholds, wrong-answer shake, result
// overlay) tested once against a representative topic (1st grade Counting)
// so individual topic specs don't need to re-test the same mechanics.

function correctChoice() {
  return cy.get('#quiz-display .math-emoji-row span').then($emoji => $emoji.length);
}

function answerCorrectly() {
  correctChoice().then(n => {
    cy.contains('#quiz-choices button', String(n)).click();
  });
}

function completeQuiz() {
  for (let i = 0; i < 10; i++) {
    answerCorrectly();
    cy.wait(1200);
  }
}

describe('Shared Quiz Engine (via 1st grade Counting)', () => {
  beforeEach(() => {
    cy.visitApp('/');
    cy.selectGrade('1st');
    cy.get('.screen.active').contains('🧮 Math').click();
    cy.get('#topic-grid').contains('🔢 Counting & Numbers').click();
  });

  it('shows "Question 1 of 10" on start', () => {
    cy.get('#quiz-label').should('have.text', 'Question 1 of 10');
  });

  it('renders 4 answer choices', () => {
    cy.get('#quiz-choices button').should('have.length', 4);
  });

  it('creates 10 progress dots with the first marked current', () => {
    cy.get('#quiz-progress-row .dot').should('have.length', 10);
    cy.get('#quiz-progress-row .dot.current').should('have.length', 1);
  });

  it('a choice matching the emoji count exists among the 4 options', () => {
    correctChoice().then(n => {
      cy.get('#quiz-choices button').then($btns => {
        const match = [...$btns].some(b => Number(b.textContent.trim()) === n);
        expect(match).to.be.true;
      });
    });
  });

  it('the correct answer advances to question 2 and marks the first dot done', () => {
    answerCorrectly();
    cy.get('#quiz-label', { timeout: 2500 }).should('have.text', 'Question 2 of 10');
    cy.get('#quiz-progress-row .dot.done').should('have.length', 1);
  });

  it('a wrong answer leaves the dot undone and keeps the question counter', () => {
    correctChoice().then(n => {
      cy.get('#quiz-choices button').then($btns => {
        const wrong = [...$btns].find(b => Number(b.textContent.trim()) !== n);
        cy.wrap(wrong).click();
        cy.get('#quiz-label').should('have.text', 'Question 1 of 10');
        cy.get('#quiz-progress-row .dot.done').should('not.exist');
      });
    });
  });

  it('wrong-then-correct marks the dot red (dot.wrong), not green', () => {
    correctChoice().then(n => {
      cy.get('#quiz-choices button').then($btns => {
        const wrong = [...$btns].find(b => Number(b.textContent.trim()) !== n);
        cy.wrap(wrong).click();
        answerCorrectly();
        cy.get('#quiz-progress-row .dot.wrong').should('have.length', 1);
        cy.get('#quiz-progress-row .dot.done').should('not.exist');
      });
    });
  });

  it('completing all 10 questions on the first try shows 5 stars', () => {
    completeQuiz();
    cy.get('#result-overlay', { timeout: 3000 }).should('have.class', 'active');
    cy.get('#r-emoji').should('have.text', '🏆');
    cy.get('#r-msg').should('have.text', 'Math Star!');
    cy.get('#r-stars .star-item').should('have.length', 5);
    cy.get('#r-stars .star-item').each($star => {
      expect($star.text()).to.equal('⭐');
    });
  });

  it('Home button from result overlay returns to the grade home screen', () => {
    completeQuiz();
    cy.get('#result-overlay', { timeout: 3000 }).should('have.class', 'active');
    cy.get('#btn-try-again').click();
    cy.get('#grade-1-screen').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Play Again button from result overlay restarts the quiz at question 1', () => {
    completeQuiz();
    cy.get('#result-overlay', { timeout: 3000 }).should('have.class', 'active');
    cy.get('#btn-next').click();
    cy.get('#quiz-screen').should('have.class', 'active');
    cy.get('#quiz-label').should('have.text', 'Question 1 of 10');
  });
});
