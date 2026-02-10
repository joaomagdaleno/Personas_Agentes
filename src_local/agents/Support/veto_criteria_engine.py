"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Critérios de Veto (VetoCriteriaEngine)
Função: Avaliar permissões de exceção e contextos técnicos/matemáticos.
"""
import re

class VetoCriteriaEngine:
    def check_permissions(self, line, pattern, file_path):
        if not ("/tests/" in file_path or "test_" in file_path): return False
        
        regex_val = pattern.get('regex', '')
        if regex_val and (f"'{regex_val}'" in line or f'"{regex_val}"' in line):
            return True
        return pattern.get("severity") == "critical" and "pass" in line

    def is_math_context(self, line, pattern):
        if "Imprecisão Monetária" not in pattern.get('issue', ''): return False
        if any(f in line.lower() for f in ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee']):
            return False
            
        tech = ['alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height', 'radius', 'velocity', 'phase', 'lerp', 'sin', 'cos']
        return any(re.search(rf"\b{t}\b", line.lower()) for t in tech)

    def is_rule_def(self, line, pattern, ctx, heuristic):
        if not ctx.get("is_technical"): return False
        if any(kw in line.lower() for kw in ["rules =", "patterns =", "regex =", "diretriz:"]):
            return True
            
        if heuristic.is_strategic_phrase(line) or heuristic.is_obfuscated_vulnerability(line):
            return True
            
        regex_val = pattern.get('regex', '___')
        return any(q + regex_val + q in line for q in ["'", '"'])
