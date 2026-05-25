describe('RedPulse - Pruebas de Usuario (Ximena)', () => {

  // 1. Movimientos del solicitante
  it('HU1: Movimientos del solicitante - Consultar historial de movimientos', () => {
    cy.login(); // Inicia sesión como solicitante/donante
    cy.visit('/movimientos');
    
    // Verificar que el sistema cargue el historial
    cy.url().should('include', '/movimientos');
    cy.contains('h2', 'Movimientos').should('be.visible');

    // Escenario: Con movimientos registrados o mensaje de no registros
    cy.get('body').then(($body) => {
      if ($body.find('.historical').length > 0) {
        cy.get('.historical').first().should('be.visible');
        cy.contains(/Usted realizó una/i).should('be.visible');
      } else {
        cy.get('.no-registros').should('be.visible');
        cy.contains('No existen registros de movimientos actualmente.').should('be.visible');
      }
    });
  });

  // 2. Solicitudes de sangre
  it('HU2: Solicitudes de sangre - Realizar una solicitud médica', () => {
    cy.login();
    cy.visit('/solicitud_donacion');
    
    // Escenario: Registro exitoso
    cy.get('#quantity').clear({ force: true }).type('450');
    cy.get('#reason').clear({ force: true }).type('Necesidad médica urgente para cirugía');
    cy.get('#comments').clear({ force: true }).type('Paciente tipo O+');
    cy.get('#priority').select('2'); // Emergencia
    
    cy.get('.confirm-button').click();
    
    // Verificar modal de éxito y cerrarlo
    cy.get('#success-message').should('be.visible');
    cy.contains('¡Registro ingresado exitosamente!').should('be.visible');
    cy.get('#success-message button').click();
    cy.get('#success-message').should('not.be.visible');

    // Escenario: Validación de campos obligatorios
    cy.visit('/solicitud_donacion');
    
    // Si el modal de éxito sigue activo por la sesión del servidor, lo cerramos para poder interactuar
    cy.get('body').then(($body) => {
      if ($body.find('#success-message:visible').length > 0) {
        cy.get('#success-message button').click();
      }
    });

    cy.get('#quantity').clear({ force: true });
    cy.get('.confirm-button').click();
    
    // El navegador debería prevenir el envío por el atributo 'required'
    cy.get('input:invalid').should('have.length.greaterThan', 0);
  });

  // 3. Programa de fidelización
  it('HU3: Programa de fidelización - Consultar y redimir puntos', () => {
    cy.loginDonante();
    cy.visit('/puntos');

    // Visualizar total acumulado
    cy.get('#total-puntos').should('be.visible');
    cy.contains('Total de Puntos Acumulados').should('be.visible');

    // Intentar redimir un premio (dependerá de los puntos actuales)
    cy.get('.redeem-button').first().click();

    cy.get('body').then(($body) => {
      if ($body.find('#success-message').is(':visible')) {
        cy.contains('¡Compra exitosa, verifique su correo!').should('be.visible');
        cy.get('#success-message button').click();
      } else if ($body.find('#error-message').is(':visible')) {
        cy.contains('¡No tienes suficiente puntos!').should('be.visible');
        cy.get('#error-message button').click();
      }
    });
  });

  // 4. Registro de donaciones e incentivos
  it('HU4: Registro de donaciones - Enfermero registra donación y asigna puntos', () => {
    cy.loginEnfermero();
    
    // Formulario de verificación de cédula
    cy.get('#cedula').clear().type('122');
    cy.get('select[name="tipo_documento"]').select('Cedula de Ciudadania');
    cy.get('.submit-button').click();

    // Modal de éxito y redirección
    cy.get('#success-message').should('be.visible');
    cy.contains('¡Cédula verificada exitosamente').should('be.visible');
    cy.get('#success-message button').click();

    // Formulario de agregar donación
    cy.url().should('include', '/agregar_donacion');
    cy.get('#quantity').clear().type('450');
    cy.get('#donation-date').type('2026-05-24');
    
    // Ir a asignación de puntos
    cy.get('.btn-puntos').click();

    // Asignar puntos
    cy.url().should('include', '/asignar_puntos');
    cy.get('input[name="puntos"]').clear().type('2000');
    cy.get('button[type="submit"]').click();

    // Debería volver a la pantalla de enfermero
    cy.url().should('include', '/enfermero');
  });

  // 5. Estadísticas y reportes
  it('HU5: Estadísticas y reportes - Visualizar gráficos de inventario y donaciones', () => {
    cy.loginAdmin();
    cy.visit('/estadisticas');

    cy.url().should('include', '/estadisticas');

    cy.get('body').then(($body) => {
      if ($body.find('.no-data-message').length > 0) {
        cy.contains('Actualmente no hay datos disponibles para mostrar las estadísticas.').should('be.visible');
      } else {
        cy.get('#monthlyDonationsChart').should('be.visible');
        cy.get('#bloodTypeChart').should('be.visible');
      }
    });
  });

});
