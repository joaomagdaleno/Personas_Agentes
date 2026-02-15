from src_local.agents.base import BaseActivePersona
from src_local.utils.cognitive_engine import CognitiveEngine
import logging

logger = logging.getLogger(__name__)

class TestRefiner(BaseActivePersona):
    """
    🧠 IntentAnalyst / TestRefiner.
    Especialista cognitivo que usa o SLM para sugerir melhorias em testes ou explicar falhas complexas.
    """
    
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name = "TestRefiner"
        self.role = "Cognitive Engineer"
        self.emoji = "🧠"
        self.stack = "Test"

    def perform_audit(self) -> list:
        """
        Neste MVP, o TestRefiner não roda varredura automática.
        Ele atua sob demanda via `analyze_failure` ou `suggest_test_case`.
        """
        return []

    def _reason_about_objective(self, objective, file, content):
        return None  # Não usado diretamente sem contexto

    def analyze_failure(self, test_file: str, error_log: str) -> str:
        """Analisa um erro de teste e sugere correção via IA."""
        prompt = f"""
        Analise o seguinte erro de teste Python:
        Arquivo: {test_file}
        Erro:
        {error_log}
        
        Sugira uma correção breve e explique a causa.
        """
        return self.reason(prompt)

    def suggest_test_case(self, code_snippet: str) -> str:
        """Gera um caso de teste para o código fornecido."""
        prompt = f"""
        Escreva um caso de teste pytest para este código:
        ```python
        {code_snippet}
        ```
        """
        return self.reason(prompt)

    def get_system_prompt(self) -> str:
        return "Você é um especialista em QA e Testes automatizados em Python."
