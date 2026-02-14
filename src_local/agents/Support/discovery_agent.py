import logging

logger = logging.getLogger(__name__)

class DiscoveryAgent:
    """Agente especialista em descoberta topológica e escaneamento de segurança."""
    
    def __init__(self, orchestrator):
        self.orc = orchestrator

    def run_discovery_phase(self):
        """Executa Auditoria Estratégica e Scan de Ofuscação."""
        ctx = self.orc.context_engine.analyze_project()
        findings = self.orc.run_strategic_audit(ctx, include_history=False)
        findings.extend(self.orc._run_obfuscation_scan())
        return ctx, findings
