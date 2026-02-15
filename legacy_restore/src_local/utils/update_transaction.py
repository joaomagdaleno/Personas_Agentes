from logging import getLogger
logger = getLogger(__name__)

class UpdateTransaction:
    """Gerencia a transação de atualização do submódulo."""
    
    def __init__(self, git_client, project_root):
        self.git = git_client
        self.root = project_root

    def execute(self, initial_hash):
        try:
            remote = self.git.discover_remote()
            if not remote: return False

            self.git.rebase_abort()
            self._sync_fetch(remote)
            
            commits_behind = self.git.get_commit_count(f"HEAD..{remote}/main")
            if commits_behind == 0:
                logger.info("✅ Versão Atualizada.")
                return True

            return self._perform_update(remote, {'tracking_ref': 'main'}, commits_behind)
        except Exception as e:
            logger.critical(f"🚨 Erro Sync: {e}")
            self._rollback(initial_hash)
            return False

    def _sync_fetch(self, remote):
        logger.info(f"🔄 Sync: {remote}")
        self.git.fetch_prune(remote)

    def _perform_update(self, remote, topo, count):
        import subprocess
        logger.info(f"⬇️ Puxando {count} commits...")
        self.git.stash_push("Auto-sync")
        
        target = f"{remote}/{topo['tracking_ref']}"
        if self.git.rebase(target).returncode != 0:
            self._handle_conflict(remote, target)

        self._verify_system_integrity()
        
        subprocess.run(["git", "add", ".agent/skills"], cwd=self.root, capture_output=True)
        self.git.stash_pop()
        
        logger.info("✨ Sync Sucesso.")
        return True

    def _handle_conflict(self, remote, target):
        logger.warning(f"⚠️ Reset Hard para {target}")
        self.git.rebase_abort()
        if self.git.reset_hard(target).returncode != 0:
            raise Exception("Falha Fatal Reset.")

    def _rollback(self, target_hash):
        self.git.rebase_abort()
        if target_hash: self.git.reset_hard(target_hash)

    def _verify_system_integrity(self):
        import ast
        py_files = list(self.git.cwd.rglob("*.py"))
        # Otimização de I/O: Pré-leitura em lote
        for f in py_files:
            if ".agent" in str(f) and self.git.cwd not in f.parents: continue
            try:
                source = f.read_text(encoding='utf-8', errors='ignore')
                if source.strip(): ast.parse(source)
            except:
                logger.error(f"⚠️ Integridade violada em {f.name}")
                raise Exception(f"Integridade violada em {f.name}")
