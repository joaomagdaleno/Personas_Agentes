import unittest
from pathlib import Path
from src_local.utils.persona_loader import PersonaLoader

class TestPersonaLoader(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o PersonaLoader."""

    def test_mobilization_logic(self):
        """Valida se o loader identifica PhDs no disco."""
        # Usa o próprio projeto como teste para validar detecção
        project_root = Path.cwd()
        mock_orchestrator = unittest.mock.MagicMock()
        
        count = PersonaLoader.mobilize_all(project_root, mock_orchestrator)
        # Deve ter mobilizado ao menos Bolt, Hermes, Probe, Sentinel, etc.
        self.assertGreaterEqual(count, 5)
        self.assertGreaterEqual(len(mock_orchestrator.add_persona.call_args_list), 5)

if __name__ == "__main__":
    unittest.main()
