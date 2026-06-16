// Time topic: clock-reading visual for 2nd-3rd grade, elapsed-time word
// problems (text only, no clock) for 4th-5th.

function openTime(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('🧮 Math').click();
  cy.get('#topic-grid').contains('🕐 Time').click();
}

['2nd', '3rd'].forEach(grade => {
  describe(`Time (${grade} grade: clock reading)`, () => {
    beforeEach(() => openTime(grade));

    it('renders an analog clock face', () => {
      cy.get('#quiz-display svg circle').should('exist');
    });

    it('asks "What time is it?" with 4 time choices', () => {
      cy.contains('What time is it?').should('be.visible');
      cy.get('#quiz-choices button').should('have.length', 4);
      cy.get('#quiz-choices button').each($btn => {
        expect($btn.text().trim()).to.match(/^\d{1,2}:\d{2}$/);
      });
    });
  });
});

['4th', '5th'].forEach(grade => {
  describe(`Time (${grade} grade: elapsed time word problems)`, () => {
    beforeEach(() => openTime(grade));

    it('shows an elapsed-time word problem with no clock face', () => {
      cy.get('#quiz-display svg').should('not.exist');
      cy.contains('What time will it be in').should('be.visible');
    });

    it('renders 4 time choices', () => {
      cy.get('#quiz-choices button').should('have.length', 4);
      cy.get('#quiz-choices button').each($btn => {
        expect($btn.text().trim()).to.match(/^\d{1,2}:\d{2}$/);
      });
    });
  });
});
