// Leveled sight words topic (1st-3rd) — same mechanic as KG's existing
// startSight(), generalized to pull from a different word list per grade.

function openSightWords(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('📖 Reading').click();
  cy.get('#topic-grid').contains('📖 Sight Words').click();
}

['1st', '2nd', '3rd'].forEach(grade => {
  describe(`Sight Words (${grade} grade)`, () => {
    beforeEach(() => openSightWords(grade));

    it('shows "Word 1 of 10" on start', () => {
      cy.get('#quiz-label').should('have.text', 'Word 1 of 10');
    });

    it('shows a Hear it again button', () => {
      cy.contains('🔊 Hear it again!').should('be.visible');
    });

    it('renders 4 lowercase word choice cards', () => {
      cy.get('#quiz-choices .sight-card').should('have.length', 4);
      cy.get('#quiz-choices .sight-card').each($card => {
        expect($card.text().trim()).to.match(/^[a-z']+$/);
      });
    });

    it('creates 10 progress dots with the first marked current', () => {
      cy.get('#quiz-progress-row .dot').should('have.length', 10);
      cy.get('#quiz-progress-row .dot.current').should('have.length', 1);
    });
  });
});
