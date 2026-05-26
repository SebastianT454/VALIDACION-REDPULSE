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
    const admin = {
      documento: "000",
      tipoDocumento: "Cedula de Ciudadania",
      password: "000"
    };

    const donante = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };

    // Datos de registro (usuario nuevo)
    const nuevoUsuario = {
      nombre: "Laura",
      apellido: "García",
      tipoDocumento: "Cedula de Ciudadania",
      documento: "789012",
      tipoSangre: "O+",
      correo: "laura.test@redpulse.com",
      password: "123",
    };

    // ---------- Funciones de login ----------
    async function loginAdmin() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(admin.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(admin.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(admin.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }

    async function loginDonante() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(donante.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(donante.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(donante.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }

    // ---------- TEST 1: Registro ----------
    console.log("Test 1 - Registro");
    await page.goto(`${BASE_URL}/registro`);
    await page.waitForTimeout(1000);

    // Llenar formulario de registro
    await page.locator('input[name="nombre"]').fill(nuevoUsuario.nombre);
    await page.locator('input[name="apellido"]').fill(nuevoUsuario.apellido);
    await page.locator('select[name="tipo_documento"]').selectOption(nuevoUsuario.tipoDocumento);
    await page.locator('input[name="numero_documento"]').fill(nuevoUsuario.documento);
    await page.locator('select[name="tipo_de_sangre"]').selectOption(nuevoUsuario.tipoSangre);
    await page.locator('input[name="correo"]').fill(nuevoUsuario.correo);
    await page.locator('input[name="contrasena"]').fill(nuevoUsuario.password);
    await page.locator('input[name="confirmar_contrasena"]').fill(nuevoUsuario.password);
    // Hacer clic en el botón de registro (asumiendo que es un button o un submit)
    await page.locator('button[type="submit"]').click(); // o simplemente 'button'
    await page.waitForTimeout(2000);

    const registroResult = await stagehand.extract(`
      Check if registration was successful.
      Return:
      - current URL
      - visible message (success or error)
      - if redirected to login or dashboard
    `);
    console.log(registroResult);

    // ---------- TEST 2: Aceptar solicitud ----------
    console.log("Test 2 - Aceptar solicitud");
    await loginAdmin();
    await page.goto(`${BASE_URL}/solicitudes_pendientes`);
    await page.waitForTimeout(2000);

    // Buscar y hacer clic en el botón de aprobar si existe
    const approveExists = await page.locator('.approve-button').count() > 0;
    if (approveExists) {
      await page.locator('.approve-button').first().click();
      await page.waitForTimeout(1000);
    }

    const aceptarResult = await stagehand.extract(`
      Check if an approval action was attempted.
      Return:
      - current URL
      - visible message or any alert
      - status of the request after click (if visible)
    `);
    console.log(aceptarResult);

    // ---------- TEST 3: Rechazar solicitud ----------
    console.log("Test 3 - Rechazar solicitud");
    await loginAdmin();
    await page.goto(`${BASE_URL}/solicitudes_pendientes`);
    await page.waitForTimeout(2000);

    const rejectExists = await page.locator('.reject-button').count() > 0;
    if (rejectExists) {
      await page.locator('.reject-button').first().click();
      await page.waitForTimeout(1000);
    }

    const rechazarResult = await stagehand.extract(`
      Check if a rejection action was attempted.
      Return:
      - current URL
      - visible message or alert
      - status of the request after click
    `);
    console.log(rechazarResult);

    // ---------- TEST 4: Chatbot donante ----------
    console.log("Test 4 - Chatbot donante");
    await loginDonante();
    await page.goto(`${BASE_URL}/`); // asumiendo que desde el dashboard se accede al chatbot
    await page.locator('text=ChatBot').click();
    await page.waitForTimeout(1000);

    const chatbotResult = await stagehand.extract(`
      Verify the chatbot page.
      Return:
      - current URL (should include /chatbot)
      - is chat-window visible?
      - is there a bot message containing "Hola"?
    `);
    console.log(chatbotResult);

    // ---------- TEST 5: Notificaciones de escasez ----------
    console.log("Test 5 - Notificaciones");
    await loginDonante();
    await page.locator('text=Notificaciones').click();
    await page.waitForTimeout(1000);

    const notificacionesResult = await stagehand.extract(`
      Verify the notifications page.
      Return:
      - current URL (should include /notificaciones)
      - is heading "Notificaciones" visible?
      - is there a message "No tienes notificaciones"?
      - is there a link "Volver al inicio"?
    `);
    console.log(notificacionesResult);

    console.log("Pruebas de Lau terminadas.");

  } catch (error) {
    console.error("Error:");
    console.error(error);
  } finally {
    await stagehand.close();
  }
}

main();