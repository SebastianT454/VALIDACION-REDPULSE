//USUARIO COMUN
Cypress.Commands.add('login', () => {
  cy.visit('/login');

  cy.get('input[name="numero_documento"]')
    .should('be.visible')
    .type('122');

  cy.get('select[name="tipo_documento"]')
    .should('be.visible')
    .select('Cedula de Ciudadania');

  cy.get('input[name="contrasena"]')
    .type('123');

  cy.contains('button', 'Ingresar')
    .should('be.enabled')
    .and('be.enabled')
    .click();

  cy.wait(1000);

  cy.contains('¡Bienvenido a Red Pulse!', { timeout: 10000 })
    .should('be.visible');

  cy.contains('button', 'Continuar')
    .should('be.visible')
    .click();

  cy.url().should('eq', Cypress.config().baseUrl + '/');
});


//ENFERMERO
Cypress.Commands.add('loginEnfermero', () => {
  cy.visit('/login');

  cy.get('input[name="numero_documento"]')
    .should('be.visible')
    .type('999');

  cy.get('select[name="tipo_documento"]')
    .should('be.visible')
    .select('Cedula de Ciudadania');

  cy.get('input[name="contrasena"]')
    .type('999');

  cy.contains('button', 'Ingresar')
    .should('be.enabled')
    .and('be.enabled')
    .click();

  cy.wait(1000);

  cy.contains('¡Bienvenido a Red Pulse!', { timeout: 10000 })
    .should('be.visible');

  cy.contains('button', 'Continuar')
    .should('be.visible')
    .click();

  cy.url().should('eq', Cypress.config().baseUrl + '/enfermero');
});




//ADMIN
Cypress.Commands.add('loginAdmin', () => {
  cy.visit('/login');

  cy.get('input[name="numero_documento"]')
    .should('be.visible')
    .type('000');

  cy.get('select[name="tipo_documento"]')
    .should('be.visible')
    .select('Cedula de Ciudadania');

  cy.get('input[name="contrasena"]')
    .type('123');

  cy.contains('button', 'Ingresar')
    .should('be.enabled')
    .and('be.enabled')
    .click();

  cy.wait(1000);

  cy.contains('¡Bienvenido a Red Pulse!', { timeout: 10000 })
    .should('be.visible');

  cy.contains('button', 'Continuar')
    .should('be.visible')
    .click();

  cy.url().should('eq', Cypress.config().baseUrl + '/admin');
});