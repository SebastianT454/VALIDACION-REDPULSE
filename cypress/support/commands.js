//USUARIO COMUN (Y DONANTE)
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

//DONANTE
Cypress.Commands.add('loginDonante', () => {
  cy.login();
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

  cy.url().should('not.include', '/login');
});


//REGISTRO
Cypress.Commands.add('registro', () => {
  cy.visit('/registro');

  const documentoUnico = String(Date.now()).slice(-8);

  cy.get('input[name="nombre"]')
    .should('be.visible')
    .type('Laura');

  cy.get('input[name="apellido"]')
    .should('be.visible')
    .type('Prueba');

  cy.get('select[name="tipo_documento"]')
    .should('be.visible')
    .select('Cedula de Ciudadania');

  cy.get('input[name="numero_documento"]')
    .should('be.visible')
    .type(documentoUnico);

  cy.get('select[name="tipo_de_sangre"]')
    .should('be.visible')
    .select('O+');

  cy.get('input[name="correo"]')
    .should('be.visible')
    .type(`laura${documentoUnico}@prueba.com`);

  cy.get('input[name="contrasena"]')
    .should('be.visible')
    .type('Password123*');

  cy.get('input[name="confirmar_contrasena"]')
    .should('be.visible')
    .type('Password123*');

  cy.get('input[type="checkbox"]')
    .check();

  cy.contains('button', 'Crear Cuenta')
    .click();

  cy.wait(1000);

  cy.get('body').then(($body) => {
    if ($body.find('#success-message.active').length > 0) {
      cy.get('#success-message').should('be.visible');
      cy.contains('¡Cuenta creada exitosamente!').should('be.visible');
    }
  });




//DONANTE
Cypress.Commands.add('loginDonante', () => {
  cy.visit('/login');

  cy.get('input[name="numero_documento"]')
    .should('be.visible')
    .type('666');

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
  

});