
import sys
from pathlib import Path
import ast

# Add src_local directly to path BEFORE importing from it
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter

class AutoDeobfuscator:
    def __init__(self, project_root):
        self.hunter = ObfuscationHunter()
        self.project_root = Path(project_root)

    def process_file(self, file_path):
        import re
        try:
            content = file_path.read_text(encoding='utf-8')
            
            # Re-parse execution to get AST nodes with offsets
            try:
                tree = ast.parse(content)
            except SyntaxError:
                print(f"❌ Erro de sintaxe em {file_path}, ignorando.")
                return False

            # Collect replacements
            collector = ReplacementCollector(self.hunter)
            collector.visit(tree)
            
            replacements = collector.replacements
            if not replacements: return False
            
            print(f"🧹 Cleaning {file_path.name} ({len(replacements)} obfuscations detected)...")
            
            # Apply replacements in reverse order to keep offsets valid
            replacements.sort(key=lambda x: x['start_offset'], reverse=True)
            
            new_content = content
            lines = content.splitlines(keepends=True)
            
            # Since strict byte offsets from AST can be tricky with CRLF vs LF in older python,
            # we rely on Python's ast handle 1-based indexing.
            # But converting lineno/col to absolute string index is safer if we map lines.
            
            # Helper to get offset
            def get_offset(lineno, col_offset):
                # lineno is 1-based.
                # Sum lengths of previous lines.
                if lineno > len(lines): return -1
                chars = sum(len(lines[i]) for i in range(lineno-1))
                return chars + col_offset

            for r in replacements:
                node = r['node']
                start = get_offset(node.lineno, node.col_offset)
                end = get_offset(node.end_lineno, node.end_col_offset)
                text = r['new_text']
                
                if start == -1 or end == -1: 
                    print(f"⚠️ Erro de offset em {file_path}:{node.lineno}")
                    continue
                    
                # Python 3.8+ AST ensures exact ranges. 
                # Create the replacement
                # We replace the range [start:end] with text repr
                
                # Check if it's a string constant we are constructing
                # We need the representation of the string (quoted)
                # target value: "eval" -> replacement source: '"eval"'
                new_source = repr(text)
                
                # Splicing
                new_content = new_content[:start] + new_source + new_content[end:]
                
            file_path.write_text(new_content, encoding='utf-8')
            return True

        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return False

class ReplacementCollector(ast.NodeVisitor):
    def __init__(self, hunter):
        self.hunter = hunter
        self.replacements = []

    def visit_BinOp(self, node):
        self.generic_visit(node)
        if isinstance(node.op, ast.Add):
            resolved = self.hunter._resolve_string_concat(node)
            if resolved:
                is_risky = any(kw in resolved for kw in self.hunter.DANGEROUS_KEYWORDS)
                if is_risky:
                    # Found one!
                    if hasattr(node, 'end_lineno') and hasattr(node, 'end_col_offset'):
                         self.replacements.append({
                             'node': node,
                             'new_text': resolved,
                             'start_offset': (node.lineno, node.col_offset) # Tuple for sorting
                         })

if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    # Ensure proper path injection
    sys.path.insert(0, str(project_root.absolute()))
    
    deobfuscator = AutoDeobfuscator(project_root)
    
    print(f"🚀 Iniciando Auto-Deobfuscator em: {project_root}")
    count = 0
    # Scan recursive
    for p in project_root.rglob("*.py"):
        if deobfuscator.process_file(p):
            count += 1
            
    print(f"✅ Processamento concluído. {count} arquivos limpos.")
