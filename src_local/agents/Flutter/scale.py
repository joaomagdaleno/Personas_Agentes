from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Core: PhD in System Architecture & Scalability (Flutter) 🏗️
    Especialista em modularidade, gestão de pacotes e padrões arquiteturais Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scale", "🏗️", "PhD Software Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Escalabilidade Flutter...")
        
        audit_rules = [
            {'regex': r'import\s+[\'"]package:.*?/src/.*?[\'"]', 'issue': 'Acoplamento: Importação de pastas internas (/src/) de outros pacotes detectada.', 'severity': 'high'},
            {'regex': r"global\s+", 'issue': 'Risco de Escalabilidade: Uso de estado global detectado.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = '/src/'
        if kw in content and "import" in content and "rules =" not in content:
            return f"Violência Arquitetural: O objetivo '{objective}' exige modularidade soberana. Em '{file}', o acesso a diretórios privados (/src) de pacotes externos compromete o isolamento da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em sistemas de larga escala Flutter."
