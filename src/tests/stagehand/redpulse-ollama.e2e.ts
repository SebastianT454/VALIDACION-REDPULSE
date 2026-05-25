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

    const usuario = {
      documento: "122",
      tipoDocumento: "Cedula de Ciudadania",
      password: "123"
    };

    const enfermero = {
      documento: "112233",
      tipoDocumento: "Cedula de Ciudadania",
      password: "112233"
    };

    const admin = {
      documento: "000",
      tipoDocumento: "Cedula de Ciudadania",
      password: "000"
    };

    // Login usuario
    
    async function loginUsuario() {

      await page.goto(`${BASE_URL}/login`);

      await page.waitForTimeout(1000);

      await page.locator('input[name="numero_documento"]')
        .fill(usuario.documento);

      await page.locator('select[name="tipo_documento"]')
        .selectOption(usuario.tipoDocumento);

      await page.locator('input[name="contrasena"]')
        .fill(usuario.password);

      await page.locator('button')
        .click();

      await page.waitForTimeout(2000);
    }

    // Login enfermero

    async function loginEnfermero() {

      await page.goto(`${BASE_URL}/login`);

      await page.waitForTimeout(1000);

      await page.locator('input[name="numero_documento"]')
        .fill(enfermero.documento);

      await page.locator('select[name="tipo_documento"]')
        .selectOption(enfermero.tipoDocumento);

      await page.locator('input[name="contrasena"]')
        .fill(enfermero.password);

      await page.locator('button')
        .click();

      await page.waitForTimeout(2000);
    }

    // Login admin

    async function loginAdmin() {

      await page.goto(`${BASE_URL}/login`);

      await page.waitForTimeout(1000);

      await page.locator('input[name="numero_documento"]')
        .fill(admin.documento);

      await page.locator('select[name="tipo_documento"]')
        .selectOption(admin.tipoDocumento);

      await page.locator('input[name="contrasena"]')
        .fill(admin.password);

      await page.locator('button')
        .click();

      await page.waitForTimeout(2000);
    }

    // TEST 1 - LOGIN

    console.log("Test 1 - Login");

    await page.goto(`${BASE_URL}/login`);

    await page.waitForTimeout(1000);

    console.log(
      await page.locator('input[name="numero_documento"]').isVisible()
    );

    await loginUsuario();

    const loginResult = await stagehand.extract(`
      Check if login worked.
      Return:
      - current URL
      - visible message
      - login status
    `);

    console.log(loginResult);

    // TEST 2 - MOVIMIENTOS

    console.log("Test 2 - Movimientos");

    await loginUsuario();

    await page.locator('text=/perfil/i').click();

    await page.waitForTimeout(1000);

    await page.locator('text=/movimientos/i').click();

    await page.waitForTimeout(2000);

    const movimientosResult = await stagehand.extract(`
      Check if movimientos page loaded.
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
      Get points info from the page.
      Return:
      - total points
      - visible cards
    `);

    console.log(puntosResult);

    // TEST 4 - DONACION

    console.log("Test 4 - Donación");

    await loginEnfermero();

    await page.locator('input[placeholder="Ingrese la cédula"]')
      .fill('122');

    await page.locator('select')
      .selectOption('Cedula de Ciudadania');

    await page.locator('button')
      .click();

    await page.waitForTimeout(2000);

    await page.locator('button')
      .click();

    await page.waitForTimeout(2000);

    await page.locator('input[placeholder="Ingrese la cantidad en ml"]')
      .fill('450');

    await page.locator('input[type="date"]')
      .fill('2026-05-23');

    await page.locator('button')
      .click();

    await page.waitForTimeout(2000);

    await page.locator('input[name="puntos"]')
      .fill('10');

    await page.locator('button')
      .click();

    await page.waitForTimeout(2000);

    const donacionResult = await stagehand.extract(`
      Check if donation was saved.
      Return:
      - success message
      - errors
      - assigned points
    `);

    console.log(donacionResult);

    // TEST 5 - FILTRAR

    console.log("Test 5 - Filtrar solicitudes");

    await loginAdmin();

    await page.goto(`${BASE_URL}/filtrar_solicitudes`);

    await page.waitForTimeout(2000);

    await page.locator('#tipo_sangre')
      .selectOption('O+');

    await page.locator('button[type="submit"]')
      .click();

    await page.waitForTimeout(2000);

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