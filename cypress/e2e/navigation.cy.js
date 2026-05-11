describe('Navigation', () => {
  beforeEach(() => {
    cy.visitApp('/');
  });

  it('loads with the welcome screen active', () => {
    cy.get('#welcome').should('have.class', 'active');
    cy.contains("Let's Learn!").should('be.visible');
  });

  it('displays all five mode buttons', () => {
    cy.contains('🔤 Letters').should('be.visible');
    cy.contains('🔢 Numbers').should('be.visible');
    cy.contains('🧮 Math').should('be.visible');
    cy.contains('📖 Sight Words').should('be.visible');
    cy.contains('🌙 Arabic').should('be.visible');
  });

  // ── Letters ──────────────────────────────────────────────────

  it('Letters opens the mode-select screen with the letters emoji', () => {
    cy.contains('🔤 Letters').click();
    cy.get('#mode-select').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
    cy.get('#mode-select-emoji').should('have.text', '🔤');
  });

  it('mode-select Back button returns to welcome', () => {
    cy.contains('🔤 Letters').click();
    cy.contains('← Back').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#mode-select').should('not.have.class', 'active');
  });

  it('Trace it enters the tracing screen with a Trace label', () => {
    cy.contains('🔤 Letters').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#tracing').should('have.class', 'active');
    cy.get('#char-label').should('contain.text', 'Trace the letter');
  });

  it('Write it enters the tracing screen with a Write label', () => {
    cy.contains('🔤 Letters').click();
    cy.contains('🖊️ Write it').click();
    cy.get('#tracing').should('have.class', 'active');
    cy.get('#char-label').should('contain.text', 'Write the letter');
  });

  it('tracing screen Home button returns to welcome', () => {
    cy.contains('🔤 Letters').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#tracing').find('.btn-icon').first().click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#tracing').should('not.have.class', 'active');
  });

  // ── Numbers ───────────────────────────────────────────────────

  it('Numbers opens mode-select with the numbers emoji', () => {
    cy.contains('🔢 Numbers').click();
    cy.get('#mode-select').should('have.class', 'active');
    cy.get('#mode-select-emoji').should('have.text', '🔢');
  });

  it('Numbers → Trace it shows a number label', () => {
    cy.contains('🔢 Numbers').click();
    cy.contains('✏️ Trace it').click();
    cy.get('#char-label').should('contain.text', 'Trace the number');
  });

  // ── Math ──────────────────────────────────────────────────────

  it('Math goes directly to the math screen', () => {
    cy.contains('🧮 Math').click();
    cy.get('#math-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('math Home button returns to welcome', () => {
    cy.contains('🧮 Math').click();
    cy.get('#math-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#math-screen').should('not.have.class', 'active');
  });

  // ── Sight Words ───────────────────────────────────────────────

  it('Sight Words goes directly to the sight screen', () => {
    cy.contains('📖 Sight Words').click();
    cy.get('#sight-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('sight Home button returns to welcome', () => {
    cy.contains('📖 Sight Words').click();
    cy.get('#sight-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#sight-screen').should('not.have.class', 'active');
  });

  // ── Arabic ────────────────────────────────────────────────────

  it('Arabic goes directly to the arabic screen', () => {
    cy.contains('🌙 Arabic').click();
    cy.get('#arabic-screen').should('have.class', 'active');
    cy.get('#welcome').should('not.have.class', 'active');
  });

  it('arabic Home button returns to welcome', () => {
    cy.contains('🌙 Arabic').click();
    cy.get('#arabic-screen').find('.btn-icon').click();
    cy.get('#welcome').should('have.class', 'active');
    cy.get('#arabic-screen').should('not.have.class', 'active');
  });
});
