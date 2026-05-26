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

    // Datos del nuevo usuario
    const nuevoUsuario = {
      nombre: "Laura",
      apellido: "García",
      tipoDocumento: "Cedula de Ciudadania",
      documento: "789012",
      tipoSangre: "O+",
      correo: "laura.test@redpulse.com",
      password: "123"
    };

    // 1. OBSERVAR el formulario de registro
    console.log("Navegando a la página de registro...");
    await page.goto(`${BASE_URL}/registro`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    console.log("Observando el formulario de registro...");
    const formObservations = await stagehand.observe(
      "Identify all input fields (nombre, apellido, tipo_documento, numero_documento, tipo_de_sangre, correo, contrasena, confirmar_contrasena) and the submit button on this registration form"
    );
    console.log("Elementos observados:", formObservations);

    // 2. ACTUAR para llenar el formulario
    console.log("Llenando el formulario de registro...");
    await stagehand.act(`Type ${nuevoUsuario.nombre} in the nombre field`);
    await stagehand.act(`Type ${nuevoUsuario.apellido} in the apellido field`);
    await stagehand.act(`Select ${nuevoUsuario.tipoDocumento} in the tipo_documento dropdown`);
    await stagehand.act(`Type ${nuevoUsuario.documento} in the numero_documento field`);
    await stagehand.act(`Select ${nuevoUsuario.tipoSangre} in the tipo_de_sangre dropdown`);
    await stagehand.act(`Type ${nuevoUsuario.correo} in the correo field`);
    await stagehand.act(`Type ${nuevoUsuario.password} in the contrasena field`);
    await stagehand.act(`Type ${nuevoUsuario.password} in the confirmar_contrasena field`);
    await stagehand.act("Click the submit / registrarse button");

    await page.waitForTimeout(2000);

    // 3. EXTRAER el resultado del registro
    const result = await stagehand.extract(
      "Extract the success message or any error message after submitting the registration form, and the current URL"
    );
    console.log("Resultado del registro:", result);

    console.log("Prueba observe-extract de Lau completada.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await stagehand.close();
  }
}

main();
