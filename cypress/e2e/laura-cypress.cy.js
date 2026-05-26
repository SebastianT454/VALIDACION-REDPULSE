
describe('RedPulse - Pruebas de Laura', () => {

  //REGISTRO
  it('1. Registro - E2E, UI, Regresión y Seguridad Básica', () => {
    cy.visit('/registro');

    cy.get('input[name="nombre"]').should('be.visible');
    cy.get('input[name="apellido"]').should('be.visible');
    cy.get('select[name="tipo_documento"]').should('be.visible');
    cy.get('input[name="numero_documento"]').should('be.visible');
    cy.get('select[name="tipo_de_sangre"]').should('be.visible');
    cy.get('input[name="correo"]').should('be.visible');
    cy.get('input[name="contrasena"]').should('be.visible');
    cy.get('input[name="confirmar_contrasena"]').should('be.visible');

    cy.registro();
  });

  it('2. Gestión de Solicitudes - Aceptar Solicitud', () => {
    cy.loginAdmin();
    cy.visit('/solicitudes_pendientes');
    cy.contains('Solicitudes de Donación Pendientes').should('be.visible');

    cy.get('body').then(($body) => {
      if ($body.find('.approve-button').length > 0) {
        cy.get('.approve-button').first().click();
        cy.wait(500);
      }
    });
  });

  it('3. Gestión de Solicitudes - Rechazar Solicitud', () => {
    cy.loginAdmin();
    cy.visit('/solicitudes_pendientes');
    cy.contains('Solicitudes de Donación Pendientes').should('be.visible');

    cy.get('body').then(($body) => {
      if ($body.find('.reject-button').length > 0) {
        cy.get('.reject-button').first().click();
        cy.wait(500);
      }
    });
  });

  it('4. Chatbot donante - E2E, UI y Regresión', () => {
    cy.loginDonante();
    cy.contains('ChatBot').should('be.visible').click();
    cy.url().should('include', '/chatbot');
    cy.get('#chat-window').should('be.visible');
    cy.get('.bot-message').should('be.visible');
    cy.get('.bot-message').contains(/Hola/i).should('be.visible');
  });

  it('5. Notificaciones de escasez - E2E, UI y Regresión', () => {
    cy.loginDonante();

    cy.contains('Notificaciones').should('be.visible').click();

    cy.url().should('include', '/notificaciones');
    cy.contains('h2', 'Notificaciones').should('be.visible');

    cy.wait(1000);
    cy.contains('No tienes notificaciones').should('be.visible');
    cy.contains('a', 'Volver al inicio').should('be.visible');
  });

});