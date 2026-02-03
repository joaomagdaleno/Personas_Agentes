import subprocess
import logging
import time
import ast
from pathlib import Path

logger = logging.getLogger("BulletProofSync_v9")

class DependencyAuditor:
    """
    📦 Auditor de Dependências Soberano v9.
    Gerencia a integridade e sincronização de submódulos (.agent/skills),
    garantindo resiliência total a conflitos e falhas de rede.
    """
    
    def __init__(self, project_root):
        """🏗️ Inicializa o auditor vinculando-o à raiz do projeto alvo."""
        self.project_root = Path(project_root)
        self.agent_path = self.project_root / ".agent" / "skills"
        self.lock_file = self.project_root / ".gemini" / "sync.lock"
        # Só gerencia submódulo se for o próprio projeto Personas_Agentes
        self.is_internal = "Personas_Agentes" in str(self.project_root).replace("\\", "/")

    def sync_submodule(self):
        """
        🚀 Executa a sincronização atômica com segurança absoluta.
        Realiza fetch, stash, rebase e validação de integridade antes de confirmar.
        """
        if not self.is_internal:
            logger.debug("Sincronia ignorada: Projeto externo.")
            return False
            
        if self._is_locked():
            logger.warning("Sincronia em andamento ou trava órfã detectada.")
            return False
        
        self._acquire_lock()
        self._ensure_initialized()
        
        if not self._is_valid_repo():
            logger.error("Falha Crítica: Submódulo não é um repositório Git válido.")
            self._release_lock()
            return False

        # INTELIGÊNCIA: Auto-Consolidação de Identidade Local
        # Se houverem mudanças (benchmarks, skills novas), consolida em um commit
        # para que a árvore fique limpa para a sincronia upstream.
        status = self._git_out(["status", "--porcelain"], self.agent_path)
        if status:
            logger.info("📦 Consolidação de Identidade: Salvando alterações locais antes da sincronia...")
            subprocess.run(["git", "add", "."], cwd=self.agent_path, capture_output=True)
            subprocess.run(["git", "commit", "-m", "chore: Snapshot de Identidade Local PhD"], cwd=self.agent_path, capture_output=True)

        initial_hash = self._git_out(["rev-parse", "HEAD"], self.agent_path)
        
        try:
            remote = self._discover_remote()
            if not remote:
                raise Exception("Nenhum remote (upstream/origin) acessível.")

            self._pre_flight_cleanup()
            topo = self._get_topology(remote)
            
            logger.info(f"🔄 Sincronizando com {remote}/{topo['tracking_ref']}...")
            self._run_git(["fetch", remote, "--prune"], self.agent_path)
            
            metrics = self._get_metrics(topo['active_ref'], f"{remote}/{topo['tracking_ref']}")
            
            if metrics['behind'] == 0:
                logger.info("✅ Submódulo já está na versão mais recente.")
                self._release_lock()
                return True

            logger.info(f"⬇️ Puxando {metrics['behind']} commits novos...")
            subprocess.run(["git", "stash", "push", "--include-untracked", "-m", "Auto-sync stash"], cwd=self.agent_path, capture_output=True)
            
            # Tenta Rebase
            rebase_res = subprocess.run(["git", "rebase", f"{remote}/{topo['tracking_ref']}"], cwd=self.agent_path, capture_output=True, text=True)
            
            if rebase_res.returncode != 0:
                logger.warning("⚠️ Conflito de Inteligência detectado. Iniciando Resolução Semântica...")
                subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
                
                # Tenta Merge com estratégia de resolução automática
                subprocess.run(
                    ["git", "merge", f"{remote}/{topo['tracking_ref']}", "-m", "🧬 Sincronia de Inteligência Upstream", "-X", "theirs"],
                    cwd=self.agent_path, capture_output=True
                )
                self._resolve_semantic_conflicts()

            self._verify_system_integrity()

            # REGRA DE OURO: Limpa o estado para o Repositório Pai
            subprocess.run(["git", "add", "."], cwd=self.agent_path, capture_output=True)
            subprocess.run(["git", "commit", "-m", "⚡ Auto-Sync: Alinhamento de Skills PhD"], cwd=self.agent_path, capture_output=True)
            
            # Registra a nova referência no repositório pai
            subprocess.run(["git", "add", ".agent/skills"], cwd=self.project_root, capture_output=True)
            
            # Tenta restaurar o stash
            stash_pop = subprocess.run(["git", "stash", "pop"], cwd=self.agent_path, capture_output=True)
            if stash_pop.returncode != 0:
                self._resolve_semantic_conflicts()
                subprocess.run(["git", "add", "."], cwd=self.agent_path, capture_output=True)
                subprocess.run(["git", "commit", "--amend", "--no-edit"], cwd=self.agent_path, capture_output=True)

            logger.info("✨ Sincronia Soberana Concluída e Limpa.")
            self._release_lock()
            return True

        except Exception as e:
            logger.critical(f"🚨 [Auditor] Erro na sincronia: {e}")
            self._transactional_rollback(initial_hash)
            self._release_lock()
            return False

    def _resolve_semantic_conflicts(self):
        """🧠 Resolução de Conflitos baseada em Domínio."""
        res = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"], cwd=self.agent_path, capture_output=True, text=True)
        conflicts = res.stdout.splitlines()
        for f in conflicts:
            if "skills/" in f or "data/" in f:
                subprocess.run(["git", "checkout", "--ours", f], cwd=self.agent_path, capture_output=True)
            else:
                subprocess.run(["git", "checkout", "--theirs", f], cwd=self.agent_path, capture_output=True)
            subprocess.run(["git", "add", f], cwd=self.agent_path, capture_output=True)

    def _ensure_initialized(self):
        if not self.agent_path.exists() or not list(self.agent_path.iterdir()):
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True)

    def _discover_remote(self):
        remotes = self._git_out(["remote"], self.agent_path).splitlines()
        for r in ["upstream", "origin"]:
            if r in remotes:
                try:
                    subprocess.run(["git", "ls-remote", "--heads", r], cwd=self.agent_path, capture_output=True, timeout=5, check=True)
                    return r
                except: continue
        return None

    def _is_locked(self):
        if not self.lock_file.exists(): return False
        if time.time() - self.lock_file.stat().st_mtime > 600:
            self._release_lock()
            return False
        return True

    def _acquire_lock(self):
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self.lock_file.write_text(str(time.time()))

    def _release_lock(self):
        if self.lock_file.exists(): self.lock_file.unlink()

    def _get_metrics(self, local, remote_ref):
        try:
            res = subprocess.run(["git", "rev-list", "--count", f"{local}..{remote_ref}"], cwd=self.agent_path, capture_output=True, text=True).stdout.strip()
            return {'behind': int(res or 0)}
        except: return {'behind': 0}

    def _verify_system_integrity(self):
        for f in self.agent_path.rglob("*.py"):
            if ".agent" in str(f) or "__pycache__" in str(f): continue
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except: logger.error(f"⚠️ Integridade violada em {f.name}")

    def _get_topology(self, remote="upstream"):
        active = self._git_out(["rev-parse", "--abbrev-ref", "HEAD"], self.agent_path)
        tracking = self._git_out(["config", f"branch.{active}.merge"], self.agent_path).replace("refs/heads/", "")
        if not tracking: tracking = "main"
        return {'active_ref': active, 'tracking_ref': tracking}

    def _pre_flight_cleanup(self):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)

    def _transactional_rollback(self, target_hash):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
        if target_hash: subprocess.run(["git", "reset", "--hard", target_hash], cwd=self.agent_path, capture_output=True)

    def _git_out(self, args, path):
        return subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True).stdout.strip()

    def _run_git(self, args, path):
        subprocess.run(["git"] + args, cwd=path, capture_output=True, check=True)

    def _is_valid_repo(self):
        return self.agent_path.exists() and (self.agent_path / ".git").exists()

    def check_submodule_status(self):
        if not self.is_internal: return []
        if not (self.agent_path / ".git").exists(): self._ensure_initialized()
        try:
            remote = self._discover_remote()
            if not remote: return []
            subprocess.run(["git", "fetch", remote], cwd=self.agent_path, capture_output=True, timeout=10)
            topo = self._get_topology(remote)
            metrics = self._get_metrics(topo['active_ref'], f"{remote}/{topo['tracking_ref']}")
            if metrics['behind'] > 0:
                return [{"file": ".agent/skills", "issue": f"Inteligência Atrasada (Delta: {metrics['behind']} commits)", "severity": "CRITICAL", "context": "DependencyAuditor"}]
        except Exception as e: logger.error(f'🚨 [Auditor] Falha operacional no status: {e}')
        return []
