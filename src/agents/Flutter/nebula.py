from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: Flutter Backend Specialist ☁️
    Foca na integração com BaaS (Firebase, Supabase) e infraestrutura mobile.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Backend Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando integração com serviços em nuvem...")
        
        nebula_rules = [
            {
                'regex': r"FirebaseFirestore\.instance", 
                'issue': 'Uso do Firestore detectado. Garanta que as regras de segurança (Security Rules) estejam configuradas no console.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.dart'), nebula_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Power the app with a robust and scalable backend."
