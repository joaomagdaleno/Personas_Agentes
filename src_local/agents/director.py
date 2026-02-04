from src_local.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class DirectorPersona(BaseActivePersona):
    """
    Model: O Diretor PhD 🏛️
    Estrategista de diagnóstico que delega a formatação para assistentes.
    """
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name, self.emoji, self.role = "Director", "🏛️", "Master Orchestrator"
        self.mission = "Drive specialized agents to project excellence."
        # Agente de Suporte à Formatação
        from src_local.agents.Support.report_formatter import ReportFormatter
        self.formatter = ReportFormatter()

    def perform_audit(self):
        """O Diretor não realiza auditoria estática direta."""
        return []

    def _reason_about_objective(self, objective, file, content):
        """O Diretor sintetiza, não realiza raciocínio individual em arquivos."""
        return None

    def format_360_report(self, health_data, audit_results):
        """
        Formata o Relatório de Consciência Sistêmica.
        Garante que os dados do cabeçalho e sinais vitais venham estritamente do health_data.
        """
        # Limpa deduplicação final antes de enviar para os formatadores
        unique_results = []
        seen = set()
        for r in audit_results:
            if isinstance(r, dict):
                key = f"{r.get('file')}:{r.get('line')}:{r.get('issue')}"
            else:
                key = str(r)
                
            if key not in seen:
                unique_results.append(r)
                seen.add(key)

        # Separação de Achados de Ofuscação (Higiene de Código)
        obfuscation_findings = [r for r in unique_results if isinstance(r, dict) and r.get('context') == 'ObfuscationHunter']
        general_findings = [r for r in unique_results if not (isinstance(r, dict) and r.get('context') == 'ObfuscationHunter')]

        report = self.formatter.format_header(health_data)
        report += self.formatter.format_vitals(health_data)
        report += self.formatter.format_efficiency(health_data)
        report += self.formatter.format_entropy(health_data)
        report += self.formatter.format_quality_matrix(health_data)
        
        # Seção Dedicada a Ofuscação
        if obfuscation_findings:
            report += self.formatter.format_obfuscation_zone(obfuscation_findings)
            
        report += self.formatter.format_battle_plan(general_findings)
        return report + "## 💀 Risco Existencial\n> Autoconsciência nativa ativa.\n"

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
