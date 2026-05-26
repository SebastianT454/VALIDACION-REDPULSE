import { Stagehand } from "@browserbasehq/stagehand";
import 'dotenv/config';

async function main() {

  const stagehand = new Stagehand({
    env: "LOCAL",
    model: `ollama/${process.env.OLLAMA_MODEL || "llama3.1"}`,
    localBrowserLaunchOptions: {
      headless: false
    }
  });

  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];
    const BASE_URL = "http://localhost:8000";

    // Credenciales
    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };
    const enfermero = {
      documento: "112233",
      tipoDocumento: "Cedula de Ciudadania",
      password: "112233"
    };
    const admin = {
      documento: "000",
      tipoDocumento: "Cedula de Ciudadania",
      password: "000"
    };

    // Funciones de login
    async function loginUsuario() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(usuario.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(usuario.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(usuario.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }

    async function loginDonante() {
      // Usamos el mismo usuario para donante
      await loginUsuario();
    }

    async function loginEnfermero() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(enfermero.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(enfermero.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(enfermero.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }

    async function loginAdmin() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(admin.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(admin.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(admin.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }

    // HU1: MOVIMIENTOS

    console.log("HU1 - Movimientos");
    await loginUsuario();
    await page.goto(`${BASE_URL}/movimientos`);
    await page.waitForTimeout(2000);

    const movimientosResult = await stagehand.extract(`
      Verify the movements page.
      Return:
      - current URL (should contain /movimientos)
      - is the header visible and styled with display flex?
      - is the h2 heading "Movimientos" visible?
      - is the first h3 inside .historical with red color (rgb(185, 58, 50))?
      - does the page contain elements with class .historical? If yes, how many?
      - if no .historical elements, is there a message "No existen registros"?
    `);
    console.log(movimientosResult);

    // HU2: SOLICITUDES DE SANGRE

    console.log("HU2 - Solicitudes de sangre");
    await loginUsuario();
    await page.goto(`${BASE_URL}/solicitud_donacion`);
    await page.waitForTimeout(1000);

    await page.locator('#quantity').fill('450');
    await page.locator('#reason').fill('Prueba automatizada de solicitud');
    await page.locator('#priority').selectOption('2');
    await page.locator('.confirm-button').click();
    await page.waitForTimeout(2000);

    const solicitudResult = await stagehand.extract(`
      Check the result of the blood request submission.
      Return:
      - is a success message visible (e.g., #success-message)?
      - the content of the success message
      - can the success message be dismissed?
    `);
    console.log(solicitudResult);

    // HU3: PROGRAMA DE FIDELIZACIÓN

    console.log("HU3 - Fidelización");
    await loginDonante();
    await page.goto(`${BASE_URL}/puntos`);
    await page.waitForTimeout(2000);

    const puntosResult = await stagehand.extract(`
      Verify the loyalty points page.
      Return:
      - is the #total-puntos element visible and does it contain "puntos"?
      - number of .business-card elements (at least 1)
      - are all images inside .image-container visible and loaded correctly?
    `);
    console.log(puntosResult);

    // HU4: ENFERMERO (seguridad y registro de donación)

    console.log("HU4 - Enfermero");

    // 1. Asegurarse de que un donante no pueda acceder a /enfermero
    await loginDonante();
    await page.goto(`${BASE_URL}/enfermero`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const accesoDenegado = await stagehand.extract(`
      Check if the donor (non-enfermero) was blocked from the /enfermero page.
      Return:
      - current URL
      - does the page display an access denied message or redirect?
    `);
    console.log("Acceso denegado a donante:", accesoDenegado);

    // 2. Ingresar como enfermero y realizar registro de donación
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);
    await loginEnfermero();

    await page.goto(`${BASE_URL}/enfermero`);
    await page.waitForTimeout(1000);

    await page.locator('#cedula').fill('122');
    await page.locator('select[name="tipo_documento"]').selectOption('Cedula de Ciudadania');
    await page.locator('.submit-button').click();
    await page.waitForTimeout(2000);

    // Confirmar éxito de verificación
    const verificacionResult = await stagehand.extract(`
      Check the result after verifying the patient's document.
      Return:
      - is there a success message?
      - is there a button to continue?
    `);
    console.log(verificacionResult);

    // Click en botón de continuar (asumiendo que está dentro del mensaje de éxito)
    const continuarBoton = await page.locator('#success-message button');
    if (await continuarBoton.isVisible()) {
      await continuarBoton.click();
      await page.waitForTimeout(500);
    }

    // Llenar datos de la donación
    await page.locator('#quantity').fill('450');
    await page.locator('#donation-date').fill('2026-05-24');
    await page.locator('.btn-puntos').click();
    await page.waitForTimeout(1000);

    // Asignar puntos
    await page.locator('input[name="puntos"]').fill('2000');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    const donacionResult = await stagehand.extract(`
      Verify the completion of the donation registration.
      Return:
      - current URL (should contain /enfermero)
      - any success or error message
    `);
    console.log("Resultado donación:", donacionResult);

    // HU5: ESTADÍSTICAS (seguridad y visualización)

    console.log("HU5 - Estadísticas");

    // 1. Donante no debe acceder
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);
    await loginDonante();
    await page.goto(`${BASE_URL}/estadisticas`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const bloqueoEstadisticas = await stagehand.extract(`
      Check if donor is blocked from /estadisticas.
      Return:
      - current URL
      - any access denied message or redirect
    `);
    console.log("Bloqueo donante estadísticas:", bloqueoEstadisticas);

    // 2. Admin sí debe acceder y ver gráficos
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);
    await loginAdmin();
    await page.goto(`${BASE_URL}/estadisticas`);
    await page.waitForTimeout(2000);

    const estadisticasResult = await stagehand.extract(`
      Verify the statistics page for admin.
      Return:
      - number of canvas elements (should be 2)
      - is #monthlyDonationsChart visible?
      - does the nav contain at least 3 links?
    `);
    console.log("Estadísticas admin:", estadisticasResult);

    console.log("Pruebas de Ximena terminadas.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await stagehand.close();
  }
}

main();
