
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
from src_local.utils.dependency_auditor import DependencyAuditor

class TestDependencyAuditorDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Auditor de Dependências 📦"""

    def setUp(self):
        self.project_root = Path("Personas_Agentes_Internal")
        self.auditor = DependencyAuditor(self.project_root)

    @patch('subprocess.run')
    def test_check_submodule_status_behind(self, mock_run):
        """Valida detecção de commits atrasados no submódulo."""
        # Mock para _is_valid_repo
        with patch.object(DependencyAuditor, '_is_valid_repo', return_value=True):
            # Mock para discover_remote e _get_topology
            with patch.object(self.auditor.git, 'discover_remote', return_value='origin'):
                with patch.object(DependencyAuditor, '_get_topology', return_value={'active_ref': 'main', 'tracking_ref': 'main'}):
                    # Mock para subprocess que retorna o número de commits atrasados (3)
                    mock_run.return_value = MagicMock(stdout="3\n", returncode=0)
                    
                    status = self.auditor.check_submodule_status()
                    self.assertEqual(len(status), 1)
                    self.assertIn("Delta: 3", status[0]["issue"])
                    self.assertEqual(status[0]["severity"], "CRITICAL")

    @patch('subprocess.run')
    def test_check_submodule_status_up_to_date(self, mock_run):
        """Valida comportamento quando o submódulo está atualizado."""
        with patch.object(DependencyAuditor, '_is_valid_repo', return_value=True):
            with patch.object(self.auditor.git, 'discover_remote', return_value='origin'):
                with patch.object(DependencyAuditor, '_get_topology', return_value={'active_ref': 'main', 'tracking_ref': 'main'}):
                    mock_run.return_value = MagicMock(stdout="0\n", returncode=0)
                    
                    status = self.auditor.check_submodule_status()
                    self.assertEqual(len(status), 0)

    def test_lock_mechanism(self):
        """Valida o mecanismo de trava para evitar execuções concorrentes."""
        # Setup: Garantir que o diretório temporário de testes exista
        mock_lock_dir = Path("mock_gemini")
        mock_lock_dir.mkdir(exist_ok=True)
        self.auditor.lock_file = mock_lock_dir / "sync.lock"
        
        try:
            self.assertFalse(self.auditor._is_locked())
            self.auditor._acquire_lock()
            self.assertTrue(self.auditor._is_locked())
            self.auditor._release_lock()
            self.assertFalse(self.auditor._is_locked())
        finally:
            if self.auditor.lock_file.exists(): self.auditor.lock_file.unlink()
            mock_lock_dir.rmdir()

    @patch('subprocess.run')
    def test_network_health_check(self, mock_run):
        """Valida detecção de saúde da rede via git ls-remote."""
        # Simula sucesso na rede
        with patch.object(self.auditor.git, 'discover_remote', return_value='origin'):
            self.assertTrue(self.auditor._verify_network_health())
        
        # Simula falha na rede
        with patch.object(self.auditor.git, 'discover_remote', return_value=None):
            self.assertFalse(self.auditor._verify_network_health())

if __name__ == "__main__":
    unittest.main()
