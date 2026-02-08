"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Decisor de Veto de Linha (LineVeto)
Função: Centralizar regras de exclusão para evitar falsos positivos em auditorias.
Soberania: Core-Support Agent.
"""
import logging

logger = logging.getLogger(__name__)

class LineVeto:
    """Assistente Técnico: Especialista em Decisão de Veto de Varredura 🛑"""

    def __init__(self):
        from src_local.agents.Support.vulnerability_heuristic import VulnerabilityHeuristic
        from src_local.agents.Support.veto_rules import VetoRules
        self.heuristic = VulnerabilityHeuristic()
        self.rules = VetoRules()

    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:
        """⚖️ Decisor de Veto Soberano."""
        if self._is_comment(line): return True

        file_path = ctx.get("file_path", "").replace("\\", "/")
        
        # Sequência de Vetos Delegados
        if self.rules.check_test_permissions(line, pattern, file_path): return True
        if self._is_domain_excluded(line, pattern, ctx): return True
        if self._is_rule_definition(line, pattern, ctx): return True
        if self._is_docstring(line, ctx): return True

        return ctx.get("in_docstring", False)

    def _is_comment(self, line):
        return line.strip().startswith("#") or line.strip().startswith("//")

    def _is_docstring(self, line, ctx):
        """📝 Detecta se a linha está dentro de uma docstring Python."""
        clean = line.strip()
        if '"""' not in clean and "'''" not in clean:
            return ctx.get("in_docstring", False)
            
        # Docstring de linha única?
        if not self._is_single_line_docstring(clean):
            ctx["in_docstring"] = not ctx.get("in_docstring", False)
            
        return True

    def _is_single_line_docstring(self, line):
        return (line.count('"""') >= 2 and line.startswith('"""') and line.endswith('"""')) or \
               (line.count("'''") >= 2 and line.startswith("'''") and line.endswith("'''"))

    def _is_domain_excluded(self, line, pattern, ctx):
        """🛡️ Filtro de Domínio Estratégico."""
        return ctx.get("domain") == "EXPERIMENTATION" and pattern.get('severity') != 'critical'

    def _is_rule_definition(self, line, pattern, ctx):
        """🧠 Heurística de Definição de Regra vs. Execução."""
        if not ctx.get("is_technical"): return False
        return self.rules.is_rule_definition(line, pattern, ctx, self.heuristic)