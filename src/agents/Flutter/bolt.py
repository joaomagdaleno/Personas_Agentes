from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Core: Flutter Performance Specialist ⚡
    Foca em otimização de renderização, redução de builds e eficiência de memória no Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando performance do Widget Tree e Renderização...")
        
        flutter_performance_rules = [
            {
                'regex': r"setState\(\(\) \{\}\)", 
                'issue': 'setState vazio detectado. Isso dispara um build desnecessário.', 
                'severity': 'medium'
            },
            {
                'regex': r"ListView\(", 
                'issue': 'ListView sem construtor .builder detectada. Para listas longas, isso causa alto consumo de memória.', 
                'severity': 'high'
            },
            {
                'regex': r"Opacity\(", 
                'issue': 'Widget Opacity detectado. Para animações, prefira AnimatedOpacity ou Opacity direto no decorador para evitar saveLayer.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), flutter_performance_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the Flutter app runs at a constant 60/120 FPS."
