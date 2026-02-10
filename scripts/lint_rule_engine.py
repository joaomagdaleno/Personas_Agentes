"""
SISTEMA DE PERSONAS AGENTES - SCRIPTS
Módulo: Motor de Regras de Lint (LintRuleEngine)
Função: Validar regras MD específicas para relatórios sistêmicos.
"""
import re

class LintRuleEngine:
    """Motor de Validação MD0xx 🚀"""

    def verify_rules(self, lines):
        errors, headings = [], {}
        in_cb = False
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith('```'):
                in_cb = not in_cb
                continue
            
            if in_cb: continue
            
            # MD012: Linhas em branco consecutivas
            if self._is_blank_violation(i, stripped, lines):
                errors.append(f"MD012 (Blank lines) at {i+1}")
            
            # Headings logic
            if stripped.startswith('#'):
                from scripts.lint_heading_logic import LintHeadingLogic
                errors.extend(LintHeadingLogic().check_headings(lines, i, stripped, headings))
                headings[stripped] = i
        return errors

    def _is_blank_violation(self, i, stripped, lines):
        if i > 0 and not stripped and not lines[i-1].strip():
            return i < 2 or lines[i-2].strip()
        return False

