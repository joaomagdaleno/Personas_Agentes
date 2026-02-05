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
        # Limpa deduplicação final com normalização de strings
        unique_results = []
        seen = set()
        for r in audit_results:
            if isinstance(r, dict):
                # Normaliza issue para evitar duplicatas MD024 por diferença de pontuação
                clean_issue = r.get('issue', '').rstrip('.')
                key = f"{r.get('file')}:{r.get('line')}:{clean_issue}"
            else:
                key = str(r).rstrip('.')
                
            if key not in seen:
                unique_results.append(r)
                seen.add(key)

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
        return self._sanitize_markdown(raw_report)

    def _sanitize_markdown(self, content):
        """
        🏛️ Camada de Sanitização Soberana 3.0 (Context-Aware).
        Garante conformidade com MD012, MD022, MD024 e MD026 respeitando blocos de código.
        """
        import re
        
        # Passagem 1: Normalização e Colapso de Linhas em Branco (MD012)
        # Ignora colapso dentro de blocos de código para preservar formatação da evidência
        raw_lines = [line.rstrip() for line in content.split('\n')]
        processed_lines = []
        in_code_block = False
        
        for line in raw_lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                processed_lines.append(line)
                continue
            
            if in_code_block:
                processed_lines.append(line)
            else:
                if not line:
                    if processed_lines and processed_lines[-1]: # Collapse logic
                        processed_lines.append('')
                else:
                    processed_lines.append(line)

        # Passagem 2: Sanitização de Cabeçalhos (MD026) e Unicidade (MD024)
        sanitized_lines = []
        seen_headings = {}
        in_code_block = False
        
        for line in processed_lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                sanitized_lines.append(line)
                continue
                
            # Um cabeçalho Markdown real começa com # e tem no máximo 3 espaços de indentação
            is_real_heading = not in_code_block and re.match(r'^[ ]{0,3}\#+\s+', line)
            
            if is_real_heading:
                # MD026: Remove pontuação final redundante
                line = re.sub(r'^(\#+\s+.*?)[\.\!\?\:]+$', r'\1', line)
                
                # MD024: Unique headings
                h_text = line.strip()
                if h_text in seen_headings:
                    seen_headings[h_text] += 1
                    line = f"{h_text} [v{seen_headings[h_text]}]"
                else:
                    seen_headings[h_text] = 1
            
            sanitized_lines.append(line)

        # Passagem 3: Garantia de Preenchimento (MD022)
        final_lines = []
        in_code_block = False
        for i, line in enumerate(sanitized_lines):
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                final_lines.append(line)
                continue
                
            is_heading = not in_code_block and re.match(r'^[ ]{0,3}\#+\s+', line)
            
            if is_heading:
                # Linha em branco ANTES
                if i > 0 and final_lines and final_lines[-1] != '':
                    final_lines.append('')
                
                final_lines.append(line)
                
                # Linha em branco DEPOIS
                if i < len(sanitized_lines) - 1 and sanitized_lines[i+1] != '':
                    final_lines.append('')
            else:
                final_lines.append(line)
                
        return '\n'.join(final_lines).strip() + '\n'

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
