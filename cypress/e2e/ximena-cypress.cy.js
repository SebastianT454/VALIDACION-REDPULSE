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
  it('HU4: Enfermero - Seguridad y Registro de Donación', () => {
    
    cy.login();
    cy.visit('/logout'); 
    
    cy.loginDonante();
    cy.visit('/enfermero', { failOnStatusCode: false });
    cy.url().should('not.include', '/enfermero');

    
    cy.visit('/logout');
    cy.loginEnfermero();
    cy.get('#cedula').type('122');
    cy.get('select[name="tipo_documento"]').select('Cedula de Ciudadania');
    cy.get('.submit-button').click();

    cy.wait('@verificarCedula').its('response.statusCode').should('eq', 200);
    cy.get('#success-message button').click();

    
    cy.get('#quantity').type('450');
    cy.get('#donation-date').type('2026-05-24');
    cy.get('.btn-puntos').click();

    
    cy.get('input[name="puntos"]').type('2000');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/enfermero');
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