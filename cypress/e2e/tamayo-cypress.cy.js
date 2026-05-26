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

  // CONVERTIR USUARIO A ENFERMERO
  it('4. Convertir usuario a enfermero - E2E, UI y Regresión', () => {
    cy.loginAdmin();
    
    cy.contains('Convertir Enfermero').should('be.visible').click();
    cy.url().should('include', '/convertir_enfermero');
    
    cy.contains('h2', 'Convertir usuario en enfermero').should('be.visible');
    
    cy.get('input[name="cedula"]').should('be.visible').type('91663631');
    cy.get('select[name="tipo_documento"]').should('be.visible').select('Cedula de Ciudadania');
    
    cy.intercept('POST', '/convertir_enfermero').as('convertirEnfermero');
    
    cy.contains('button', 'Convertir en enfermero').should('be.visible').click();
    
    cy.wait('@convertirEnfermero').then((interception) => {
      expect(interception.response.statusCode).to.not.eq(500);
    });
    
    cy.get('body').should('not.contain', 'Internal Server Error');
    
    cy.get('#message-popup.active', { timeout: 10000 }).should('be.visible');
  });




  
  // GESTIONAR USUARIOS - ELIMINAR USUARIO
  it('5. Gestionar usuarios - eliminar usuario - E2E, UI y Regresión', () => {
    cy.loginAdmin();
    
    cy.contains('Visualizar Usuarios').should('be.visible').click();
    cy.url().should('include', '/visualizar_usuarios');
    
    cy.contains('h2', 'Usuarios (excluyendo administradores)').should('be.visible');
    cy.get('table').should('be.visible');
    
    cy.get('tbody').then(($tbody) => {
      if ($tbody.find('tr').length > 1) {
        cy.get('.delete-button').first().should('be.visible');
        
        cy.intercept('POST', '/visualizar_usuarios').as('eliminarUsuario');
        
        cy.on('window:confirm', () => true);
        
        cy.get('.delete-button').first().click();
        
        cy.wait('@eliminarUsuario').then((interception) => {
          expect(interception.response.statusCode).to.not.eq(500);
        });
        
        cy.get('#message-popup.active', { timeout: 10000 }).should('be.visible');
        
        cy.contains('button', 'Cerrar').should('be.visible').click();
      }
    });
    
    cy.get('body').should('not.contain', 'Internal Server Error');
  });

});