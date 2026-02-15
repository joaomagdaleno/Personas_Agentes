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
        """Soberania: Limpeza PhD e normalização estratégica de Markdown."""
        if not content: return ""
        start_time = time.time()
        
        content = content.lstrip('\ufeff').strip()
        lines = self._process_structure(content.split('\n'))
        lines = self._ensure_h1(lines)
        
        sanitized = '\n'.join(lines).strip() + '\n'
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "📝 Markdown Sanitized (PHD Core)")
        return sanitized

    def _process_structure(self, raw_lines: list) -> list:
        """Processa blocos de código, headers e espaçamento vertical."""
        res, seen, in_cb = [], {}, False
        
        for i, line in enumerate(raw_lines):
            stripped = line.rstrip()
            in_cb, processed = self._handle_block_logic(stripped, in_cb)
            if processed:
                res.append(processed)
                continue

            if re.match(r'^\#+\s+', stripped.strip()):
                self._process_header(stripped.strip(), res, seen, raw_lines, i)
            elif stripped.strip() or (res and res[-1]):
                res.append(stripped)
                
        # Remove linhas vazias do início (MD041)
        while res and not res[0].strip():
            res.pop(0)
            
        return res

    def _handle_block_logic(self, line: str, in_cb: bool):
        """Gerencia estado de code blocks."""
        stripped = line.strip()
        if stripped.startswith('```'):
            return not in_cb, line
        if in_cb:
            return True, line
        return False, None

    def _process_header(self, line: str, res: list, seen: dict, raw: list, idx: int):
        """Normaliza cabeçalhos e aplica regras MD022/MD026."""
        if res and res[-1]: res.append('')
        
        h = re.sub(r'[\.\!\?\:]+$', '', line)
        if h in seen:
            seen[h] += 1
            h = f"{h} [v{seen[h]}]"
        else: seen[h] = 1
        
        res.append(h)
        # Padding Below
        if idx < len(raw)-1 and raw[idx+1].strip(): res.append('')

    def _ensure_h1(self, lines: list) -> list:
        """Garante a presença de um H1 no topo do documento."""
        if not lines: return ["# 🏛️ RELATÓRIO DE CONSCIÊNCIA SISTÊMICA", ""]
        
        # Check first line
        if lines[0].strip().startswith('# '): return lines
        
        # Search for buried H1
        for idx, line in enumerate(lines):
            if line.strip().startswith('# '):
                h1 = lines.pop(idx)
                return [h1, ""] + lines
                
        # No H1 found
        return ["# 🏛️ RELATÓRIO DE CONSCIÊNCIA SISTÊMICA", ""] + lines
