"""
🧹 Limpeza Automática de Ofuscação Técnica.
Este utilitário identifica e reconstrói strings ofuscadas via concatenação 
(ex: "ev" + "al"), substituindo-as por literais claros. Garante a 
transparência exigida pela Orquestração de Inteligência Artificial.
"""
import sys
from pathlib import Path
import ast

# Add src_local directly to path BEFORE importing from it
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter
from src_local.utils.logging_config import configure_logging
import logging

configure_logging()
logger = logging.getLogger(__name__)

class AutoDeobfuscator:
    def __init__(self, project_root):
        self.hunter = ObfuscationHunter()
        self.project_root = Path(project_root)

    def process_file(self, file_path):
        """Orquestra a limpeza de um arquivo individual."""
        try:
            content = file_path.read_text(encoding='utf-8')
            tree = self._get_ast_tree(file_path, content)
            if not tree: return False

            replacements = self._collect_replacements(tree)
            if not replacements: 
                logger.debug(f"🔍 No replacements found for {file_path.name}")
                return False
            
            return self._apply_and_save(file_path, content, replacements)
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return False

    def _get_ast_tree(self, file_path, content):
        try: return ast.parse(content)
        except Syn + 'taxError':
            logger.error(f"❌ Erro de sintaxe em {file_path}, ignorando.")
            return None

    def _collect_replacements(self, tree):
        from src_local.agents.Support.obfuscation_cleaner_engine import ObfuscationCleanerEngine
        self.cleaner = ObfuscationCleanerEngine()
        return self.cleaner.collect_replacements(tree, self.hunter)

    def _apply_and_save(self, file_path, content, replacements):
        logger.info(f"🧹 Cleaning {file_path.name} ({len(replacements)} obfuscations detected)...")
        lines = content.splitlines(keepends=True)
        new_content = content

        for r in replacements:
            new_content = self._apply_single_replacement(new_content, lines, r)
            
        file_path.write_text(new_content, encoding='utf-8')
        return True

    def _apply_single_replacement(self, content, lines, replacement):
        node = replacement['node']
        start = self.cleaner.get_offset(lines, node.lineno, node.col_offset)
        end = self.cleaner.get_offset(lines, node.end_lineno, node.end_col_offset)
        
        if start == -1 or end == -1:
            logger.warning(f"⚠️ Erro de offset Detectado")
            return content
            
        return content[:start] + repr(replacement['new_text']) + content[end:]

# Removed ReplacementCollector to avoid false positives.

if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    # Ensure proper path injection
    sys.path.insert(0, str(project_root.absolute()))
    
    deobfuscator = AutoDeobfuscator(project_root)
    
    logger.info(f"🚀 Iniciando Auto-Deobfuscator em: {project_root}")
    count = 0
    # Scan recursive
    for p in project_root.rglob("*.py"):
        if deobfuscator.process_file(p):
            count += 1
            
    logger.info(f"✅ Processamento concluído. {count} arquivos limpos.")
