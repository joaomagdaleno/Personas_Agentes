"""
📝 Sanitizador de Markdown (MarkdownSanitizer).
Realiza a limpeza e normalização garantindo conformidade absoluta com MD041 e MD047.
"""
import re
import logging
import time

logger = logging.getLogger(__name__)

class MarkdownSanitizer:
    def sanitize(self, content: str) -> str:
        """Soberania: Limpeza via Agente de Suporte especializado."""
        if not content: return ""
        start_t = time.time()
        
        raw_lines = content.lstrip('\ufeff').strip().split('\n')
        from src_local.agents.Support.markdown_structure_agent import MarkdownStructureAgent
        lines = MarkdownStructureAgent(raw_lines).execute_refinement()
        
        sanitized = '\n'.join(self._ensure_h1(self._cleanup(lines))).strip() + '\n'
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_t, "📝 Markdown Sanitized (Delegated)")
        return sanitized

    def _cleanup(self, lines):
        while lines and not lines[0].strip(): lines.pop(0)
        while lines and not lines[-1].strip(): lines.pop()
        return lines

    def _ensure_h1(self, lines):
        if not lines: return ["# 🏛️ RELATÓRIO SISTÊMICO", ""]
        if lines[0].strip().startswith('# '): return lines
        for i, line in enumerate(lines):
            if line.strip().startswith('# '):
                h1 = lines.pop(i)
                return [h1, ""] + lines
        return ["# 🏛️ RELATÓRIO SISTÊMICO", ""] + lines
