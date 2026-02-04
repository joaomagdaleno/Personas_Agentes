"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Decisor de Veto de Linha (LineVeto)
Função: Centralizar regras de exclusão para evitar falsos positivos em auditorias.
Soberania: Core-Support Agent.
"""
import logging

logger = logging.getLogger(__name__)

class LineVeto:

    """

    Assistente Técnico: Especialista em Decisão de Veto de Varredura 🛑

    """

    

    def __init__(self):

        from src_local.agents.Support.vulnerability_heuristic import VulnerabilityHeuristic

        self.heuristic = VulnerabilityHeuristic()



    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:
        """⚖️ Decisor de Veto Soberano."""
        from src_local.utils.veto_rules_phd import VetoRulesPhd
        clean_line = line.strip()
        if not clean_line or clean_line.startswith("#"): return True

        file_path = ctx.get("file_path", "").replace("\\", "/")
        if ("/tests/" in file_path or "test_" in file_path) and VetoRulesPhd.apply_test_veto(line, pattern):
            return True

        if self._is_docstring(line, ctx) or self._is_domain_excluded(line, pattern, ctx):
            return True
        
        if VetoRulesPhd.is_technical_math(line, pattern): return True
        return VetoRulesPhd.is_rule_def(line, pattern, ctx, self.heuristic)

    def _is_docstring(self, line, ctx):
        if '"""' in line or "'''" in line:
            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:
                ctx["in_docstring"] = not ctx.get("in_docstring", False)
            return True
        return ctx.get("in_docstring", False)

    def _is_domain_excluded(self, line, pattern, ctx):
        if ctx.get("domain") == "EXPERIMENTATION":
            return pattern.get('severity') != 'critical'
        return False
