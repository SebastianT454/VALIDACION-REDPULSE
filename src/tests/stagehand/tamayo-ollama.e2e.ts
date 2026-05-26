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

    // Credenciales (usuario estándar para login normal)
    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };

    async function loginUsuario() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);
      await page.locator('input[name="numero_documento"]').fill(usuario.documento);
      await page.locator('select[name="tipo_documento"]').selectOption(usuario.tipoDocumento);
      await page.locator('input[name="contrasena"]').fill(usuario.password);
      await page.locator('button').click();
      await page.waitForTimeout(2000);
    }


    // TEST 1: SOLICITAR RECUPERACIÓN

    console.log("Test 1 - Solicitar recuperación");
    await page.goto(`${BASE_URL}/solicitar_recuperacion`); // Asumiendo ruta de recuperación
    await page.waitForTimeout(1000);

    // Llenar el campo de correo
    const emailField = page.locator('input[name="correo"]'); // Ajusta el selector según tu HTML
    await emailField.fill("000@gmail.com");
    await page.locator('button[type="submit"]').click(); // o el botón correspondiente
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

    // Volver a solicitar recuperación para iniciar el flujo
    await page.goto(`${BASE_URL}/solicitar_recuperacion`);
    await page.waitForTimeout(1000);
    await page.locator('input[name="correo"]').fill("000@gmail.com");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verificar si el mensaje de éxito está presente y hacer clic en "Continuar"
    const successVisible = await page.locator('#success-message.active').isVisible().catch(() => false);
    if (successVisible) {
      console.log("Éxito en solicitud de recuperación. Continuando...");
      await page.locator('button:has-text("Continuar")').click();
      await page.waitForTimeout(2000);

      // Deberíamos estar en la página de restablecer
      const restablecerResult1 = await stagehand.extract(`
        Check if we are on the reset password page.
        Return:
        - current URL (should contain "restablecer")
        - visible heading text (like "Recupera tu contraseña")
      `);
      console.log(restablecerResult1);

      // Ingresar código y nueva contraseña
      // Asume campos: token y nueva contraseña + confirmar
      await page.locator('input[name="codigo"]').fill("Ws0HJFMWR3zztZF5sGIslw");
      await page.locator('input[name="nueva_contrasena"]').fill("123");
      await page.locator('input[name="confirmar_contrasena"]').fill("123");
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      const restablecerResult2 = await stagehand.extract(`
        Check the result of the password reset.
        Return:
        - is #success-message.active visible with text "contraseña restaurada/restablecida/actualizada"?
        - is #error-message.active visible with text about different passwords or wrong code?
        - any "Internal Server Error"?
      `);
      console.log(restablecerResult2);

    } else {
      // Si el mensaje fue de error, lo mostramos
      const errorVisible = await page.locator('#error-message.active').isVisible().catch(() => false);
      if (errorVisible) {
        const errorText = await page.locator('#error-message.active').textContent();
        console.log("Error en recuperación:", errorText);
      }
    }

    // TEST 3: EDITAR FOTO DE PERFIL

    console.log("Test 3 - Editar foto de perfil");
    await loginUsuario();
    await page.locator('text=Perfil').click();
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    console.log("URL perfil:", currentUrl);

    // Subir imagen (pequeña PNG en base64)
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
