"""
📝 Processador Estrutural de Markdown.
Decompõe documentos em nós lógicos (headers, code blocks, content) para normalização PhD.
"""
import re
import logging
from src_local.utils.markdown_util import MarkdownUtil

logger = logging.getLogger(__name__)

class MarkdownStructureProcessor:
    """Processador de baixo nível para fluxos de linhas Markdown."""
    
    def __init__(self, raw_lines):
        self.raw = raw_lines
        self.res = []
        self.state = {"seen": {}, "in_cb": False}
        logger.debug(f"📝 [MarkdownProcessor] Iniciando processamento de {len(raw_lines)} linhas.")

    def process(self):
        for i, line in enumerate(self.raw):
            stripped = line.rstrip()
            if self._handle_block(stripped, line): continue
            
            if stripped.strip().startswith('#'):
                self._handle_header(stripped.strip(), i)
            elif self._should_append(stripped):
                self.res.append(stripped)
        return self.res

    def _handle_block(self, stripped, original):
        if stripped.strip().startswith('```'):
            self.state["in_cb"] = not self.state["in_cb"]
            self.res.append(original)
            return True
        if self.state["in_cb"]:
            self.res.append(original)
            return True
        return False

    def _handle_header(self, line, idx):
        if self.res and self.res[-1]: self.res.append('')
        h = MarkdownUtil.deduplicate_header(line, self.state["seen"])
        self.res.append(h)
        MarkdownUtil.apply_header_padding(self.res, self.raw, idx)

    def _should_append(self, stripped):
        return stripped.strip() or (self.res and self.res[-1])
