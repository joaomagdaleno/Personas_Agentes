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
        from src_local.agents.Support.veto_structural_engine import VetoStructuralEngine
        self.heuristic = VulnerabilityHeuristic()
        self.rules = VetoRules()
        self.structural = VetoStructuralEngine()

    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:
        """⚖️ Decisor de Veto Soberano."""
        if self._is_structural_veto(line, ctx):
            return True
            
        return self._is_permission_or_content_veto(line, pattern, ctx)

    def _is_structural_veto(self, line, ctx):
        """Vetos baseados na estrutura delegando para structural engine."""
        if self.structural.is_comment(line): return True
        return self.structural.is_docstring(line, ctx)

    def _is_permission_or_content_veto(self, line, pattern, ctx):
        """Vetos baseados em permissões de arquivo ou conteúdo da linha."""
        file_path = ctx.get("file_path", "").replace("\\", "/")
        
        if self.rules.check_test_permissions(line, pattern, file_path): return True
        if self._is_domain_excluded(line, pattern, ctx): return True
        return self._is_rule_definition(line, pattern, ctx)


    def _is_domain_excluded(self, line, pattern, ctx):
        """🛡️ Filtro de Domínio Estratégico."""
        return ctx.get("domain") == "EXPERIMENTATION" and pattern.get('severity') != 'critical'

    def _is_rule_definition(self, line, pattern, ctx):
        """🧠 Heurística de Definição de Regra vs. Execução."""
        if not ctx.get("is_technical"): return False
        return self.rules.is_rule_definition(line, pattern, ctx, self.heuristic)