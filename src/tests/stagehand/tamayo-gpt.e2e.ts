import { Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: {
      modelName: process.env.OPENAI_MODEL || "openai/gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY_TAMAYO!,
    },
    localBrowserLaunchOptions: {
      headless: false,
    },
  });

  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];
    const BASE_URL = "http://localhost:8000";

    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123456",
    };

    async function loginUsuario() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await stagehand.act(`Type ${usuario.documento} in the document number field`);
      await stagehand.act("Select Cedula de Ciudadania in the document type dropdown");
      await stagehand.act(`Type ${usuario.password} in the password field`);
      await stagehand.act("Click the login button");
      await page.waitForTimeout(2000);
    }

    // TEST 1: SOLICITAR RECUPERACIÓN

    console.log("Test 1 - Solicitar recuperación");
    await page.goto(`${BASE_URL}/recuperar`);
    await page.waitForTimeout(1000);

    await stagehand.act("Type 000@GMAIL.COM in the email field");
    await stagehand.act("Click the submit button to request password recovery");
    await page.waitForTimeout(2000);

    const recuperacionResult = await stagehand.extract(`
      Check the password recovery request result.
      Return:
      - is #success-message.active visible? If yes, does it contain "correo valido"?
      - is #error-message.active visible? If yes, does it contain "correo no existe" or "incorrecto"?
      - are there any "Internal Server Error" messages?
    `);
    console.log(recuperacionResult);

    // TEST 2: RESTABLECER CONTRASEÑA

    console.log("Test 2 - Restablecer contraseña");

    // Iniciar recuperación nuevamente para asegurar flujo
    await page.goto(`${BASE_URL}/recuperar`);
    await page.waitForTimeout(1000);
    await stagehand.act("Type 000@GMAIL.COM in the email field");
    await stagehand.act("Click submit button");
    await page.waitForTimeout(2000);

    // Usar extract para decidir si continuar
    const recoveryCheck = await stagehand.extract(`
      Check if there is a success message (#success-message.active) visible and containing "correo valido".
      Return:
      - success: boolean
      - error: boolean
      - continue_button_visible: boolean
    `);
    console.log("Recovery check:", recoveryCheck);

    // Si hay éxito y botón continuar visible, hacer clic
    // (GPT puede decidir, pero forzamos con act)
    await stagehand.act("Click the 'Continuar' button if visible inside the success message");
    await page.waitForTimeout(2000);

    // Verificar si llegamos a la página de restablecer
    const restablecerPage = await stagehand.extract(`
      Are we on the reset password page?
      Return:
      - current URL (should contain "restablecer")
      - visible heading
    `);
    console.log(restablecerPage);

    // Llenar formulario de restablecer
    await stagehand.act("Type Ws0HJFMWR3zztZF5sGIslw in the code/token field");
    await stagehand.act("Type 123 in the new password field");
    await stagehand.act("Type 123 in the confirm password field");
    await stagehand.act("Click the submit button to reset password");
    await page.waitForTimeout(2000);

    const restablecerResult = await stagehand.extract(`
      Check the result of the password reset.
      Return:
      - is #success-message.active visible with text like "contraseña restaurada/restablecida/actualizada"?
      - is #error-message.active visible with text about different passwords or wrong code?
      - any "Internal Server Error"?
    `);
    console.log(restablecerResult);

    // TEST 3: EDITAR FOTO DE PERFIL

    console.log("Test 3 - Editar foto de perfil");
    await loginUsuario();
    await stagehand.act("Click on 'Perfil' link or button");
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log("URL perfil:", currentUrl);

    // Subir archivo usando setInputFiles (más fiable que stagehand.act para archivos)
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(base64Image, 'base64');
    await page.locator('#file-input').setInputFiles({
      name: 'perfil-test.png',
      mimeType: 'image/png',
      buffer: buffer
    });
    await page.waitForTimeout(2000);

    const fotoResult = await stagehand.extract(`
      Check if the profile picture update was attempted.
      Return:
      - any visible success or error message after file upload
      - does the page contain "Internal Server Error"?
    `);
    console.log(fotoResult);

    console.log("Pruebas de Tamayo terminadas.");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await stagehand.close();
  }
}

main();
