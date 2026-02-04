import subprocess
import os
import logging
import json
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("GitDoctor")

# Configuração de caminhos que devem ser protegidos (mantêm versão local)
PROTECTED_PATHS = [
    "skills/fast-android-build"
]

# IDs de skills que devem ser preservadas no skills_index.json
PROTECTED_SKILL_IDS = [
    "fast-android-build"
]

class GitDoctor:
    def __init__(self, root_path):
        self.root = Path(root_path)

    def run_command(self, args, cwd=None):
        if cwd is None: cwd = self.root
        result = subprocess.run(["git"] + args, cwd=str(cwd), capture_output=True, text=True)
        return result

    def _clear_locks(self):
        """Remove arquivos de lock que travam o Git."""
        git_dir = self.root / ".git"
        if not git_dir.exists(): return
        
        logger.info("🔍 Procurando por arquivos de lock pendentes...")
        locks = list(git_dir.rglob("*.lock"))
        for lock in locks:
            try:
                logger.warning(f"🗑️ Removendo lock: {lock}")
                os.remove(lock)
            except Exception as e:
                logger.error(f"❌ Não foi possível remover {lock}: {e}")

    def _clean_submodules(self):
        """Limpa sujeira (untracked files) dentro de todos os submódulos."""
        if not (self.root / ".gitmodules").exists(): return

        logger.info("🧹 Iniciando limpeza profunda de submódulos...")
        res = self.run_command(["submodule", "foreach", "--quiet", "echo $displaypath"])
        if res.returncode == 0:
            sub_paths = res.stdout.splitlines()
            for sub in sub_paths:
                sub_dir = self.root / sub.strip()
                if sub_dir.exists():
                    logger.info(f"👉 Limpando submódulo: {sub}")
                    subprocess.run(["git", "clean", "-fd"], cwd=str(sub_dir), capture_output=True)

    def _is_protected(self, file_path):
        """Verifica se um arquivo está na lista de protegidos."""
        for p in PROTECTED_PATHS:
            if p in file_path:
                return True
        return False

    def _merge_skills_index(self, file_path):
        """Realiza um merge inteligente do skills_index.json."""
        logger.info(f"🧠 Realizando merge inteligente: {file_path}")
        
        # Obter versões "ours" e "theirs" do índice de conflito
        ours_raw = self.run_command(["show", f":2:{file_path}"]).stdout
        theirs_raw = self.run_command(["show", f":3:{file_path}"]).stdout
        
        try:
            ours = json.loads(ours_raw) if ours_raw else []
            theirs = json.loads(theirs_raw) if theirs_raw else []
            
            # Indexar by ID
            merged_dict = {item['id']: item for item in theirs}
            
            # Adicionar ou sobrescrever com os protegidos de "ours"
            for item in ours:
                if item['id'] in PROTECTED_SKILL_IDS:
                    logger.info(f"🛡️ Mantendo skill protegida no índice: {item['id']}")
                    merged_dict[item['id']] = item
            
            # Converter de volta para lista e ordenar
            merged_list = sorted(merged_dict.values(), key=lambda x: x['id'])
            
            # Salvar no disco
            with open(self.root / file_path, "w", encoding="utf-8") as f:
                json.dump(merged_list, f, indent=2, ensure_ascii=False)
            
            return True
        except Exception as e:
            logger.error(f"❌ Falha no merge JSON: {e}")
            return False

    def _resolve_file_conflict(self, f):
        """🧬 Resolve um conflito em um arquivo específico."""
        if "__pycache__" in f or f.endswith(".pyc"):
            return self._resolve_cache_conflict(f)
        
        if f == "skills_index.json":
            return self._resolve_json_conflict(f)

        if self._is_protected(f):
            return self._resolve_protected_conflict(f)
        
        return self._resolve_priority_conflict(f)

    def _resolve_cache_conflict(self, f):
        logger.info(f"🗑️ Removendo cache conflitante: {f}")
        self.run_command(["rm", "--cached", f])
        full_path = self.root / f
        if full_path.exists():
            try: os.remove(full_path)
            except: pass
        return True

    def _resolve_json_conflict(self, f):
        if self._merge_skills_index(f):
            self.run_command(["add", f])
            return True
        logger.warning(f"⚠️ Falha no merge inteligente de {f}. Usando 'ours'.")
        self.run_command(["checkout", "--ours", f])
        self.run_command(["add", f])
        return True

    def _resolve_protected_conflict(self, f):
        logger.info(f"🛡️ Protegendo arquivo local: {f}")
        self.run_command(["checkout", "--ours", f])
        self.run_command(["add", f])
        return True

    def _resolve_priority_conflict(self, f):
        logger.info(f"📡 Priorizando upstream: {f}")
        self.run_command(["checkout", "--theirs", f])
        self.run_command(["add", f])
        return True

    def _resolve_unmerged(self):
        """Varre e resolve todos os arquivos em estado unmerged."""
        status = self.run_command(["status", "--porcelain"]).stdout
        lines = status.splitlines()
        has_conflicts = False
        for line in lines:
            if line.startswith(("UU", "AA", "AU", "UA", "UD", "DU")):
                has_conflicts = True
                self._resolve_file_conflict(line[3:].strip())
        return has_conflicts

    def _handle_active_conflicts(self):
        """🩹 Gerencia loops de resolução para rebase ou merge."""
        is_rebase = (self.root / ".git" / "rebase-merge").exists() or (self.root / ".git" / "rebase-apply").exists()
        is_merge = (self.root / ".git" / "MERGE_HEAD").exists()
        if not (is_rebase or is_merge): return

        from src_local.utils.conflict_policy_phd import ConflictPolicyPhd
        policy = ConflictPolicyPhd(self.root, self.run_command)
        
        logger.warning("🩹 Fluxo de conflito detectado...")
        try:
            while self._resolve_with_policy(policy):
                if is_rebase:
                    if subprocess.run(["git", "rebase", "--continue"], env={**os.environ, "GIT_EDITOR": "true"}, cwd=str(self.root), capture_output=True).returncode == 0: break
                elif is_merge:
                    self.run_command(["commit", "-m", "chore: PhD auto-resolve"])
                    break
        except Exception as e:
            logger.error(f"🚨 Falha: {e}")
            self.run_command(["rebase", "--abort"])

    def _resolve_with_policy(self, policy):
        """Usa a política externa para resolver arquivos unmerged."""
        status = self.run_command(["status", "--porcelain"]).stdout
        lines = [l for l in status.splitlines() if l.startswith(("UU", "AA", "AU", "UA", "UD", "DU"))]
        for line in lines:
            policy.resolve_file(line[3:].strip(), self._merge_skills_index, self._is_protected)
        return len(lines) > 0

    def diagnose_and_fix(self):
        """🩺 Protocolo de auto-cura do repositório Git."""
        logger.info("🩺 Iniciando diagnóstico Git PhD Autônomo...")
        if not (self.root / ".git").exists(): return logger.error("❌ Não é um repositório Git!")

        self._clear_locks()
        self._handle_active_conflicts()
        self.run_command(["rm", "-r", "--cached", "**/__pycache__/*"])
        self._clean_submodules()
        
        logger.info("✅ Diagnóstico concluído.")
        print(f"\n--- STATUS ---\n{self.run_command(['status', '--short', '--branch']).stdout}")

if __name__ == "__main__":
    doctor = GitDoctor(os.getcwd())
    doctor.diagnose_and_fix()
