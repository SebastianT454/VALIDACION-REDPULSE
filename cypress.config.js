import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "sd86db",
  e2e: {
    supportFile: "cypress/support/e2e.js",
    baseUrl: "http://localhost:8000",
  },
});