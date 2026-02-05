import re

class VetoRulesPhd:
    """⚖️ Regras de Vento PhD: Central de Heurísticas."""
    
    @staticmethod
    def apply_test_veto(line, pattern):
        regex_val = pattern.get('regex', '')
        if regex_val and (f"'{regex_val}'" in line or f'"{regex_val}"' in line):
            return True
        if pattern.get("severity") == "critical" and "pass" in line:
            return True
        return False

    @staticmethod
    def is_technical_math(line, pattern):
        if "Imprecisão Monetária" not in pattern.get('issue', ''): return False
        tech_terms = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'amplitude', 'frequency', 'duration']
        lower_line = line.lower()
        if any(f in lower_line for f in ['price', 'amount', 'balance', 'cost', 'total']): return False
        return any(rf"\b{t}\b" in lower_line for t in tech_terms)

    @staticmethod
    def is_rule_def(line, pattern, ctx, heuristic):
        if not ctx.get("is_technical"): return False
        keywords = ["rules =", "patterns =", "audit_rules =", "regex =", "silent_pattern =", "brittle_pattern ="]
        if any(kw in line.lower() for kw in keywords): return True
        if heuristic.is_strategic_phrase(line): return True
        regex_val = pattern.get('regex', '')
        if regex_val and any(q + regex_val + q in line for q in ["'", '"']): return True
        return heuristic.is_obfuscated_vulnerability(line)
