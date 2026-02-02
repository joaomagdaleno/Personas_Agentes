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

        from src.agents.Support.vulnerability_heuristic import VulnerabilityHeuristic

        self.heuristic = VulnerabilityHeuristic()



    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:

        """⚖️ Decisor de Veto Soberano."""

        if "tests/" in ctx.get("file_path", "") and pattern.get("severity") == "critical":

            if "eval(" in line or "exec(" in line: return True



        if self._is_docstring(line, ctx): return True

        if self._is_domain_excluded(line, pattern, ctx): return True

        return self._is_rule_definition(line, pattern, ctx)



    def _is_docstring(self, line, ctx):

        """Gerencia detecção de comentários multilinha."""

        if '"""' in line or "'''" in line:

            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:

                ctx["in_docstring"] = not ctx.get("in_docstring", False)

            return True

        return ctx.get("in_docstring", False)



    def _is_domain_excluded(self, line, pattern, ctx):

        """🛡️ Filtro de Domínio Estratégico."""

        if ctx.get("domain") == "EXPERIMENTATION":

            return pattern.get('severity') != 'critical'

        return False



    def _is_rule_definition(self, line, pattern, ctx):

        """🧠 Heurística de Definição de Regra vs. Execução."""

        if not ctx.get("is_technical"): return False



        if any(kw in line.lower() for kw in ["rules =", "patterns =", "audit_rules =", "regex =", "diretriz:"]):

            return True



        if self.heuristic.is_strategic_phrase(line):

            return True



        regex_val = pattern.get('regex', '')

        if regex_val and any(q + regex_val + q in line for q in ["'", '"']):

            return True



        return self.heuristic.is_obfuscated_vulnerability(line)
