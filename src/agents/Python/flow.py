from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Core: Orchestration Specialist 🌊
    Foca no controle de fluxo, lógica de roteamento e estados da aplicação.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Orchestration Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando fluxos de decisão e orquestração...")
        
        flow_rules = [
            {
                'regex': r"if .*:\s+.*if .*:\s+.*if .*:\s+.*if", 
                'issue': 'Ninhagem excessiva de IFs detectada. Considere usar o padrão Strategy ou simplificar a lógica de fluxo.', 
                'severity': 'medium'
            },
            {
                'regex': r"while True:.*break", 
                'issue': 'Loop infinito com interrupção manual detectado. Verifique se o critério de saída é robusto.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), flow_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure logical paths are clear, efficient, and robust."