import unittest
import logging
from unittest.mock import MagicMock, patch
from pathlib import Path
from src_local.utils.dependency_auditor import DependencyAuditor

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSyncEngineMocks")

class TestSyncEngineMocks(unittest.TestCase):
    def setUp(self):
        self.project_root = Path("Personas_Agentes_Mock")
        self.auditor = DependencyAuditor(self.project_root)
        if self.auditor.lock_file.exists(): self.auditor.lock_file.unlink()

    @patch('subprocess.run')
    def test_logic_success_no_diff(self, mock_run):
        logger.info("⚡ Testando sucesso de sincronia sem divergências...")
        mock_run.return_value = MagicMock(stdout="0", returncode=0)
        with patch.object(DependencyAuditor, '_is_valid_repo', return_value=True):
            with patch.object(DependencyAuditor, '_validate_pre_conditions', return_value=True):
                with patch.object(self.auditor.git, 'discover_remote', return_value='origin'):
                    success = self.auditor.sync_submodule()
                    self.assertTrue(success)
        logger.info("✅ Sucesso de sincronia validado.")

    @patch('subprocess.run')
    @patch('pathlib.Path.rglob')
    @patch('pathlib.Path.read_text')
    def test_logic_syntax_veto(self, mock_read, mock_rglob, mock_run):
        logger.info("⚡ Testando veto de sintaxe...")
        # Configura Mock para simular divergência
        mock_run.return_value = MagicMock(stdout="5", returncode=0)
        # Simula arquivo encontrado pelo rglob
        broken_file = MagicMock(spec=Path)
        broken_file.name = "broken.py"
        broken_file.suffix = ".py" # Importante para rglob match se for o caso, mas aqui estamos injetando a lista
        broken_file.read_text.return_value = "if True: pass else: fail"
        mock_rglob.return_value = [broken_file]
        
        with patch.object(DependencyAuditor, '_is_valid_repo', return_value=True):
            with patch.object(DependencyAuditor, '_validate_pre_conditions', return_value=True):
                with patch.object(self.auditor.git, 'discover_remote', return_value='origin'):
                    success = self.auditor.sync_submodule()
                    self.assertFalse(success, "Deveria falhar por erro de sintaxe.")
        logger.info("✅ Veto de sintaxe validado.")

    def tearDown(self):
        if self.auditor.lock_file.exists(): self.auditor.lock_file.unlink()

if __name__ == "__main__":
    unittest.main()
