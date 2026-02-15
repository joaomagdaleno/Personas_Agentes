import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class TopologyEnginePhd:
    """🌐 Motor de Topologia PhD: Mapeamento e Filtragem de Território."""
    
    @staticmethod
    def discover_files(project_root):
        all_files = []
        for p in project_root.rglob('*'):
            if p.is_file(): all_files.append(p.name.lower())
        return all_files

    @staticmethod
    def get_search_dirs(project_root):
        src_dir = project_root / "src_local"
        search_dirs = [project_root]
        if src_dir.exists(): search_dirs.append(src_dir)
        return search_dirs

    @staticmethod
    def should_process(path, project_root, analyst, map_data):
        if analyst.should_ignore(path) and "src_local" not in str(path):
            return False
        if not analyst.is_analyable(path):
            return False
        
        try:
            rel_path = path.relative_to(project_root).as_posix()
            return rel_path if rel_path not in map_data else False
        except: return False
