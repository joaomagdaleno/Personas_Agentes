import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FileSystemScanner:
    """Gerenciador de descoberta de arquivos no sistema."""
    
    def __init__(self, root, analyst):
        self.root = Path(root)
        self.analyst = analyst
        logger.debug(f"FileSystemScanner initialized for root: {self.root}")

    def scan_all_filenames(self):
        """Retorna lista plana de todos arquivos (para detecção de testes)."""
        return [p.name.lower() for p in self.root.rglob('*') if p.is_file()]

    def get_analyzable_files(self):
        """Generator de arquivos válidos para análise."""
        search_dirs = [self.root]
        src = self.root / "src_local"
        if src.exists(): search_dirs.append(src)

        seen = set()
        for d in search_dirs:
            for path in d.rglob('*'):
                if str(path) in seen: continue
                
                if self._should_skip(path): 
                    continue
                
                seen.add(str(path))
                yield path

    def _should_skip(self, path):
        if not path.is_file(): return True
        # Pruning Sistêmico: Ignora territórios de experimento, backups e infra de IA
        forbidden = [".git", ".gemini", "restore", "Forensics", "__pycache__"]
        path_parts = [p.lower() for p in path.parts]
        
        if any(f.lower() in p for p in path_parts for f in forbidden):
            return True
            
        path_str = str(path).replace("\\", "/").lower()
        # Se for ignorado pelo analista e não estiver em src_local, pula
        is_src = "src_local" in path_str
        if self.analyst.should_ignore(path) and not is_src: return True
        if not self.analyst.is_analyable(path): return True
        return False
