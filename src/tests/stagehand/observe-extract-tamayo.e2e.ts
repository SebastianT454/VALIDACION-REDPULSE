import { Stagehand } from "@browserbasehq/stagehand";
import 'dotenv/config';

async function main() {
  const model = `ollama/${process.env.OLLAMA_MODEL || "llama3.1"}`;
  const stagehand = new Stagehand({
    env: "LOCAL",
    model,
    localBrowserLaunchOptions: {
      headless: process.env.HEADLESS === "true" ? true : false,
    }
  });

  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];
    const BASE_URL = "http://localhost:8000";

    // ----- FASE 1: Solicitar recuperación -----
    console.log("Fase 1: Solicitar recuperación de contraseña");
    await page.goto(`${BASE_URL}/recuperar`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    console.log("Observando formulario de recuperación...");
    const recoveryForm = await stagehand.observe(
      "Identify the email input field, the submit button, and any instruction text on the password recovery page"
    );
    console.log(recoveryForm);

    console.log("Enviando solicitud con email...");
    await stagehand.act("Type 000@GMAIL.COM in the email field");
    await stagehand.act("Click the submit button");
    await page.waitForTimeout(2000);

    const recoveryResult = await stagehand.extract(
      "Extract the visible message: success message content or error message content, and whether a 'Continuar' button is present"
    );
    console.log("Resultado recuperación:", recoveryResult);

    // Si hay botón Continuar, hacemos clic
    await stagehand.act("Click the 'Continuar' button if visible");
    await page.waitForTimeout(1500);

    // ----- FASE 2: Restablecer contraseña -----
    console.log("Fase 2: Restablecer contraseña");

    console.log("Observando página de restablecimiento...");
    const resetForm = await stagehand.observe(
      "Find the token/code input, new password field, confirm password field, and submit button"
    );
    console.log(resetForm);

    await stagehand.act("Type Ws0HJFMWR3zztZF5sGIslw in the token field");
    await stagehand.act("Type 123 in the new password field");
    await stagehand.act("Type 123 in the confirm password field");
    await stagehand.act("Click the submit button");
    await page.waitForTimeout(2000);

    const finalResult = await stagehand.extract(
      "Extract the success or error message after attempting to reset the password"
    );
    console.log("Resultado restablecimiento:", finalResult);

    console.log("Prueba observe-extract de Tamayo completada.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await stagehand.close();
  }
}

main();
