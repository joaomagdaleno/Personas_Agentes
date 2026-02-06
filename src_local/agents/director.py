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
        # Agentes de Suporte
        from src_local.agents.Support.report_formatter import ReportFormatter
        from src_local.agents.Support.markdown_sanitizer import MarkdownSanitizer
        self.formatter = ReportFormatter()
        self.sanitizer = MarkdownSanitizer()

    def perform_audit(self):
        """O Diretor não realiza auditoria estática direta."""
        return []

    def _reason_about_objective(self, objective, file, content):
        """O Diretor sintetiza, não realiza raciocínio individual em arquivos."""
        return None

    def _deduplicate_results(self, audit_results):
        """Remove duplicatas de resultados de auditoria com normalização."""
        unique_results = []
        seen = set()
        for r in audit_results:
            if isinstance(r, dict):
                clean_issue = r.get('issue', '').rstrip('.')
                key = f"{r.get('file')}:{r.get('line')}:{clean_issue}"
            else:
                key = str(r).rstrip('.')
                
            if key not in seen:
                unique_results.append(r)
                seen.add(key)
        return unique_results

    def format_360_report(self, health_data, audit_results):
        """
        Formata o Relatório de Consciência Sistêmica.
        Garante que os dados do cabeçalho e sinais vitais venham estritamente do health_data.
        """
        unique_results = self._deduplicate_results(audit_results)

        # Separação de Achados de Ofuscação
        obf_finds = [r for r in unique_results if isinstance(r, dict) and r.get('context') == 'ObfuscationHunter']
        gen_finds = [r for r in unique_results if not (isinstance(r, dict) and r.get('context') == 'ObfuscationHunter')]

        sections = [
            self.formatter.format_header(health_data),
            self.formatter.format_vitals(health_data),
            self.formatter.format_efficiency(health_data),
            self.formatter.format_entropy(health_data),
            self.formatter.format_quality_matrix(health_data)
        ]
        
        if obf_finds:
            sections.append(self.formatter.format_obfuscation_zone(obf_finds))
            
        sections.append(self.formatter.format_battle_plan(gen_finds))
        sections.append("## 💀 Risco Existencial\n\n> Autoconsciência nativa ativa.")
        
        raw_report = "\n\n".join(s.strip() for s in sections if s).strip()
        return self.sanitizer.sanitize(raw_report)

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
