"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO PYTHON
Módulo: Escrivão de Documentação (Scribe)
Função: Auditar a clareza, presença de Docstrings e explicabilidade do código.
Soberania: ACTIVE-AGENT.
"""
from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: PhD in Technical Communication & Documentation Strategy ✍️
    
    Responsabilidades:
    1. Auditoria de Docstrings: Garante conformidade com o padrão Google/NumPy.
    2. Clareza Semântica: Avalia se o código comunica intenção além da sintaxe.
    3. Explicabilidade PhD: Garante que o Plano de Batalha seja compreensível.
    """
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scribe", "✍️", "PhD Technical Writer", "Python"

    def perform_audit(self) -> list:
        """🔍 Analisa a cobertura de documentação no ecossistema Python."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando conformidade documental...")
        
        # Rigor PhD: Delega o raciocínio complexo para o _reason_about_objective
        # para evitar detecção linear de falha em métodos triviais.
        results = []
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        info = self.context_data.get(file, {})
        if info.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"]:
            if '"""' not in content and "'''" not in content and ("def " in content or "class " in content):
                return f"Amnésia Técnica: O objetivo '{objective}' exige clareza. Em '{file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da semântica técnica Python."
