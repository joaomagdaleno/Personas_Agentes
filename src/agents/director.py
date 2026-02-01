from src.agents.base import BaseActivePersona
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
        from src.agents.Support.report_formatter import ReportFormatter
        self.formatter = ReportFormatter()

    def perform_audit(self):
        """O Diretor não realiza auditoria estática direta."""
        return []

    def _reason_about_objective(self, objective, file, content):
        """O Diretor sintetiza, não realiza raciocínio individual em arquivos."""
        return None

    def format_360_report(self, health_data, audit_results):
        """Formata o Relatório de Consciência Sistêmica via delegação total."""
        report = self.formatter.format_header(health_data)
        report += self.formatter.format_vitals(health_data)
        report += self.formatter.format_efficiency(health_data)
        report += self.formatter.format_entropy(health_data)
        report += self.formatter.format_quality_matrix(health_data)
        report += self.formatter.format_battle_plan(audit_results)
        return report + "## 💀 Risco Existencial\n> Autoconsciência nativa ativa.\n"

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
