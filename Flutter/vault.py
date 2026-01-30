from persona_base import BaseActivePersona
import os
import re

class VaultPersona(BaseActivePersona):
    """Especialista em faturamento Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Vault."""
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization Specialist"
        self.mission = "Manage In-App Purchases, subscriptions and payment gateways."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita fluxos de pagamento e segurança financeira."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', '.dart_tool']]
            for file in files:
                if file.endswith('.dart'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "in_app_purchase" in content and "await" not in content:
                            issues.append({'file': rel_path, 'issue': 'Chamada de IAP sem tratamento assíncrono seguro detectada.', 'severity': 'high', 'context': 'Monetization'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on secure revenue generation and frictionless UX.'