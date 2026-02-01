from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: PhD in Software Verification & Reliability Strategy 🧪
    Estrategista que interpreta dados de verificação Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Testify", "🧪", "PhD QA Strategist", "Flutter"
        # Agentes de Suporte ao QA
        from src.agents.Support.test_runner import TestRunner
        from src.agents.Support.quality_analyst import QualityAnalyst
        from src.agents.Support.pyramid_analyst import PyramidAnalyst
        self.runner = TestRunner()
        self.analyst = QualityAnalyst()
        self.pyramid_analyst = PyramidAnalyst()

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Confiabilidade Estratégica Flutter...")
        
        audit_rules = [
            {'regex': r"expect\(.*?\s*,\s*true\)", 'issue': 'Asserção Fraca: Teste validando booleano genérico.', 'severity': 'low'},
            {'regex': r"testWidgets\((?!.*pumpAndSettle)", 'issue': 'Teste Incompleto: Widget Test sem processamento de frames.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def run_test_suite(self):
        """DELEGAÇÃO: Execução Flutter."""
        return self.runner.run_unittest_discover(self.project_root)

    def analyze_test_quality_matrix(self, map_data=None):
        """DELEGAÇÃO: Matriz Flutter."""
        data = map_data if map_data is not None else self.context_data
        return self.analyst.calculate_confidence_matrix(data)

    def analyze_test_pyramid(self, map_data=None):
        """DELEGAÇÃO: Distribuição Flutter."""
        data = map_data if map_data is not None else self.context_data
        return self.pyramid_analyst.analyze(data, self.read_project_file)

    def _reason_about_objective(self, objective, file, content):
        if "test" not in content.lower():
            return f"Fragilidade de Regressão: O objetivo '{objective}' exige robustez. Em '{file}', a falta de testes automatizados ameaça a integridade da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da confiabilidade técnica Flutter."
