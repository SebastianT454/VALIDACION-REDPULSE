describe('RedPulse - Pruebas de Tamayo', () => {

  // SOLICITAR RECUPERACION

  it('1. Solicitar recuperación - E2E, UI y Regresión', () => {
    cy.solicitarRecuperacion('ximena1@gmail.com');

    cy.wait(500);

    cy.get('body').then(($body) => {
      if ($body.find('#success-message.active').length > 0) {
        cy.get('#success-message').should('be.visible');
        cy.contains(/correo valido/i).should('be.visible');
      } else if ($body.find('#error-message.active').length > 0) {
        cy.get('#error-message').should('be.visible');
        cy.contains(/correo no existe|incorrecto/i).should('be.visible');
      }
    });

    cy.get('body').should('not.contain', 'Internal Server Error');
  });

  // RESTABLECER CONTRASEÑA

  it('2. Restablecer contraseña - E2E, UI y Regresión', () => {
    cy.solicitarRecuperacion('121212@gmail.com');

    cy.wait(500);

    cy.get('body').then(($body) => {
      if ($body.find('#success-message.active').length > 0) {
        cy.get('#success-message.active').should('be.visible');
        cy.contains(/correo valido/i).should('be.visible');
        cy.contains('button', /continuar/i).should('be.visible').click();

        cy.contains(/recupera tu contraseña/i, { timeout: 10000 })
          .should('be.visible');
        cy.url().should('include', 'restablecer');

        cy.restablecerContrasena('NANjbhyCfQbdJTmk0fNoSQ', '123');

        cy.wait(500);

        cy.get('body').then(($body2) => {
          if ($body2.find('#success-message.active').length > 0) {
            cy.get('#success-message.active').should('be.visible');
            cy.contains(/contraseña restaurada|contraseña restablecida|actualizada/i)
              .should('be.visible');
          } else if ($body2.find('#error-message.active').length > 0) {
            cy.get('#error-message.active').should('be.visible');
            cy.contains(/contraseñas diferentes|c[oó]digo incorrecto/i)
              .should('be.visible');
          }
        });
      } else if ($body.find('#error-message.active').length > 0) {
        cy.get('#error-message.active').should('be.visible');
        cy.contains(/correo no existe|incorrecto/i).should('be.visible');
      }
    });

    cy.get('body').should('not.contain', 'Internal Server Error');
  });

// EDITAR FOTO DE PERFIL
  it('3. Editar foto de perfil - E2E, UI y Regresión', () => {
    cy.loginDonante();

    cy.contains('Perfil').click();
    cy.url().should('include', '/perfil');

    cy.get('#profile-pic').should('be.visible');

    cy.intercept('POST', '/actualizar_foto_perfil').as('actualizarFoto');

    cy.get('#file-input').selectFile('cypress/fixtures/perfil-test.png', {
      force: true,
    });
  });
  

});