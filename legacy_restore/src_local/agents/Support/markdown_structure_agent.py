import re
from src_local.utils.markdown_util import MarkdownUtil

class MarkdownStructureAgent:
    """Agente especialista em decomposição e normalização de estruturas Markdown."""
    
    def __init__(self, raw_lines):
        self.raw = raw_lines
        self.res = []
        self.state = {"seen": {}, "in_cb": False}

    def execute_refinement(self) -> list:
        """Executa a limpeza estrutural pesada."""
        for i, line in enumerate(self.raw):
            if self._process_line(line, i):
                continue
        return self.res

    def _process_line(self, line, idx):
        stripped = line.rstrip()
        
        # Gerenciamento de blocos de código
        if self._handle_code_block(stripped, line):
            return True
            
        # Processamento de Cabeçalhos
        if stripped.strip().startswith('#'):
            self._apply_header_logic(stripped.strip(), idx)
            return True
            
        # Conteúdo regular
        if stripped.strip() or (self.res and self.res[-1]):
            self.res.append(stripped)
        return False

    def _handle_code_block(self, stripped, original):
        if stripped.strip().startswith('```'):
            self.state["in_cb"] = not self.state["in_cb"]
            self.res.append(original)
            return True
        if self.state["in_cb"]:
            self.res.append(original)
            return True
        return False

    def _apply_header_logic(self, line, idx):
        if self.res and self.res[-1]: 
            self.res.append('')
        
        h = MarkdownUtil.deduplicate_header(line, self.state["seen"])
        self.res.append(h)
        MarkdownUtil.apply_header_padding(self.res, self.raw, idx)
