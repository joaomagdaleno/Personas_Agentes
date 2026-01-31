from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Core: Performance Specialist ⚡
    Foca no 'Como' e 'Por que' o código pode estar lento ou consumindo recursos indevidos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """
        Individualidade: Regras específicas de Performance.
        Aqui definimos o conhecimento exclusivo do Bolt.
        """
        logger.info(f"[{self.name}] Iniciando auditoria de performance...")
        
        # O Core do Bolt: O que ele procura especificamente
        performance_rules = [
            {
                'regex': r"for .* in .*:.*time\.sleep", 
                'issue': 'Polling ineficiente: time.sleep dentro de loop bloqueia a thread principal.', 
                'severity': 'high'
            },
            {
                'regex': r"while True:.*time\.sleep", 
                'issue': 'Loop de espera ativa detectado. Considere usar Eventos ou Asyncio.', 
                'severity': 'medium'
            },
            {
                'regex': r"\[.*for .* in .* if .*\]", # List comprehension complexa
                'issue': 'List comprehension potencialmente pesada. Avalie o uso de Generators para economizar memória.', 
                'severity': 'low'
            }
        ]
        
        # Usa o motor da Base para aplicar essas regras
        return self.find_patterns(('.py'), performance_rules)

    def analyze_logic(self, file_path):
        """
        Análise de 'Cada Letra': Bolt olha para a eficiência da Árvore de Sintaxe.
        """
        issues = super().analyze_logic(file_path) # Pega erros de sintaxe da Base
        
        # Adiciona lógica individual do Bolt (ex: detectar recursão sem caso base)
        # Isso será expandido conforme evoluirmos o Bolt individualmente.
        return issues

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Optimize execution speed and resource usage."