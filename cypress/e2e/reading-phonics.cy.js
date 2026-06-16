// Phonics topic: pattern-matching (1st: blends/digraphs, 2nd: vowel
// teams/r-controlled) vs. word-parts (3rd: prefixes/suffixes).

function openPhonics(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('📖 Reading').click();
  cy.get('#topic-grid').contains('🔤 Phonics').click();
}

['1st', '2nd'].forEach(grade => {
  describe(`Phonics (${grade} grade: pattern matching)`, () => {
    beforeEach(() => openPhonics(grade));

    it('shows a short letter pattern and a Hear a word button', () => {
      cy.get('.math-equation').invoke('text').should('match', /^[a-z]{2}$/);
      cy.contains('🔊 Hear a word').should('be.visible');
    });

    it('renders 4 word choice cards', () => {
      cy.get('#quiz-choices .sight-card').should('have.length', 4);
    });

    it('shows "Question 1 of 10" on start', () => {
      cy.get('#quiz-label').should('have.text', 'Question 1 of 10');
    });
  });
});

describe('Phonics (3rd grade: prefixes/suffixes)', () => {
  beforeEach(() => openPhonics('3rd'));

  it('shows a word-part equation like "un + happy = ?"', () => {
    cy.get('.math-equation').invoke('text').should('match', /\w+ \+ \w+ = \?/);
  });

  it('renders 4 word choice cards', () => {
    cy.get('#quiz-choices .sight-card').should('have.length', 4);
  });
});
