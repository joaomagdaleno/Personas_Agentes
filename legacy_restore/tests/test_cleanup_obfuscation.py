import unittest
import logging
from unittest.mock import MagicMock, patch
from scripts.cleanup_obfuscation import AutoDeobfuscator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCleanupObfuscation")

class TestCleanupObfuscation(unittest.TestCase):
    @patch('scripts.cleanup_obfuscation.ObfuscationHunter')
    def test_init(self, mock_h):
        logger.info("⚡ Testando inicialização do AutoDeobfuscator...")
        de = AutoDeobfuscator("root")
        self.assertTrue(mock_h.called)
        logger.info("✅ Inicialização validada.")

    def test_deobfuscation_logic(self):
        """Valida se o AutoDeobfuscator reconstrói strings ofuscadas."""
        logger.info("⚡ Testando lógica de reconstrução de strings...")
        import tempfile
        from pathlib import Path
        
        content = 'x = "ev" + "al"\ny = "sy" + "st" + "em"\nz = "normal string"'
        
        with tempfile.NamedTemporaryFile(suffix='.py', mode='w', delete=False) as tf:
            tf.write(content)
            tf_path = Path(tf.name)
            
        try:
            de = AutoDeobfuscator(tf_path.parent)
            success = de.process_file(tf_path)
            
            new_content = tf_path.read_text()
            if not success:
                logger.error(f"DEBUG: process_file falhou. Conteúdo: {new_content}")
            
            self.assertTrue(success)
            self.assertIn("'eval'", new_content)
            self.assertIn("'system'", new_content)
            self.assertIn('"normal string"', new_content)
            logger.info("✅ Reconstrução de strings validada.")
        finally:
            if tf_path.exists():
                tf_path.unlink()

if __name__ == '__main__':
    unittest.main()
