import logging
import re

logger = logging.getLogger(__name__)

class VetoRules:
    """Coleção de regras de veto específicas."""

    def check_test_permissions(self, line, pattern, file_path):
        """Permite padrões perigosos apenas em testes."""
        if "/tests/" not in file_path and "test_" not in file_path:
            return False
            
        regex_val = pattern.get('regex', '')
        if regex_val and (f"'{regex_val}'" in line or f'"{regex_val}"' in line):
            return True
        if pattern.get("severity") == "critical" and "pass" in line:
            return True
        return False

    def is_technical_math_context(self, line, pattern):
        """Distingue matemática técnica de imprecisão monetária."""
        if "Imprecisão Monetária" not in pattern.get('issue', ''):
            return False
            
        if any(f in line.lower() for f in ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee']):
            return False
            
        return self._is_math_term(line.lower())

    def _is_math_term(self, text):
        tech = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos']
        return any(re.search(rf"\b{t}\b", text) for t in tech)

    def is_docstring(self, line, ctx):
        if '"""' in line or "'''" in line:
            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:
                ctx["in_docstring"] = not ctx.get("in_docstring", False)
            return True
        return ctx.get("in_docstring", False)

    def is_domain_excluded(self, line, pattern, ctx):
        return ctx.get("domain") == "EXPERIMENTATION" and pattern.get('severity') != 'critical'

    def is_rule_definition(self, line, pattern, ctx, heuristic):
        if not ctx.get("is_technical"): return False
        return self._is_rule_def_line(line, pattern, heuristic)

    def _is_rule_def_line(self, line, pattern, heuristic):
        if any(kw in line.lower() for kw in ["rules =", "patterns =", "regex =", "diretriz:"]):
            return True
        if heuristic.is_strategic_phrase(line) or heuristic.is_obfuscated_vulnerability(line):
            return True
        regex_val = pattern.get('regex', '___')
        return any(q + regex_val + q in line for q in ["'", '"'])
