describe('Login', () => {
  it('should successfully authenticate', () => {
    cy.visit('https://agoradebates.com');
    cy.contains('Login').click();
  })
})
