import { Stagehand } from '@browserbasehq/stagehand';

function toBoolean(
  value: string | undefined,
  defaultValue = false
): boolean {

  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

export function createOllamaStagehand(): Stagehand {

  const modelName =
    process.env.OLLAMA_MODEL || 'llama3.1';

  return new Stagehand({
    env: 'LOCAL',

    model: `ollama/${modelName}`,

    localBrowserLaunchOptions: {
      headless: toBoolean(
        process.env.HEADLESS,
        false
      )
    }
  });
}