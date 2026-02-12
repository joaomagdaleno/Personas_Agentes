"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO KOTLIN
Módulo: Escrivão de Documentação (Scribe)
Função: Auditar a clareza, presença de KDoc e explicabilidade do código JVM.
Soberania: ACTIVE-AGENT.
"""
from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: PhD in Technical Communication & Knowledge Management ✍️
    
    Responsabilidades:
    1. Auditoria de KDoc: Garante que classes e funções públicas possuam documentação.
    2. Clareza Semântica: Avalia se o código Kotlin comunica intenção de negócio.
    3. Explicabilidade: Garante que a lógica esteja alinhada ao Plano de Batalha PhD.
    
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scribe", "✍️", "PhD Technical Writer (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """
        🔍 Auditoria de Semântica e Documentação.
        
        Varre arquivos Kotlin em busca de lacunas documentais (KDoc) em membros
        públicos e avalia a explicabilidade do código JVM.
        """
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Documentação JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"(class|fun)\s+\w+\s+\{(?![^{]*/\*\*)", 'issue': 'Vácuo Documental: Falta KDoc público.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        """Avalia a explicabilidade da lógica frente ao objetivo de negócio."""
        if "class" in content and "/**" not in content:
            return f"Déficit de Explicabilidade: O objetivo '{objective}' exige transparência de lógica. Em '{file}', a ausência de KDoc isola a 'Orquestração de Inteligência Artificial' de sua base de conhecimento."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da semântica técnica Kotlin."
