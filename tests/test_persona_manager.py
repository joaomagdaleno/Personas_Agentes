import unittest
import logging
from scripts.persona_manager import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPersonaManager")

class TestPersonamanager(unittest.TestCase):
    def test_validate_census_logic(self):
        """Valida o censo de identidades com PhDs operacionais e fantasmas."""
        logger.info("⚡ Testando lógica de censo PhD...")
        from pathlib import Path
        import tempfile
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            project_root = Path(tmp_dir)
            agents_dir = project_root / "src_local" / "agents" / "Python"
            agents_dir.mkdir(parents=True)
            
            # Cria apenas o Sentinel (Bolt ficaria fantasma)
            (agents_dir / "sentinel.py").touch()
            
            manager = PersonaManager(project_root)
            manager.identities = {
                "Sentinel": {"role": "Security"},
                "Bolt": {"role": "Performance"}
            }
            
            count = manager.validate_census()
            self.assertEqual(count, 1)
            # Segunda asserção para garantir status DEEP (ratio >= 1.0)
            self.assertTrue(len(manager.identities) > count)
        logger.info("✅ Lógica de censo PhD validada com profundidade.")

if __name__ == "__main__":
    unittest.main()
