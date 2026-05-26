import { Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: {
      modelName: process.env.OPENAI_MODEL || "openai/gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY_XIMENA!,
    },
    localBrowserLaunchOptions: {
      headless: false,
    },
  });

  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];
    const BASE_URL = "http://localhost:8000";

    // Credenciales
    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123456",
    };
    const enfermero = {
      documento: "112233",
      tipoDocumento: "Cedula de Ciudadania",
      password: "112233",
    };
    const admin = {
      documento: "000",
      tipoDocumento: "Cedula de Ciudadania",
      password: "000",
    };

    // Funciones de login usando stagehand.act
    async function loginUsuario() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${usuario.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${usuario.password} in the password field`);
      await stagehand.act("Click the login button");
      await page.waitForTimeout(2000);
    }

    async function loginDonante() {
      await loginUsuario();
    }

    async function loginEnfermero() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${enfermero.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${enfermero.password} in the password field`);
      await stagehand.act("Click the login button");
      await page.waitForTimeout(2000);
    }

    async function loginAdmin() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${admin.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${admin.password} in the password field`);
      await stagehand.act("Click the login button");
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

    await stagehand.act("Type 450 in the quantity field");
    await stagehand.act("Type 'Prueba automatizada de solicitud' in the reason field");
    await stagehand.act("Select priority 2 in the priority dropdown");
    await stagehand.act("Click the confirm button (.confirm-button)");
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

    // HU4: ENFERMERO

    console.log("HU4 - Enfermero");

    // 1. Donante intenta acceder
    await loginDonante();
    await page.goto(`${BASE_URL}/enfermero`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const accesoDenegado = await stagehand.extract(`
      Check if the donor was blocked from /enfermero.
      Return:
      - current URL
      - any access denied message or redirect
    `);
    console.log("Acceso denegado a donante:", accesoDenegado);

    // 2. Enfermero realiza registro de donación
    await page.goto(`${BASE_URL}/logout`);
    await page.waitForTimeout(1000);
    await loginEnfermero();
    await page.goto(`${BASE_URL}/enfermero`);
    await page.waitForTimeout(1000);

    await stagehand.act("Type 122 in the document field (#cedula)");
    await stagehand.act("Select Cedula de Ciudadania in the tipo_documento dropdown");
    await stagehand.act("Click the submit button (.submit-button)");
    await page.waitForTimeout(2000);

    const verificacionResult = await stagehand.extract(`
      Check the result after verifying the patient's document.
      Return:
      - is there a success message?
      - is there a button to continue?
    `);
    console.log(verificacionResult);

    // Hacer clic en el botón de continuar si existe
    await stagehand.act("Click the continue button inside the success message");
    await page.waitForTimeout(500);

    await stagehand.act("Type 450 in the quantity field");
    await stagehand.act("Select date 2026-05-24 in the date field (#donation-date)");
    await stagehand.act("Click the .btn-puntos button");
    await page.waitForTimeout(1000);

    await stagehand.act("Type 2000 in the puntos input");
    await stagehand.act("Click the submit button (button[type='submit'])");
    await page.waitForTimeout(2000);

    const donacionResult = await stagehand.extract(`
      Verify the completion of the donation registration.
      Return:
      - current URL (should contain /enfermero)
      - any success or error message
    `);
    console.log("Resultado donación:", donacionResult);

    // HU5: ESTADÍSTICAS

    console.log("HU5 - Estadísticas");

    // 1. Donante bloqueado
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

    // 2. Admin ve gráficos
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
