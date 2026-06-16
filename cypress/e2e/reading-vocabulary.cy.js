// Vocabulary topic: word-to-emoji matching (1st), word-to-definition
// matching (2nd-3rd), sentence context-clues (4th-5th).

function openVocabulary(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('📖 Reading').click();
  cy.get('#topic-grid').contains('💬 Vocabulary').click();
}

describe('Vocabulary (1st grade: word-to-emoji matching)', () => {
  beforeEach(() => openVocabulary('1st'));

  it('shows a word and 4 emoji choice cards', () => {
    cy.get('.math-equation').invoke('text').should('match', /^[a-z]+$/);
    cy.get('#quiz-choices .sight-card').should('have.length', 4);
  });
});

['2nd', '3rd'].forEach(grade => {
  describe(`Vocabulary (${grade} grade: word-to-definition matching)`, () => {
    beforeEach(() => openVocabulary(grade));

    it('shows a word and asks what it means', () => {
      cy.get('.math-equation').invoke('text').should('match', /^[a-z]+$/);
      cy.contains('What does this word mean?').should('be.visible');
    });

    it('renders 4 definition choice cards', () => {
      cy.get('#quiz-choices .sight-card').should('have.length', 4);
    });
  });
});

['4th', '5th'].forEach(grade => {
  describe(`Vocabulary (${grade} grade: context clues)`, () => {
    beforeEach(() => openVocabulary(grade));

    it('shows a sentence with the target word bolded', () => {
      cy.get('#quiz-display strong').should('exist');
    });

    it('asks what the bolded word/phrase means with 4 choices', () => {
      cy.contains('What does').should('be.visible');
      cy.get('#quiz-choices .sight-card').should('have.length', 4);
    });
  });
});
