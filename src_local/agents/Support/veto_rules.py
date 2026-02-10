import logging
import re

logger = logging.getLogger(__name__)

class VetoRules:
    """Coleção de regras de veto específicas."""

    def check_test_permissions(self, line, pattern, file_path):
        """Permite padrões perigosos apenas em testes."""
        from src_local.agents.Support.veto_criteria_engine import VetoCriteriaEngine
        return VetoCriteriaEngine().check_permissions(line, pattern, file_path)


    def is_technical_math_context(self, line, pattern):
        """Distingue matemática técnica de imprecisão monetária."""
        from src_local.agents.Support.veto_criteria_engine import VetoCriteriaEngine
        return VetoCriteriaEngine().is_math_context(line, pattern)

    def is_docstring(self, line, ctx):
        if '"""' in line or "'''" in line:
            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:
                ctx["in_docstring"] = not ctx.get("in_docstring", False)
            return True
        return ctx.get("in_docstring", False)

    def is_domain_excluded(self, line, pattern, ctx):
        return ctx.get("domain") == "EXPERIMENTATION" and pattern.get('severity') != 'critical'

    def is_rule_definition(self, line, pattern, ctx, heuristic):
        from src_local.agents.Support.veto_criteria_engine import VetoCriteriaEngine
        return VetoCriteriaEngine().is_rule_def(line, pattern, ctx, heuristic)
