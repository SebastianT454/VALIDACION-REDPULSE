import { Stagehand } from "@browserbasehq/stagehand";
import 'dotenv/config';

async function main() {
  // Configuración desde variables de entorno o valor por defecto
  const model = `ollama/${process.env.OLLAMA_MODEL || "llama3.1"}`;
  
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: model,
    localBrowserLaunchOptions: {
      headless: process.env.HEADLESS === "true" ? true : false,
    }
  });

  try {
    await stagehand.init();

    const page = stagehand.context.pages()[0];

    const BASE_URL = "http://localhost:8000";

    // Credenciales de prueba (usuario estándar)
    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };

    // 1. OBSERVAR el formulario de login

    console.log("Abriendo página de login...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded"
    });

    console.log("Observando elementos del formulario de login...");
    const loginObservations = await stagehand.observe(
      "Identify the document number input, document type dropdown, password input, and the submit button on this login form"
    );
    console.log("Elementos observados:", loginObservations);

    // 2. ACTUAR para llenar el login con IA

    console.log("Ejecutando login con IA...");
    await stagehand.act(`Type ${usuario.documento} in the document number field`);
    await stagehand.act(`Select ${usuario.tipoDocumento} from the document type dropdown`);
    await stagehand.act(`Type ${usuario.password} in the password field`);
    await stagehand.act("Click the login button");

    await page.waitForTimeout(3000);


    // 3. EXTRAER resultado del login

    console.log("Extrayendo resultado del login...");
    const loginResult = await stagehand.extract(
      "Extract the visible confirmation message or dashboard title after login, and the current URL"
    );
    console.log("Resultado del login:", loginResult);

    // 4. OBSERVAR el dashboard principal

    console.log("Observando el dashboard después del login...");
    const dashboardObservations = await stagehand.observe(
      "Identify navigation links or buttons on the main page (perfil, movimientos, puntos, etc.)"
    );
    console.log("Elementos del dashboard:", dashboardObservations);

    // 5. ACTUAR para navegar a Movimientos

    console.log("Navegando a la sección de Movimientos...");
    await stagehand.act("Click on the 'movimientos' link or navigate to the movimientos section");
    await page.waitForTimeout(2000);

    // 6. EXTRAER información de la página de Movimientos

    console.log("Extrayendo contenido de la página de Movimientos...");
    const movimientosResult = await stagehand.extract(
      "Extract the current URL and any visible transaction data, headings or messages on the movimientos page"
    );
    console.log("Resultado de Movimientos:", movimientosResult);

    console.log("Prueba observe/extract completada exitosamente.");

  } catch (error) {
    console.error("La prueba observe/extract falló:", error);
  } finally {
    await stagehand.close();
  }
}

main();