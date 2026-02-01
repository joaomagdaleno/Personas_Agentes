from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: PhD in Behavioral Science & Android Growth Engineering 📣
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hype", "📣", "PhD Growth Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de ASO integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Crescimento...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"com\.example", 'issue': 'Baixa Credibilidade: Package name genérico.', 'severity': 'high'},
            {'regex': r"android:host", 'issue': 'Aquisição: Deep Link detectado.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.xml', '.kt'), rules)
        
        duration = time.time() - start_time
        logger.info(f"📣 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "com.example" in content:
            return f"Invisibilidade de Produto: O objetivo '{objective}' exige escala. Em '{file}', identificadores amadores barram a expansão da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da presença digital Kotlin."
