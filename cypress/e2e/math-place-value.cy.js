// Place Value topic exists at every grade 1st-5th, escalating from
// 2-digit add/sub to decimals + rounding. Engine mechanics (dots, stars,
// result overlay) are covered once in quiz-engine.cy.js — this file just
// checks the topic renders correctly and accepts the right answer at
// each grade.

function openPlaceValue(grade) {
  cy.visitApp('/');
  cy.selectGrade(grade);
  cy.get('.screen.active').contains('🧮 Math').click();
  cy.get('#topic-grid').contains('🧱 Place Value').click();
}

function answerFromEquationOrRounding() {
  return cy.get('#quiz-display').invoke('text').then(text => {
    if (text.includes('Round')) return null; // rounding questions have no derivable answer here
    const nums = text.match(/-?\d+(\.\d+)?/g).map(Number);
    return text.includes('+') ? nums[0] + nums[1] : nums[0] - nums[1];
  });
}

['1st', '2nd', '3rd'].forEach(grade => {
  describe(`Place Value (${grade} grade)`, () => {
    beforeEach(() => openPlaceValue(grade));

    it('shows "Question 1 of 10" on start', () => {
      cy.get('#quiz-label').should('have.text', 'Question 1 of 10');
    });

    it('renders 4 numeric answer choices', () => {
      cy.get('#quiz-choices button').should('have.length', 4);
    });

    it('renders an addition or subtraction equation', () => {
      cy.get('.math-equation').invoke('text').should('match', /-?\d+\s*[+−]\s*-?\d+\s*=\s*\?/);
    });

    it('one of the 4 choices matches the computed answer', () => {
      answerFromEquationOrRounding().then(answer => {
        cy.get('#quiz-choices button').then($btns => {
          const match = [...$btns].some(b => Number(b.textContent.trim()) === answer);
          expect(match).to.be.true;
        });
      });
    });

    it('clicking the correct choice advances to question 2', () => {
      answerFromEquationOrRounding().then(answer => {
        cy.contains('#quiz-choices button', String(answer)).click();
        cy.get('#quiz-label', { timeout: 2500 }).should('have.text', 'Question 2 of 10');
      });
    });
  });
});

describe('Place Value (4th-5th grade: decimals)', () => {
  ['4th', '5th'].forEach(grade => {
    it(`${grade} grade renders a decimal equation or rounding question`, () => {
      openPlaceValue(grade);
      cy.get('.math-equation').invoke('text').should('match', /(-?\d+\.\d+\s*[+−]\s*-?\d+\.\d+\s*=\s*\?)|(Round .* to the nearest)/);
    });
  });
});
