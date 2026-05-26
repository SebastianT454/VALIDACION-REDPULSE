import { Stagehand } from "@browserbasehq/stagehand";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",

    model: {
      modelName: process.env.OPENAI_MODEL || "openai/gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY_JULY!,
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

    // LOGIN USUARIO

    async function loginUsuario() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);

      await stagehand.act(
        `Type ${usuario.documento} in the document number field`
      );

      await stagehand.act(
        "Select Cedula de Ciudadania in the document type dropdown"
      );

      await stagehand.act(
        `Type ${usuario.password} in the password field`
      );

      await stagehand.act(
        "Click the login button"
      );

      await page.waitForTimeout(2000);
    }

    // LOGIN ENFERMERO

    async function loginEnfermero() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);

      await stagehand.act(
        `Type ${enfermero.documento} in the document number field`
      );

      await stagehand.act(
        "Select Cedula de Ciudadania in the document type dropdown"
      );

      await stagehand.act(
        `Type ${enfermero.password} in the password field`
      );

      await stagehand.act(
        "Click the login button"
      );

      await page.waitForTimeout(2000);
    }

    // LOGIN ADMIN

    async function loginAdmin() {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1000);

      await stagehand.act(
        `Type ${admin.documento} in the document number field`
      );

      await stagehand.act(
        "Select Cedula de Ciudadania in the document type dropdown"
      );

      await stagehand.act(
        `Type ${admin.password} in the password field`
      );

      await stagehand.act(
        "Click the login button"
      );

      await page.waitForTimeout(2000);
    }

    // TEST 1 - LOGIN

    console.log("Test 1 - Login");

    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);

    await loginUsuario();

    const loginResult = await stagehand.extract(`
      Check login result.
      Return:
      - current URL
      - visible message
      - login success or failure
    `);

    console.log(loginResult);

    // TEST 2 - MOVIMIENTOS

    console.log("Test 2 - Movimientos");

    await loginUsuario();

    await stagehand.act("Click on profile section");
    await stagehand.act("Click on movimientos section");

    await page.waitForTimeout(2000);

    const movimientosResult = await stagehand.extract(`
      Check movimientos page.
      Return:
      - current URL
      - visible content
    `);

    console.log(movimientosResult);

    // TEST 3 - PUNTOS

    console.log("Test 3 - Puntos");

    await loginUsuario();

    await page.goto(`${BASE_URL}/puntos`);
    await page.waitForTimeout(2000);

    const puntosResult = await stagehand.extract(`
      Get points information.
      Return:
      - total points
      - visible cards or values
    `);

    console.log(puntosResult);

    // TEST 4 - DONACIÓN

    console.log("Test 4 - Donación");

    await loginEnfermero();

    await stagehand.act("Type 122 in the document field");
    await stagehand.act("Select Cedula de Ciudadania in dropdown");
    await stagehand.act("Click continue button");
    await stagehand.act("Click confirm button");

    await stagehand.act("Type 450 in the ml input field");
    await stagehand.act("Select date 2026-05-23 in date field");
    await stagehand.act("Click save button");

    await stagehand.act("Type 10 in points field");
    await stagehand.act("Click submit button");

    const donacionResult = await stagehand.extract(`
      Check donation result.
      Return:
      - success message
      - errors if any
      - assigned points
    `);

    console.log(donacionResult);

    // TEST 5 - FILTRAR SOLICITUDES
    
    console.log("Test 5 - Filtrar solicitudes");

    await loginAdmin();

    await page.goto(`${BASE_URL}/filtrar_solicitudes`);
    await page.waitForTimeout(2000);

    await stagehand.act("Select O+ in blood type dropdown");
    await stagehand.act("Click submit filter button");

    const filtroResult = await stagehand.extract(`
      Check filter results.
      Return:
      - selected blood type
      - visible results
    `);

    console.log(filtroResult);

    console.log("Pruebas terminadas");
  } catch (error) {
    console.error("Error:");
    console.error(error);
  } finally {
    await stagehand.close();
  }
}

main();
