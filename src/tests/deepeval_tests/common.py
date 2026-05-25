from pathlib import Path

def load_login_context():
    """Carga el contexto RAG del escenario de login de REDPULSE."""
    tests_dir = Path(__file__).resolve().parent.parent
    context_path = tests_dir / "rag" / "login_context.txt"
    return context_path.read_text(encoding="utf-8")