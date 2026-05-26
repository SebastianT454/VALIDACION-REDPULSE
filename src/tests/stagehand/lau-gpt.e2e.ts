import { Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: {
      modelName: process.env.OPENAI_MODEL || "openai/gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY_LAU!,
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
    const admin = {
      documento: "000",
      tipoDocumento: "Cedula de Ciudadania",
      password: "000",
    };

    const donante = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123456",
    };

    const nuevoUsuario = {
      nombre: "Laura",
      apellido: "García",
      tipoDocumento: "Cedula de Ciudadania",
      documento: "789012",
      tipoSangre: "O+",
      correo: "laura.test@redpulse.com",
      password: "123456",
    };

    // Funciones de login con stagehand.act
    async function loginAdmin() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${admin.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${admin.password} in the password field`);
      await stagehand.act("Click the login button");
      await page.waitForTimeout(2000);
    }

    async function loginDonante() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${donante.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${donante.password} in the password field`);
      await stagehand.act("Click the login button");
      await page.waitForTimeout(2000);
    }

    // ---------- TEST 1: Registro ----------
    console.log("Test 1 - Registro");
    await page.goto(`${BASE_URL}/registro`);
    await page.waitForTimeout(1000);

    await stagehand.act(`Type ${nuevoUsuario.nombre} in the nombre field`);
    await stagehand.act(`Type ${nuevoUsuario.apellido} in the apellido field`);
    await stagehand.act("Select Cedula de Ciudadania in the tipo_documento dropdown");
    await stagehand.act(`Type ${nuevoUsuario.documento} in the numero_documento field`);
    await stagehand.act("Select O+ in the tipo_de_sangre dropdown");
    await stagehand.act(`Type ${nuevoUsuario.correo} in the correo field`);
    await stagehand.act(`Type ${nuevoUsuario.password} in the contrasena field`);
    await stagehand.act(`Type ${nuevoUsuario.password} in the confirmar_contrasena field`);
    await stagehand.act("Click the submit button or the Registrarse button");
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

    // Con stagehand.act podemos hacer clic en el botón de aprobar
    await stagehand.act("Click the first approve button (.approve-button) if it exists");
    await page.waitForTimeout(1000);

    const aceptarResult = await stagehand.extract(`
      Check if an approval action was attempted.
      Return:
      - current URL
      - any success or confirmation message
    `);
    console.log(aceptarResult);

    // ---------- TEST 3: Rechazar solicitud ----------
    console.log("Test 3 - Rechazar solicitud");
    await loginAdmin();
    await page.goto(`${BASE_URL}/solicitudes_pendientes`);
    await page.waitForTimeout(2000);

    await stagehand.act("Click the first reject button (.reject-button) if it exists");
    await page.waitForTimeout(1000);

    const rechazarResult = await stagehand.extract(`
      Check if a rejection action was attempted.
      Return:
      - current URL
      - any confirmation or error message
    `);
    console.log(rechazarResult);

    // ---------- TEST 4: Chatbot donante ----------
    console.log("Test 4 - Chatbot donante");
    await loginDonante();
    await stagehand.act("Click on ChatBot link or button");
    await page.waitForTimeout(1500);

    const chatbotResult = await stagehand.extract(`
      Verify the chatbot page.
      Return:
      - current URL (should contain /chatbot)
      - is the chat window visible?
      - does a bot message contain "Hola"?
    `);
    console.log(chatbotResult);

    // ---------- TEST 5: Notificaciones de escasez ----------
    console.log("Test 5 - Notificaciones");
    await loginDonante();
    await stagehand.act("Click on Notificaciones link or button");
    await page.waitForTimeout(1500);

    const notificacionesResult = await stagehand.extract(`
      Verify the notifications page.
      Return:
      - current URL (should contain /notificaciones)
      - is heading "Notificaciones" visible?
      - is the message "No tienes notificaciones" visible?
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