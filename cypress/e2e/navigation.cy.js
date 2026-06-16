describe('Navigation', () => {
  beforeEach(() => {
    cy.visitApp('/');
  });

  it('loads with the grade picker active', () => {
    cy.get('#grade-select').should('have.class', 'active');
    cy.contains('KG').should('be.visible');
    cy.contains('1st').should('be.visible');
    cy.contains('2nd').should('be.visible');
    cy.contains('3rd').should('be.visible');
    cy.contains('4th').should('be.visible');
    cy.contains('5th').should('be.visible');
  });

  it('KG opens the welcome screen with all seven activity buttons', () => {
    cy.selectGrade('KG');
    cy.get('#welcome').should('have.class', 'active');
    cy.contains('Tiny Thinkers').should('be.visible');
    cy.contains('🔤 Letters').should('be.visible');
    cy.contains('🔢 Numbers').should('be.visible');
    cy.contains('🧮 Math').should('be.visible');
    cy.contains('📖 Sight Words').should('be.visible');
    cy.contains('🌙 Arabic').should('be.visible');
    cy.contains('🔷 Shapes').should('be.visible');
    cy.contains('🚗 Matching').should('be.visible');
  });

  // ── Letters ──────────────────────────────────────────────────

  it('Letters opens the mode-select screen with the letters emoji', () => {
    cy.selectGrade('KG');
    cy.contains('🔤 Letters').click();
    cy.get('#mode-select').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
    cy.get('#mode-select-emoji').should('have.text', '🔤');
  });

  it('mode-select Back button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('🔤 Letters').click();
    cy.get('#mode-select').contains('← Back').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#mode-select').should('not.have.class', 'active');
  });

  it('Trace it enters the tracing screen with a Trace label', () => {
    cy.selectGrade('KG');
    cy.contains('🔤 Letters').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#tracing').should('have.class', 'active');
    cy.get('#char-label').should('contain.text', 'Trace the letter');
  });

  it('Write it enters the tracing screen with a Write label', () => {
    cy.selectGrade('KG');
    cy.contains('🔤 Letters').click();
    cy.contains('🖊️ Write it').click();
    cy.get('#tracing').should('have.class', 'active');
    cy.get('#char-label').should('contain.text', 'Write the letter');
  });

  it('tracing screen Home button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('🔤 Letters').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#tracing').find('.btn-icon').first().click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#tracing').should('not.have.class', 'active');
  });

  // ── Numbers ───────────────────────────────────────────────────

  it('Numbers opens mode-select with the numbers emoji', () => {
    cy.selectGrade('KG');
    cy.contains('🔢 Numbers').click();
    cy.get('#mode-select').should('have.class', 'active');
    cy.get('#mode-select-emoji').should('have.text', '🔢');
  });

  it('Numbers → Trace it shows a number label', () => {
    cy.selectGrade('KG');
    cy.contains('🔢 Numbers').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#char-label').should('contain.text', 'Trace the number');
  });

  // ── Math ──────────────────────────────────────────────────────

  it('Math goes directly to the math screen', () => {
    cy.selectGrade('KG');
    cy.contains('🧮 Math').click();
    cy.get('#math-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('math Home button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('🧮 Math').click();
    cy.get('#math-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#math-screen').should('not.have.class', 'active');
  });

  // ── Sight Words ───────────────────────────────────────────────

  it('Sight Words goes directly to the sight screen', () => {
    cy.selectGrade('KG');
    cy.contains('📖 Sight Words').click();
    cy.get('#sight-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('sight Home button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('📖 Sight Words').click();
    cy.get('#sight-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#sight-screen').should('not.have.class', 'active');
  });

  // ── Arabic ────────────────────────────────────────────────────

  it('Arabic goes directly to the arabic screen', () => {
    cy.selectGrade('KG');
    cy.contains('🌙 Arabic').click();
    cy.get('#arabic-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('arabic Home button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('🌙 Arabic').click();
    cy.get('#arabic-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#arabic-screen').should('not.have.class', 'active');
  });

  // ── Shapes ────────────────────────────────────────────────────

  it('Shapes goes directly to the shapes screen', () => {
    cy.selectGrade('KG');
    cy.contains('🔷 Shapes').click();
    cy.get('#shapes-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('shapes Home button returns to welcome', () => {
    cy.selectGrade('KG');
    cy.contains('🔷 Shapes').click();
    cy.get('#shapes-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#shapes-screen').should('not.have.class', 'active');
  });

  // ── 1st-5th grade: Math/Reading category flow ──────────────────
  // NOTE: button labels like "🧮 Math", "📖 Reading"/"📖 Sight Words" and
  // "← Back" repeat verbatim across several screen templates (KG's
  // #welcome, each grade-N-screen, mode-select, topic-select-screen).
  // cy.contains() matches the first such element in DOM order regardless
  // of visibility, so every lookup here is scoped to '.screen.active'
  // (the one screen currently shown) to avoid grabbing a hidden duplicate.

  ['1st', '2nd', '3rd', '4th', '5th'].forEach(grade => {
    it(`${grade} grade home screen shows Math and Reading buttons`, () => {
      cy.selectGrade(grade);
      cy.get('.screen.active').contains('🧮 Math').should('be.visible');
      cy.get('.screen.active').contains('📖 Reading').should('be.visible');
    });

    it(`${grade} grade Math button opens the topic-select screen`, () => {
      cy.selectGrade(grade);
      cy.get('.screen.active').contains('🧮 Math').click();
      cy.get('#topic-select-screen').should('have.class', 'active');
      cy.get('#topic-grid .btn-xl').should('have.length.greaterThan', 0);
    });

    it(`${grade} grade topic-select Back button returns to the grade home screen`, () => {
      cy.selectGrade(grade);
      cy.get('.screen.active').contains('🧮 Math').click();
      cy.get('.screen.active').contains('← Back').click();
      cy.get('.screen.active').contains('🧮 Math').should('be.visible');
      cy.get('.screen.active').contains('📖 Reading').should('be.visible');
    });
  });

  it('1st grade Reading button shows phonics, sight words, and vocabulary topics', () => {
    cy.selectGrade('1st');
    cy.get('.screen.active').contains('📖 Reading').click();
    cy.get('#topic-grid').contains('🔤 Phonics').should('be.visible');
    cy.get('#topic-grid').contains('📖 Sight Words').should('be.visible');
    cy.get('#topic-grid').contains('💬 Vocabulary').should('be.visible');
  });

  it('4th grade Reading button shows only the Vocabulary topic', () => {
    cy.selectGrade('4th');
    cy.get('.screen.active').contains('📖 Reading').click();
    cy.get('#topic-grid').contains('💬 Vocabulary').should('be.visible');
    cy.get('#topic-grid').contains('🔤 Phonics').should('not.exist');
    cy.get('#topic-grid').contains('📖 Sight Words').should('not.exist');
  });

  it('Change Grade button returns to the grade picker', () => {
    cy.selectGrade('2nd');
    cy.get('.screen.active').contains('← Change Grade').click();
    cy.get('#grade-select').should('have.class', 'active');
  });
});
