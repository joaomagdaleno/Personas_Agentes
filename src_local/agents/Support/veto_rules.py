class VetoRules:
    """Coleção de regras de veto específicas."""

    def check_test_permissions(self, line, pattern, file_path):
        """Permite padrões perigosos apenas em testes."""
        if "/tests/" in file_path or "test_" in file_path:
            # Self-match (se a linha contem o regex como string)
            regex_val = pattern.get('regex', '')
            if regex_val and (f"'{regex_val}'" in line or f'"{regex_val}"' in line):
                return True
            # Veto de criticidade em testes (permitir experimentos)
            if pattern.get("severity") == "critical" and "pass" in line:
                return True
        return False

    def is_technical_math_context(self, line, pattern):
        """Distingue matemática técnica de imprecisão monetária."""
        if "Imprecisão Monetária" not in pattern.get('issue', ''):
            return False
            
        tech_terms = [
            'alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height',
            'radius', 'velocity', 'phase', 'amplitude', 'frequency', 'duration',
            'color', 'rotation', 'scale', 'padding', 'margin', 'lerp', 'sin', 'cos'
        ]
        
        lower_line = line.lower()
        financial_terms = ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee']
        if any(f in lower_line for f in financial_terms):
            return False
            
        return any(rf"\b{t}\b" in lower_line for t in tech_terms)

    def is_docstring(self, line, ctx):
        if '"""' in line or "'''" in line:
            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:
                ctx["in_docstring"] = not ctx.get("in_docstring", False)
            return True
        return ctx.get("in_docstring", False)

    def is_domain_excluded(self, line, pattern, ctx):
        if ctx.get("domain") == "EXPERIMENTATION":
            return pattern.get('severity') != 'critical'
        return False

    def is_rule_definition(self, line, pattern, ctx, heuristic):
        if not ctx.get("is_technical"): return False

        keywords = ["rules =", "patterns =", "audit_rules =", "regex =", "diretriz:", "silent_pattern =", "brittle_pattern ="]
        if any(kw in line.lower() for kw in keywords): return True

        if heuristic.is_strategic_phrase(line): return True

        regex_val = pattern.get('regex', '')
        if regex_val and any(q + regex_val + q in line for q in ["'", '"']): return True

        return heuristic.is_obfuscated_vulnerability(line)
