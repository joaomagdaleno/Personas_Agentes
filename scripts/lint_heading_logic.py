"""
SISTEMA DE PERSONAS AGENTES - SCRIPTS
Módulo: Lógica de Cabeçalhos MD (LintHeadingLogic)
Função: Validar integridade de títulos e espaçamentos em Markdown.
"""
import re

class LintHeadingLogic:
    def check_headings(self, lines, i, stripped, headings):
        errs = []
        # MD022: Espaços em volta de headings
        if i > 0 and lines[i-1].strip(): errs.append(f"MD022 at {i+1}")
        if i < len(lines)-1 and lines[i+1].strip(): errs.append(f"MD022 at {i+1}")
        
        # MD026: Pontuação proibida
        if re.search(r'[.,;:!?]$', stripped): errs.append(f"MD026 at {i+1}")
        
        # MD024: Headings duplicados
        if stripped in headings: errs.append(f"MD024 at {i+1}")
        
        return errs
