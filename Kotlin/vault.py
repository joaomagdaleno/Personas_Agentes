from persona_base import BaseActivePersona
import os
import re

class VaultPersona(BaseActivePersona):
    """Especialista em faturamento Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Vault."""
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization Specialist"
        self.mission = "Manage the lifecycle of In-App Purchases and billing."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita chamadas do Google Play Billing Library."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build']]
            for file in files:
                if file.endswith('.kt'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "BillingClient" in content and "launchBillingFlow" in content and "try" not in content:
                            issues.append({'file': rel_path, 'issue': 'Fluxo de faturamento detectado sem tratamento de exceção seguro.', 'severity': 'high', 'context': 'Monetization'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on secure and frictionless revenue generation.'