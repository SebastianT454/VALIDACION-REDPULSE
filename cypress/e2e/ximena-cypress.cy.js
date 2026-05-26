describe('RedPulse - Suite Completa de Pruebas (Ximena)', () => {

  beforeEach(() => {
  
    cy.intercept('POST', '/solicitud_donacion').as('postSolicitud');
    cy.intercept('POST', '/enfermero').as('verificarCedula');
  });

  // --- 1. MOVIMIENTOS 
  it('HU1: Movimientos - E2E, UI y Accesibilidad', () => {
    cy.login();
    cy.visit('/movimientos');
    
    
    cy.url().should('include', '/movimientos');
    cy.get('header').should('be.visible').and('have.css', 'display', 'flex');
    cy.contains('h2', 'Movimientos').should('be.visible'); 
    cy.get('.historical h3').first().should('have.css', 'color', 'rgb(185, 58, 50)'); 


    cy.get('main').should('exist');
    cy.get('nav ul').should('exist');
    cy.get('.go-back').should('attr', 'href', 'javascript:void(0);');

   
    cy.get('body').then(($body) => {
      if ($body.find('.historical').length > 0) {
        cy.get('.historical').should('have.length.at.least', 1);
      } else {
        cy.get('.no-registros').should('contain', 'No existen registros');
      }
    });
  });

  // --- 2. SOLICITUDES DE SANGRE 
  it('HU2: Solicitudes de sangre - E2E y Validación de API', () => {
    cy.login();
    cy.visit('/solicitud_donacion');
    
    
    cy.get('#quantity').type('450');
    cy.get('#reason').type('Prueba automatizada de solicitud');
    cy.get('#priority').select('2');
    
    cy.get('.confirm-button').click();


    cy.wait('@postSolicitud').its('response.statusCode').should('eq', 200);
    
   
    cy.get('#success-message').should('be.visible');
    cy.get('#success-message button').click();
    cy.get('#success-message').should('not.be.visible');
  });

  // --- 3. PROGRAMA DE FIDELIZACIÓN 
  it('HU3: Fidelización - UI y Regresión de Puntos', () => {
    cy.loginDonante();
    cy.visit('/puntos');

   
    cy.get('#total-puntos').should('be.visible').and('contain', 'puntos');
    cy.get('.business-card').should('have.length.at.least', 1);

   
    cy.get('.image-container img').each(($el) => {
      cy.wrap($el).should('be.visible').and(($img) => {
        expect($img[0].naturalWidth).to.be.greaterThan(0);
      });
    });
  });










  // --- 4. ENFERMERO 
  it('4. Registrar donación - E2E, UI y Regresión', () => {
    cy.loginEnfermero();

    // Pantalla inicial del enfermero
    cy.url().should('include', '/enfermero');
    cy.contains(/bienvenido enfermero/i).should('be.visible');

    cy.get('input[placeholder="Ingrese la cédula"]')
      .should('be.visible')
      .clear()
      .type('122');

    cy.get('select')
      .should('be.visible')
      .select('Cedula de Ciudadania');

    cy.contains('button', 'Verificar Cédula')
      .should('be.visible')
      .click();

    cy.contains(/c[eé]dula verificada exitosamente/i, { timeout: 10000 })
      .should('be.visible');

    cy.contains('button', 'Continuar')
      .should('be.visible')
      .click();

    // Formulario de donación
    cy.contains(/bienvenido enfermero/i, { timeout: 10000 }).should('be.visible');
    cy.contains(/cantidad donada/i).should('be.visible');
    cy.contains(/fecha de la donaci[oó]n/i).should('be.visible');

    cy.get('input[placeholder="Ingrese la cantidad en ml"]')
      .should('be.visible')
      .clear()
      .type('450');

    cy.get('input[type="date"]')
      .should('be.visible')
      .type('2026-05-23');

    cy.contains('button', 'Asignación de Puntos')
      .should('be.visible')
      .click();

    cy.contains(/asignaci[oó]n de puntos/i, { timeout: 10000 })
      .should('be.visible');

    cy.contains(/cantidad de puntos/i).should('be.visible');

    cy.get('input[name="puntos"]')
      .should('be.visible')
      .clear()
      .type('10');

    cy.contains('button', 'Asignar')
      .should('be.visible')
      .click();
  });










  // --- 5. ESTADÍSTICAS 
  it('HU5: Estadísticas - Seguridad y Visualización de Gráficos', () => {
   
    cy.visit('/logout');
    cy.loginDonante();
    cy.visit('/estadisticas', { failOnStatusCode: false });
    cy.url().should('not.include', '/estadisticas');

    
    cy.visit('/logout');
    cy.loginAdmin();
    cy.visit('/estadisticas');

   
    cy.get('canvas').should('have.length', 2); 
    cy.get('#monthlyDonationsChart').should('be.visible');
    
   
    cy.get('nav a').should('have.length.at.least', 3);
  });

});