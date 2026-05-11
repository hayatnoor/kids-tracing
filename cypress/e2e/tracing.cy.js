// Draw a horizontal stroke across the centre of the canvas.
// Returns a cy chain so it can be awaited.
function drawOnCanvas() {
  return cy.get('#draw-canvas').then($canvas => {
    const rect = $canvas[0].getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy2 = rect.top  + rect.height / 2;
    cy.wrap($canvas)
      .trigger('mousedown', { clientX: cx - 60, clientY: cy2, bubbles: true })
      .trigger('mousemove', { clientX: cx,      clientY: cy2, bubbles: true })
      .trigger('mousemove', { clientX: cx + 60, clientY: cy2, bubbles: true })
      .trigger('mouseup',   { clientX: cx + 60, clientY: cy2, bubbles: true });
  });
}

describe('Tracing / Drawing Mode', () => {
  // Navigate to the tracing screen before each test.
  beforeEach(() => {
    cy.visitApp('/');
    cy.contains('🔤 Letters').click();
    cy.contains('✏️ Trace it').click();
    // Wait for fonts + resize so the canvas has non-zero dimensions.
    cy.get('#draw-canvas').invoke('prop', 'width').should('be.greaterThan', 0);
  });

  // ── Canvas elements ───────────────────────────────────────────

  it('renders the guide and draw canvases', () => {
    cy.get('#guide-canvas').should('be.visible');
    cy.get('#draw-canvas').should('be.visible');
  });

  it('shows the char label with the first letter', () => {
    cy.get('#char-label').should('contain.text', 'Trace the letter A');
  });

  it('creates progress dots equal to the alphabet length (26)', () => {
    cy.get('#progress-row .dot').should('have.length', 26);
  });

  it('marks the first dot as current', () => {
    cy.get('#progress-row .dot.current').should('have.length', 1);
  });

  // ── Drawing ───────────────────────────────────────────────────

  it('drawing on the canvas leaves coloured pixels', () => {
    drawOnCanvas();
    cy.window().then(win => {
      const canvas = win.document.getElementById('draw-canvas');
      const ctx    = canvas.getContext('2d');
      const data   = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasInk = [...data].some(v => v > 0);
      expect(hasInk).to.be.true;
    });
  });

  // ── Clear button ──────────────────────────────────────────────

  it('Clear button wipes the canvas', () => {
    drawOnCanvas();
    cy.contains('🗑 Clear').click();
    cy.window().then(win => {
      const canvas = win.document.getElementById('draw-canvas');
      const ctx    = canvas.getContext('2d');
      const data   = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasInk = [...data].some(v => v > 0);
      expect(hasInk).to.be.false;
    });
  });

  // ── Skip button ───────────────────────────────────────────────

  it('Skip button advances to the next letter', () => {
    cy.get('#tracing').find('.btn-icon').eq(1).click(); // ⏭ Skip button
    cy.get('#char-label').should('contain.text', 'Trace the letter B');
  });

  // ── Check button (insufficient drawing) ──────────────────────

  it('Check with no drawing stays on the tracing screen', () => {
    cy.contains('⭐ Check!').click();
    cy.get('#tracing').should('have.class', 'active');
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  it('Check with no drawing does not open the result overlay', () => {
    cy.contains('⭐ Check!').click();
    cy.get('#result-overlay').should('not.have.class', 'active');
  });

  // ── Result overlay (triggered programmatically) ───────────────

  it('showResult(5) opens the result overlay with AMAZING!', () => {
    cy.window().then(win => { win.showResult(5, 1.0); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#r-msg').should('have.text', 'AMAZING!');
  });

  it('result overlay shows 5 filled stars on a perfect trace', () => {
    cy.window().then(win => { win.showResult(5, 1.0); });
    cy.get('#r-stars .star-item').should('have.length', 5).each($star => {
      expect($star.text()).to.equal('⭐');
    });
  });

  it('Try Again button closes the overlay and stays on tracing', () => {
    cy.window().then(win => { win.showResult(5, 1.0); });
    cy.get('#btn-try-again').click();
    cy.get('#result-overlay').should('not.have.class', 'active');
    cy.get('#tracing').should('have.class', 'active');
  });

  it('Next button closes the overlay and loads the next letter', () => {
    cy.window().then(win => { win.showResult(5, 1.0); });
    cy.get('#btn-next').click();
    cy.get('#result-overlay').should('not.have.class', 'active');
    cy.get('#char-label').should('contain.text', 'Trace the letter B');
  });

  // ── Writing mode ──────────────────────────────────────────────

  it('Write it mode shows a Write label instead of Trace', () => {
    cy.visitApp('/');
    cy.contains('🔤 Letters').click();
    cy.contains('🖊️ Write it').click();
    cy.get('#char-label').should('contain.text', 'Write the letter A');
  });

  it('Write it mode result overlay also closes on Try Again', () => {
    cy.visitApp('/');
    cy.contains('🔤 Letters').click();
    cy.contains('🖊️ Write it').click();
    cy.window().then(win => { win.showResult(5, 1.0); });
    cy.get('#result-overlay').should('have.class', 'active');
    cy.get('#btn-try-again').click();
    cy.get('#result-overlay').should('not.have.class', 'active');
  });
});
