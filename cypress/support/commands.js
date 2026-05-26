//USUARIO COMUN SOLICITANTE
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
    .type('888');

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

  cy.url().should('include', '/estadisticas');
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
});

//SOLICITAR RECUPERACIÓN DE CONTRASEÑA
Cypress.Commands.add('solicitarRecuperacion', (correo) => {
  cy.visit('/login');
  cy.contains('¿Olvidó la contraseña?').should('be.visible').click();
  cy.url().should('include', '/solicitar_recuperacion');
  cy.get('input[name="correo"]').should('be.visible').type(correo);
  cy.contains('button', 'Continuar').click();
});

//RESTABLECER CONTRASEÑA
Cypress.Commands.add('restablecerContrasena', (codigo, nuevaContrasena) => {
  cy.get('input[name="codigo_recuperacion"]').should('be.visible').type(codigo);
  cy.get('input[name="nueva_contrasena"]').should('be.visible').type(nuevaContrasena);
  cy.get('input[name="confirmacion_nueva_contrasena"]').should('be.visible').type(nuevaContrasena);
  cy.contains('button', 'Confirmar').click();
});
