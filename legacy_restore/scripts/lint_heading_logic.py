"""
SISTEMA DE PERSONAS AGENTES - SCRIPTS
Módulo: Lógica de Cabeçalhos MD (LintHeadingLogic)
Função: Validar integridade de títulos e espaçamentos em Markdown.
"""
import re
import logging
logger = logging.getLogger(__name__)

class LintHeadingLogic:
    def check_headings(self, lines, i, stripped, headings):
        errs = []
        # MD022: Espaços em volta de headings
        if i > 0 and lines[i-1].strip(): errs.append(f"MD022 at {i+1}")
        if i < len(lines)-1 and lines[i+1].strip(): errs.append(f"MD022 at {i+1}")
        
        # MD024: Headings duplicados
        if stripped in headings: errs.append(f"MD024 at {i+1}")
        
        # MD026: Pontuação proibida
        if re.search(r'[.,;:!?]$', stripped): errs.append(f"MD026 at {i+1}")
        
        # MD001: Estrutura de heading inválida (deve começar com #)
        if not stripped.startswith("#"):
            errs.append(f"MD001 at {i+1}: Heading deve começar com #")
        
        from src_local.utils.logging_config import log_performance
        import time
        log_performance(logger, time.time(), "Telemetry: Heading check")
        return errs
