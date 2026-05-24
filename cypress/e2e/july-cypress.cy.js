
describe('RedPulse - Pruebas Automatizadas', () => {


//LOGIN  
  it('1. Login - E2E, UI, Regresión y Seguridad Básica', () => {
    cy.visit('/login');

    cy.get('input[name="numero_documento"]').should('be.visible');
    cy.get('select[name="tipo_documento"]').should('be.visible');
    cy.get('input[name="contrasena"]').should('be.visible');
    cy.contains('button', 'Ingresar').should('be.visible');

    cy.login();
    cy.url().should('not.include', '/login');
    cy.get('body').should('not.contain.text', 'inexistentes o incorrectos');
    
  });


//MOVIMIENTOS  
    it('2. Movimientos - E2E, UI y Regresión', () => {
    cy.login();
    cy.contains(/perfil/i).should('be.visible').click();
    cy.contains(/movimientos/i).should('be.visible').click();
    // Validar que el módulo cargo
    cy.url().should('include', '/movimientos');
    cy.get('body').should('be.visible');
    cy.get('header').should('be.visible');
  });
 

//PUNTOS
 it('3. Puntos - UI, Regresión y API', () => {
    cy.login();
    cy.visit('/puntos');
    cy.contains('Total de Puntos Acumulados').should('be.visible');
    cy.get('#total-puntos').should('be.visible');
    cy.get('.card-container').should('be.visible');
  });



//REGISTRO DE DONACION HECHA POR EL ENFERMERO
  it('4. Registrar donación - E2E, UI y Regresión', () => {
    cy.loginEnfermero();

    // Pantalla inicial del enfermero
    cy.url().should('include', '/enfermero');
    cy.contains(/bienvenido enfermero/i).should('be.visible');

    // Verificar cédula del donante
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

    // Confirmar cédula verificada
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

// ASIGNACION DE PUNTOS PARTE DE LAU
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


  
//FILTRAR SOLICITUDES 
  it('5. Filtrar Solicitudes - E2E, UI, Regresión y Accesibilidad Básica', () => {
    cy.login();
    cy.visit('/filtrar_solicitudes');
    cy.contains('Filtrar solicitudes por tipo de sangre').should('be.visible');
    cy.get('label[for="tipo_sangre"]').should('be.visible');
    cy.get('#tipo_sangre').should('be.visible');
    cy.get('#tipo_sangre').should('have.attr', 'required');
    cy.get('#tipo_sangre').select('O+');
    cy.get('button[type="submit"]').should('be.visible');
  });
  



});
