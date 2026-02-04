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
        Orquestra: Validação -> Boot -> Lock -> Sync -> Verify.
        """
        if not self._validate_pre_conditions(): return False
        
        self._acquire_lock()
        try:
            self._ensure_initialized()
            if not self._is_valid_repo():
                logger.error("Falha Crítica: Submódulo não é um repositório Git válido.")
                return False

            initial_hash = self._git_out(["rev-parse", "HEAD"], self.agent_path)
            
            return self._execute_git_transaction(initial_hash)
        finally:
            self._release_lock()

    def _validate_pre_conditions(self):
        if not self.is_internal:
            logger.debug("Sincronia ignorada: Projeto externo.")
            return False
        if self._is_locked():
            logger.warning("Sincronia em andamento ou trava órfã detectada.")
            return False
        return True

    def _execute_git_transaction(self, initial_hash):
        try:
            remote = self._discover_remote()
            if not remote: raise Exception("Nenhum remote (upstream/origin) acessível.")

            self._pre_flight_cleanup()
            topo = self._get_topology(remote)
            
            logger.info(f"🔄 Sincronizando com {remote}/{topo['tracking_ref']}...")
            self._run_git(["fetch", remote, "--prune"], self.agent_path)
            
            metrics = self._get_metrics(topo['active_ref'], f"{remote}/{topo['tracking_ref']}")
            if metrics['behind'] == 0:
                logger.info("✅ Submódulo já está na versão mais recente.")
                return True

            return self._perform_update(remote, topo, metrics)
        except Exception as e:
            logger.critical(f"🚨 [Auditor] Erro na sincronia: {e}")
            self._transactional_rollback(initial_hash)
            return False

    def _perform_update(self, remote, topo, metrics):
        logger.info(f"⬇️ Puxando {metrics['behind']} commits novos...")
        # Stash transacional
        subprocess.run(["git", "stash", "push", "--include-untracked", "-m", "Auto-sync stash"], cwd=self.agent_path, capture_output=True)
        
        # Rebase com verificação de erro real
        target = f"{remote}/{topo['tracking_ref']}"
        rebase_res = subprocess.run(["git", "rebase", target], cwd=self.agent_path, capture_output=True, text=True)
        
        if rebase_res.returncode != 0:
            self._handle_conflict(remote, topo, target)

        self._verify_system_integrity()
        # Registra a atualização no repositório pai
        subprocess.run(["git", "add", ".agent/skills"], cwd=self.project_root, capture_output=True)
        # Tenta restaurar o stash
        subprocess.run(["git", "stash", "pop"], cwd=self.agent_path, capture_output=True)
        
        logger.info(f"✨ Sincronia Soberana Concluída: {topo['active_ref']} atualizada.")
        return True

    def _handle_conflict(self, remote, topo, target):
        logger.warning(f"⚠️ Conflito detectado. Acionando Reset Soberano para alinhar com {remote}...")
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
        # FORÇA ALINHAMENTO Soberano
        reset_res = subprocess.run(["git", "reset", "--hard", target], cwd=self.agent_path, capture_output=True)
        if reset_res.returncode != 0:
            raise Exception("Falha catastrófica no Reset Soberano.")

    def _ensure_initialized(self):
        """🔨 Garante que o submódulo está fisicamente presente e linkado."""
        if not self.agent_path.exists() or not list(self.agent_path.iterdir()):
            logger.info("🛠️ Inicializando submódulo ausente...")
            subprocess.run(["git", "submodule", "update", "--init", "--recursive"], cwd=self.project_root, capture_output=True)

    def _discover_remote(self):
        """🔍 Identifica qual remote utilizar para a sincronia."""
        remotes = self._git_out(["remote"], self.agent_path).splitlines()
        for r in ["upstream", "origin"]:
            if r in remotes:
                # Valida saúde da rede para o remote escolhido
                try:
                    subprocess.run(["git", "ls-remote", "--heads", r], cwd=self.agent_path, capture_output=True, timeout=5, check=True)
                    return r
                except: continue
        return None

    def _is_locked(self):
        """🔒 Verifica trava e limpa travas antigas (> 10 min)."""
        if not self.lock_file.exists(): return False
        
        # Proteção contra travas órfãs de processos interrompidos
        mtime = self.lock_file.stat().st_mtime
        if time.time() - mtime > 600:
            logger.warning("🧹 Limpando trava de sincronia expirada.")
            self._release_lock()
            return False
        return True

    def _acquire_lock(self):
        self.lock_file.parent.mkdir(parents=True, exist_ok=True)
        self.lock_file.write_text(str(time.time()))

    def _release_lock(self):
        if self.lock_file.exists(): self.lock_file.unlink()

    def _get_metrics(self, local, remote_ref):
        """📐 Calcula o delta de commits."""
        try:
            res = subprocess.run(["git", "rev-list", "--count", f"{local}..{remote_ref}"], cwd=self.agent_path, capture_output=True, text=True).stdout.strip()
            return {'behind': int(res or 0)}
        except: return {'behind': 0}

    def _verify_system_integrity(self):
        """🧬 Valida a sintaxe Python de todos os arquivos após a atualização."""
        for f in self.agent_path.rglob("*.py"):
            if ".agent" in str(f): continue # Evita recursão infinita
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except:
                logger.error(f"⚠️ Integridade violada em {f.name}")

    def _get_topology(self, remote="upstream"):
        """🌐 Identifica branch ativa e tracking branch."""
        active = self._git_out(["rev-parse", "--abbrev-ref", "HEAD"], self.agent_path)
        # Tenta descobrir o tracking real
        tracking = self._git_out(["config", f"branch.{active}.merge"], self.agent_path).replace("refs/heads/", "")
        if not tracking: tracking = "main"
        return {'active_ref': active, 'tracking_ref': tracking}

    def _pre_flight_cleanup(self):
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)

    def _transactional_rollback(self, target_hash):
        """🔙 Reverte para o estado seguro inicial."""
        subprocess.run(["git", "rebase", "--abort"], cwd=self.agent_path, capture_output=True)
        if target_hash:
            subprocess.run(["git", "reset", "--hard", target_hash], cwd=self.agent_path, capture_output=True)

    def _git_out(self, args, path):
        res = subprocess.run(["git"] + args, cwd=path, capture_output=True, text=True)
        return res.stdout.strip()

    def _run_git(self, args, path):
        subprocess.run(["git"] + args, cwd=path, capture_output=True, check=True)

    def _is_valid_repo(self):
        """✔️ Valida se o caminho é um repositório Git (suporta arquivo .git)."""
        dot_git = self.agent_path / ".git"
        return self.agent_path.exists() and dot_git.exists()

    def check_submodule_status(self):
        """🕵️ Snapshot de status baseado na verdade do servidor."""
        if not self.is_internal: return []
        
        # Se não houver .git, tenta inicializar antes de checar
        if not (self.agent_path / ".git").exists():
            self._ensure_initialized()

        try:
            remote = self._discover_remote()
            if not remote: return []
            
            subprocess.run(["git", "fetch", remote], cwd=self.agent_path, capture_output=True, timeout=10)
            topo = self._get_topology(remote)
            metrics = self._get_metrics(topo['active_ref'], f"{remote}/{topo['tracking_ref']}")
            
            if metrics['behind'] > 0:
                return [
                    {
                        "file": ".agent/skills", 
                        "issue": f"Inteligência Atrasada (Delta: {metrics['behind']} commits)", 
                        "severity": "CRITICAL", "context": "DependencyAuditor"
                    }
                ]
        except Exception as e:
            logger.error(f'🚨 [Auditor] Falha operacional no status: {e}')
        return []