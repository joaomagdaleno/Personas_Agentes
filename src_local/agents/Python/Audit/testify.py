from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: PhD in Software Verification & Reliability Strategy 🧪
    Estrategista que interpreta dados de verificação delegados a assistentes.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Testify", "🧪", "PhD QA Strategist", "Python"
        # Agentes de Suporte ao QA
        from src_local.agents.Support.test_runner import TestRunner
        from src_local.agents.Support.quality_analyst import QualityAnalyst
        from src_local.agents.Support.pyramid_analyst import PyramidAnalyst
        self.runner = TestRunner()
        self.analyst = QualityAnalyst()
        self.pyramid_analyst = PyramidAnalyst()

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Confiabilidade Estratégica...")
        
        audit_rules = [
            {'regex': 'def test_.*:\\s+pass', 'issue': 'Vazio: Teste sem asserções.', 'severity': 'critical'},
            {'regex': r"hypothesis", 'issue': 'Avançado: Teste de Propriedade detectado.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py', '.dart', '.kt'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def run_test_suite(self):
        """DELEGAÇÃO: Executa testes via TestRunner e interpreta falhas."""
        logger.info("🧪 [Testify] Solicitando execução mecânica ao TestRunner...")
        metrics = self.runner.run_unittest_discover(self.project_root)
        
        # O estrategista adiciona a interpretação humana/PhD ao resultado bruto
        if not metrics["success"]:
            metrics["interpretation"] = self._interpret_failures(metrics.get("raw_output", ""))
            
        return metrics

    def _interpret_failures(self, raw_output):
        """Motor de Raciocínio sobre falhas (Visão PhD)."""
        if "ModuleNotFoundError" in raw_output: return "Quebra de dependência estrutural."
        if "AssertionError" in raw_output: return "Desvio de lógica funcional."
        return "Instabilidade técnica indeterminada."

    def analyze_test_quality_matrix(self, map_data=None):
        """DELEGAÇÃO: Calcula matriz de confiança via QualityAnalyst."""
        data = map_data if map_data is not None else self.context_data
        return self.analyst.calculate_confidence_matrix(data)

    def analyze_test_pyramid(self, map_data=None):
        """DELEGAÇÃO: Auditoria de distribuição delegada ao PyramidAnalyst."""
        data = map_data if map_data is not None else self.context_data
        return self.pyramid_analyst.analyze(data, self.read_project_file)

    def _reason_about_objective(self, objective, file, content):
        """Raciocínio sobre a profundidade da validação técnica."""
        info = self.context_data.get(file, {})
        if file.endswith('.py') and info.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"]:
            if not info.get("has_test", False):
                return f"Exposição de Risco: O objetivo '{objective}' exige confiança. O módulo '{file}' é Matéria Escura (Sem testes detectados)."
        
        # Detecção de testes vazios agora delegada ao AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, estrategista de QA. Sua missão é garantir que o projeto siga a pirâmide de testes 70/20/10 e atinja 100% de confiança."
