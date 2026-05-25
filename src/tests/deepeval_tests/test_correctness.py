from deepeval import assert_test
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams
from deepeval_tests.models import get_evaluation_model

def test_login_result_correctness():
    """
    Evalúa si el resultado del login en REDPULSE es correcto,
    comparando la salida real con la esperada.
    """
    evaluation_model = get_evaluation_model()

    test_case = LLMTestCase(
        input="Interpretar el resultado del login en REDPULSE.",
        actual_output=(
            "El login fue exitoso. El sistema redirigió al dashboard de "
            "Red Pulse, mostrando el panel principal con las opciones de "
            "perfil, movimientos y puntos."
        ),
        expected_output=(
            "El login fue exitoso y el sistema redirigió al dashboard "
            "principal de Red Pulse."
        ),
    )

    correctness = GEval(
        name="Login Result Correctness",
        criteria=(
            "Evalúa si la salida corresponde correctamente al mensaje "
            "esperado después del login exitoso en REDPULSE: redirección "
            "al dashboard principal con las opciones disponibles."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        threshold=0.7,
        model=evaluation_model,
    )

    assert_test(test_case, [correctness])