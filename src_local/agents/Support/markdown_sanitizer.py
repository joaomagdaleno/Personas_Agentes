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
        
        # Remove UTF-8 BOM e espaços iniciais/finais agressivos
        content = content.lstrip('\ufeff').strip()
        
        res, seen, in_cb = [], {}, False
        raw_lines = [line.rstrip() for line in content.split('\n')]
        
        for i, line in enumerate(raw_lines):
            stripped = line.strip()
            if stripped.startswith('```'):
                in_cb = not in_cb
                res.append(line)
                continue
            
            if in_cb:
                res.append(line)
                continue

            if re.match(r'^\#+\s+', stripped):
                # Padding Above (MD022)
                if res and res[-1]: res.append('')
                # MD026 (Punctuation) & MD024 (Duplicates)
                h = re.sub(r'[\.\!\?\:]+$', '', stripped)
                if h in seen:
                    seen[h] += 1
                    h = f"{h} [v{seen[h]}]"
                else: seen[h] = 1
                res.append(h)
                # Padding Below
                if i < len(raw_lines)-1 and raw_lines[i+1].strip(): res.append('')
            elif stripped or (res and res[-1]):
                res.append(line)

        # MD041 enforcement: Absolute stripping of leading empty lines
        while res and not res[0].strip():
            res.pop(0)

        # Garantia de H1 no topo
        first_h1_found = False
        for line in res:
            if line.strip().startswith('# '):
                first_h1_found = True
                break
        
        if not first_h1_found and res:
             res.insert(0, "# 🏛️ RELATÓRIO DE CONSCIÊNCIA SISTÊMICA")
             res.insert(1, "")
        elif res and not res[0].strip().startswith('# '):
             # Se o H1 estiver "enterrado", move para o topo
             h1_idx = -1
             for idx, line in enumerate(res):
                 if line.strip().startswith('# '):
                     h1_idx = idx
                     break
             if h1_idx > 0:
                 h1_line = res.pop(h1_idx)
                 res.insert(0, h1_line)
                 res.insert(1, "")

        # MD047: Absolute single trailing newline
        sanitized = '\n'.join(res).strip() + '\n'
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "📝 Markdown Sanitized (PHD Core)")
        return sanitized