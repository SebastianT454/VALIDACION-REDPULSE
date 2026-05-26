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

    // Credenciales de usuario
    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };

    // 1. Login (necesario para acceder a /solicitud_donacion)
    console.log("Haciendo login...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await stagehand.act(`Type ${usuario.documento} in the document number field`);
    await stagehand.act(`Select ${usuario.tipoDocumento} in the document type dropdown`);
    await stagehand.act(`Type ${usuario.password} in the password field`);
    await stagehand.act("Click the login button");
    await page.waitForTimeout(2000);

    // 2. Navegar a la página de solicitud
    console.log("Navegando a solicitud de donación...");
    await page.goto(`${BASE_URL}/solicitud_donacion`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // 3. OBSERVAR el formulario de solicitud
    console.log("Observando formulario de solicitud...");
    const solicitudObservations = await stagehand.observe(
      "Identify the quantity input (#quantity), reason textarea (#reason), priority dropdown (#priority), and the confirm button (.confirm-button) on this blood request page"
    );
    console.log("Elementos observados:", solicitudObservations);

    // 4. ACTUAR para llenar y enviar
    console.log("Llenando solicitud...");
    await stagehand.act("Type 450 in the quantity field");
    await stagehand.act("Type 'Prueba automatizada de solicitud' in the reason field");
    await stagehand.act("Select priority 2 in the priority dropdown");
    await stagehand.act("Click the confirm button (.confirm-button)");

    await page.waitForTimeout(2000);

    // 5. EXTRAER el resultado
    const result = await stagehand.extract(
      "Extract the success message (e.g., #success-message content) or any error message after submitting the blood request, and whether the confirmation can be dismissed"
    );
    console.log("Resultado de la solicitud:", result);

    console.log("Prueba observe-extract de Ximena completada.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await stagehand.close();
  }
}

main();