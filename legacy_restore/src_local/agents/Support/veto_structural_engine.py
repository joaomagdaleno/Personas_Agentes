"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor Estrutural de Veto (VetoStructuralEngine)
Função: Validar contextos de comentários e docstrings Python.
"""

import logging
logger = logging.getLogger(__name__)

class VetoStructuralEngine:
    def is_comment(self, line):
        return line.strip().startswith("#") or line.strip().startswith("//")

    def is_docstring(self, line, ctx):
        """📝 Detecta se a linha está dentro de uma docstring Python."""
        import time
        start_time = time.time()
        
        clean = line.strip()
        if '"""' not in clean and "'''" not in clean:
            return ctx.get("in_docstring", False)
            
        # Docstring de linha única?
        if not self._is_single_line_docstring(clean):
            ctx["in_docstring"] = not ctx.get("in_docstring", False)
            
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: Docstring check")
        return True

    def _is_single_line_docstring(self, line):
        return (line.count('"""') >= 2 and line.startswith('"""') and line.endswith('"""')) or \
               (line.count("'''") >= 2 and line.startswith("'''") and line.endswith("'''"))
