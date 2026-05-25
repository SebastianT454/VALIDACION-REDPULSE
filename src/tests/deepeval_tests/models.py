import os
import requests
from deepeval.models import DeepEvalBaseLLM

class OllamaDeepEvalModel(DeepEvalBaseLLM):
    def __init__(self, model_name="llama3.2:3b"):
        self.model_name = model_name

    def load_model(self):
        return self.model_name

    def generate(self, prompt: str) -> str:
        response = requests.post(
            "http://127.0.0.1:11434/api/chat",
            json={
                "model": self.model_name,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
            timeout=120,
        )
        response.raise_for_status()
        return response.json()["message"]["content"]

    async def a_generate(self, prompt: str) -> str:
        return self.generate(prompt)

    def get_model_name(self):
        return f"ollama/{self.model_name}"


class GeminiDeepEvalModel(DeepEvalBaseLLM):
    def __init__(self, model_name="gemini-2.5-flash"):
        import google.generativeai as genai

        api_key = (
            os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )
        if not api_key:
            raise ValueError(
                "Falta GOOGLE_GENERATIVE_AI_API_KEY o GOOGLE_API_KEY en .env"
            )
        genai.configure(api_key=api_key)
        self.model_name = model_name
        self.model = genai.GenerativeModel(model_name)

    def load_model(self):
        return self.model

    def generate(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)
        return response.text

    async def a_generate(self, prompt: str) -> str:
        return self.generate(prompt)

    def get_model_name(self):
        return f"gemini/{self.model_name}"


def get_evaluation_model():
    provider = os.getenv("DEEPEVAL_MODEL", "gemini").lower()

    if provider == "ollama":
        ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
        return OllamaDeepEvalModel(model_name=ollama_model)

    if provider == "gemini":
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        # Corrige automáticamente si viene como: google/gemini-2.5-flash
        gemini_model = gemini_model.replace("google/", "")
        return GeminiDeepEvalModel(model_name=gemini_model)

    if provider == "openai":
        from deepeval.models import GPTModel
        return GPTModel(model=os.getenv("OPENAI_EVAL_MODEL", "gpt-4.1-mini"))

    raise ValueError(f"DEEPEVAL_MODEL no soportado: {provider}")