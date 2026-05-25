from deepeval import assert_test
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval.metrics import GEval
from deepeval_tests.common import load_login_context
from deepeval_tests.models import get_evaluation_model

def test_agent_task_completion_login():
    """
    Evalúa si el agente (Stagehand) completó correctamente la tarea de
    login en REDPULSE. Esta prueba representa el resultado obtenido por
    Stagehand después de interactuar con la página de login.
    """
    evaluation_model = get_evaluation_model()
    rag_context = [load_login_context()]

    test_case = LLMTestCase(
        input=(
            "Ejecuta el login en REDPULSE con las credenciales válidas "
            "(documento 122, Cédula de Ciudadanía, contraseña 123) y "
            "reporta si fue exitoso."
        ),
        actual_output=(
            "La tarea fue completada. El agente ingresó el documento 122, "
            "seleccionó Cédula de Ciudadanía en el tipo de documento, "
            "ingresó la contraseña, hizo clic en Ingresar y fue redirigido "
            "al dashboard principal de Red Pulse."
        ),
        expected_output=(
            "El agente debe completar el login con las credenciales del "
            "usuario regular y confirmar que fue redirigido al dashboard "
            "principal de Red Pulse."
        ),
        retrieval_context=rag_context
    )

    task_completion = GEval(
        name="Task Completion",
        criteria=(
            "Evalúa si la respuesta demuestra que el agente completó el "
            "login en REDPULSE, usó las credenciales correctas (documento, "
            "tipo de documento, contraseña) y verificó que fue redirigido "
            "al dashboard."
        ),
        evaluation_steps=[
            "Verificar que la respuesta menciona el ingreso del documento 122.",
            "Verificar que la respuesta menciona la selección de Cédula de "
            "Ciudadanía como tipo de documento.",
            "Verificar que la respuesta menciona el ingreso de la contraseña.",
            "Verificar que la respuesta confirma la redirección al dashboard.",
            "Penalizar respuestas ambiguas o que no validen el resultado final.",
        ],
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
            LLMTestCaseParams.RETRIEVAL_CONTEXT,
        ],
        model=evaluation_model,
        threshold=0.7,
    )

    assert_test(test_case, [task_completion])