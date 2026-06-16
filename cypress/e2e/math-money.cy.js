// Money topic: coin-counting visual for 2nd grade, making-change word
// problems (text only) for 3rd-5th.

function openMoney(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('🧮 Math').click();
  cy.get('#topic-grid').contains('💰 Money').click();
}

describe('Money (2nd grade: coin counting)', () => {
  beforeEach(() => openMoney('2nd'));

  it('renders at least one coin chip', () => {
    cy.get('.money-coin').should('have.length.greaterThan', 0);
  });

  it('asks "How much money is this?" with 4 dollar-amount choices', () => {
    cy.contains('How much money is this?').should('be.visible');
    cy.get('#quiz-choices button').should('have.length', 4);
    cy.get('#quiz-choices button').each($btn => {
      expect($btn.text().trim()).to.match(/^\$\d+\.\d{2}$/);
    });
  });
});

['3rd', '4th', '5th'].forEach(grade => {
  describe(`Money (${grade} grade: making change)`, () => {
    beforeEach(() => openMoney(grade));

    it('shows a making-change word problem with no coin chips', () => {
      cy.get('.money-coin').should('not.exist');
      cy.contains('How much change do you get?').should('be.visible');
    });

    it('renders 4 dollar-amount choices', () => {
      cy.get('#quiz-choices button').should('have.length', 4);
      cy.get('#quiz-choices button').each($btn => {
        expect($btn.text().trim()).to.match(/^\$\d+\.\d{2}$/);
      });
    });
  });
});
