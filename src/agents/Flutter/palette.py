from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Core: PhD in Design Systems & UX Harmony (Flutter) 🎨
    Especialista em Material 3, consistência visual e acessibilidade Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Palette", "🎨", "PhD UX Designer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Estética e UX Flutter...")
        
        audit_rules = [
            {'regex': r"color\s*:\s*Colors\.\w+", 'issue': 'Aviso: Cor hardcoded detectada. Prefira usar o sistema de temas (Theme.of).', 'severity': 'low'},
            {'regex': r"semanticsLabel\s*:\s*null", 'issue': 'Acessibilidade: Elemento visual sem rótulo de semântica.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "Colors." in content:
            return f"Fragmentação Visual: O objetivo '{objective}' exige deleite. Em '{file}', o uso de cores fixas impede que a 'Orquestração de Inteligência Artificial' mantenha consistência de marca."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em design sistêmico Flutter."
