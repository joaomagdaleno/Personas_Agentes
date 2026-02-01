from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Core: PhD in Topology & Reactive Navigation (Flutter) 🌊
    Especialista em gestão de rotas, navegação profunda e UX flow em Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Flow", "🌊", "PhD Navigation Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Fluxos de Navegação Flutter...")
        
        audit_rules = [
            {'regex': r"Navigator\.push\(", 'issue': 'Aviso: Uso de navegação direta. Prefira rotas nomeadas ou GoRouter.', 'severity': 'low'},
            {'regex': r"pushNamed\(['\"].*?['"]\)", 'issue': 'Fragilidade: Rota via String bruta. Use constantes tipadas.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "pushNamed" in content:
            return f"Entropia Lógica: O objetivo '{objective}' exige previsibilidade. Em '{file}', o uso de Strings para navegação pode quebrar a 'Orquestração de Inteligência Artificial' em runtime."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura de fluxos Flutter."