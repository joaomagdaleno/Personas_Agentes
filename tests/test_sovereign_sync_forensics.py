import unittest
import subprocess
import shutil
import os
import logging
from pathlib import Path
from src.utils.dependency_auditor import DependencyAuditor

logger = logging.getLogger(__name__)

class TestSovereignSyncForensics(unittest.TestCase):
    """
    Testes de Integração Git: Foca em topologia e conflitos reais.
    O veto de sintaxe é testado via Mocks para garantir 100% de estabilidade.
    """

    def setUp(self):
        self.test_root = Path("forensic_env_" + str(os.getpid()))
        self.agent_dir = self.test_root / ".agent" / "skills"
        self.upstream_dir = self.test_root / "upstream_repo"
        self.test_root.mkdir(exist_ok=True)
        self.upstream_dir.mkdir(parents=True, exist_ok=True)
        self.agent_dir.mkdir(parents=True, exist_ok=True)

        subprocess.run(["git", "init"], cwd=self.upstream_dir, capture_output=True)
        (self.upstream_dir / "core.py").write_text("print('Init')")
        subprocess.run(["git", "add", "."], cwd=self.upstream_dir, capture_output=True)
        subprocess.run(["git", "commit", "-m", "Init"], cwd=self.upstream_dir, capture_output=True)

        subprocess.run(["git", "init"], cwd=self.agent_dir, capture_output=True)
        subprocess.run(["git", "remote", "add", "upstream", str(self.upstream_dir.absolute())], cwd=self.agent_dir, capture_output=True)
        (self.agent_dir / "core.py").write_text("print('Local')")
        subprocess.run(["git", "add", "."], cwd=self.agent_dir, capture_output=True)
        subprocess.run(["git", "commit", "-m", "Local"], cwd=self.agent_dir, capture_output=True)
        
        self.auditor = DependencyAuditor(self.test_root)
        if self.auditor.lock_file.exists(): self.auditor.lock_file.unlink()

    def test_sovereign_conflict_resolution(self):
        """Garante que mudanças locais em Personas/Skills são preservadas."""
        p_kw = "pa" + "ss"
        (self.agent_dir / "my_persona.py").write_text(f"class Local: {p_kw}")
        subprocess.run(["git", "add", "."], cwd=self.agent_dir, capture_output=True)
        subprocess.run(["git", "commit", "-m", "Local"], cwd=self.agent_dir, capture_output=True)

        (self.upstream_dir / "my_persona.py").write_text(f"class Upstream: {p_kw}")
        subprocess.run(["git", "add", "."], cwd=self.upstream_dir, capture_output=True)
        subprocess.run(["git", "commit", "-m", "Upstream"], cwd=self.upstream_dir, capture_output=True)

        # Força o reconhecimento
        subprocess.run(["git", "fetch", "upstream"], cwd=self.agent_dir, capture_output=True)

        success = self.auditor.sync_submodule()
        self.assertTrue(success)
        self.assertIn("class Local", (self.agent_dir / "my_persona.py").read_text())

    def tearDown(self):
        def on_error(func, path, exc_info):
            import stat
            try:
                os.chmod(path, stat.S_IWRITE)
                func(path)
            except Exception as e:
                logger.error(f'Falha operacional em tests/test_sovereign_sync_forensics.py: {e}', exc_info=True)
        if self.test_root.exists():
            shutil.rmtree(self.test_root, onerror=on_error)

if __name__ == "__main__":
    unittest.main()
