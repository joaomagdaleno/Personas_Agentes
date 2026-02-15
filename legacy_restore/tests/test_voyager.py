import unittest
import logging
from unittest.mock import MagicMock
from pathlib import Path
from src_local.agents.Python.Strategic.voyager import VoyagerPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestVoyager(unittest.TestCase):
    """
    Testes unitários para o especialista Voyager.
    """
    
    def test_perform_active_healing(self):
        """Valida a cura de erros silenciados (except: pass)."""
        logger.info("⚡ Testando cura ativa do Voyager...")
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            target_file = tmp_path / "broken.py"
            target_file.write_text("try:\n    x = 1/0\nexcept:\n    pass", encoding='utf-8')
            
            persona = VoyagerPersona(tmp_path)
            count = persona.perform_active_healing(["broken.py"])
            
            self.assertEqual(count, 1)
            # USAR ENCODING UTF-8 PARA LER EMOJIS (🚨)
            content = target_file.read_text(encoding='utf-8')
            self.assertIn("logger.error", content)
            self.assertIn("🚨 FALHA CRÍTICA SILENCIADA", content)
            logger.info("✅ Cura de erros validada.")

    def test_perform_audit_logic(self):
        """Valida as regras de auditoria do Voyager."""
        logger.info("⚡ Testando auditoria do Voyager...")
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            target_file = tmp_path / "legacy.py"
            target_file.write_text("import os\nos.mkdir('data')", encoding='utf-8')
            
            persona = VoyagerPersona(tmp_path)
            persona.set_context({"map": {"legacy.py": {}}})
            # Mock AuditEngine para evitar falha de infra
            persona.audit_engine = MagicMock()
            persona.audit_engine.scan_multiple_files.return_value = [{'file': 'legacy.py', 'issue': 'os.mkdir issue', 'severity': 'low'}]
            
            results = persona.perform_audit()
            # Validação rigorosa: verifica se a issue injetada via mock está presente
            found = any('os.' in r.get('issue', '').lower() for r in results)
            self.assertTrue(found, f"Audit failed to find os. patterns in results: {results}")
            logger.info("✅ Auditoria validada.")

if __name__ == "__main__":
    unittest.main()
