import { Stagehand } from "@browserbasehq/stagehand";

function toBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}

export function createOpenAIStagehand(): Stagehand {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "openai/gpt-4.1-mini";

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Falta OPENAI_API_KEY. Configura el .env o usa npm run test:ollama."
    );
  }

  return new Stagehand({
    env: "LOCAL",

    // modelo de OpenAI
    model: {
      modelName: model,
      apiKey,
    },

    // si el navegador corre visible o no
    localBrowserLaunchOptions: {
      headless: toBoolean(process.env.HEADLESS, false),
    },
  });
}