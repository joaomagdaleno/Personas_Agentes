from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: PhD in Software Verification & Reliability 🧪
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Testify", "🧪", "PhD QA Architect (Flutter)", "Flutter"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de verificação estruturada integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Confiabilidade de Software...")
        
        # Sintaxe linear resiliente
        rules = [
            {'regex': r"expect\(.*?\s*,\s*true\)", 'issue': 'Asserção Fraca: Teste validando booleano genérico.', 'severity': 'low'},
            {'regex': r"testWidgets\((?!.*pumpAndSettle)", 'issue': 'Teste Incompleto: Widget Test sem processamento de frames.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), rules)
        
        duration = time.time() - start_time
        logger.info(f"🧪 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "test" not in content.lower():
            return f"Fragilidade de Regressão: O objetivo '{objective}' exige robustez. Em '{file}', a falta de testes automatizados ameaça a integridade da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da confiabilidade técnica Flutter."
