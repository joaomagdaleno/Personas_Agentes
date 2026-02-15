import logging
import json
import subprocess
import os

logger = logging.getLogger(__name__)

class MaintenanceEnginePhd:
    """🛠️ Motor de Manutenção PhD: Limpeza e Fusão de Índices."""
    
    @staticmethod
    def clean_submodules(root, run_git):
        if not (root / ".gitmodules").exists(): return
        res = run_git(["submodule", "foreach", "--quiet", "echo $displaypath"])
        if res and res.returncode == 0:
            for sub in res.stdout.splitlines():
                sub_dir = root / sub.strip()
                if sub_dir.exists(): subprocess.run(["git", "clean", "-fd"], cwd=str(sub_dir), capture_output=True)

    @staticmethod
    def merge_skills_index(root, file_path, run_git, protected_ids):
        ours_raw = run_git(["show", f":2:{file_path}"]).stdout
        theirs_raw = run_git(["show", f":3:{file_path}"]).stdout
        try:
            ours = json.loads(ours_raw) if ours_raw else []
            theirs = json.loads(theirs_raw) if theirs_raw else []
            merged = {item['id']: item for item in theirs}
            for item in ours:
                if item['id'] in protected_ids: merged[item['id']] = item
            with open(root / file_path, "w", encoding="utf-8") as f:
                json.dump(sorted(merged.values(), key=lambda x: x['id']), f, indent=2, ensure_ascii=False)
            return True
        except: return False
