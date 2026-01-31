from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Core: Diagnostics Specialist 🔍
    Foca na detecção de "smells" de código, lógica inacabada e padrões de erro silenciosos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🔍"
        self.role = "Diagnostics Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """
        Individualidade: Regras de diagnósticos e detecção de bugs.
        """
        logger.info(f"[{self.name}] Iniciando varredura de diagnósticos e integridade lógica...")
        
        # O Core do Probe: O que ele procura para evitar bugs
        diagnostic_rules = [
            {
                'regex': r"except:\s+pass", 
                'issue': 'Captura de erro silenciosa (pass). Prática perigosa que esconde a causa raiz de bugs.', 
                'severity': 'high'
            },
            {
                'regex': r"(TODO|FIXME):", 
                'issue': 'Marcador de código pendente detectado. O código pode estar incompleto.', 
                'severity': 'medium'
            },
            {
                'regex': r"print\([^)]+\)", # Melhora para não pegar definições
                'issue': 'Uso de print() detectado. Para produção, prefira o uso de logging apropriado.', 
                'severity': 'low'
            },
            {
                'regex': r"assert\s+False\b", 
                'issue': 'Assert False detectado. Isso forçará uma quebra do programa se atingido.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py'), diagnostic_rules)

    def analyze_logic(self, file_path):
        """
        O Probe usa o AST da Base para ser o mais rigoroso na 'letra errada'.
        """
        # O Probe herda a análise de 'pass' e 'sintaxe' da Base
        issues = super().analyze_logic(file_path)
        
        # Adicionalmente, o Probe poderia olhar para variáveis não utilizadas
        # ou funções excessivamente complexas no futuro.
        return issues

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Identify bugs, code smells, and logical inconsistencies."