"""
📝 Utilitários de Markdown PhD.
Provê funções atômicas para deduplicação e normalização de documentos.
"""
import re
import logging

logger = logging.getLogger(__name__)

class MarkdownUtil:
    """Ferramentas atômicas para processamento de Markdown."""
    
    @staticmethod
    def deduplicate_header(h: str, seen: dict) -> str:
        """Evita headers duplicados adicionando sufixos de versão."""
        h_clean = re.sub(r'[\.\!\?\:]+$', '', h)
        if h_clean in seen:
            seen[h_clean] += 1
            res = f"{h_clean} [v{seen[h_clean]}]"
            logger.debug(f"📝 [Markdown] Header duplicado corrigido: {res}")
            return res
        seen[h_clean] = 1
        return h_clean

    @staticmethod
    def apply_header_padding(res: list, raw: list, idx: int):
        """Garante espaçamento vertical após cabeçalhos (MD022)."""
        if idx < len(raw)-1 and raw[idx+1].strip():
            res.append('')
