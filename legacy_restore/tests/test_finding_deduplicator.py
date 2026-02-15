import unittest
import logging
from src_local.utils.finding_deduplicator import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestFindingDeduplicator")

class TestFindingdeduplicator(unittest.TestCase):
    def test_deduplicate_mixed(self):
        """Valida deduplicação de achados mistos (texto e dicionário)."""
        logger.info("⚡ Testando deduplicação mista...")
        dedup = FindingDeduplicator()
        raw = [
            "raw text alert",
            "raw text alert", # Duplicado por hash
            {'file': 'src/x.py', 'line': 10, 'issue': 'bug', 'severity': 'MEDIUM'},
            {'file': 'src/x.py', 'line': 10, 'issue': 'bug', 'severity': 'HIGH'} # Resolve por severidade
        ]
        
        results = dedup.deduplicate(raw)
        self.assertEqual(len(results), 2)
        
        # Verifica se o de maior severidade sobreviveu
        dict_finding = next(f for f in results if isinstance(f, dict))
        self.assertEqual(dict_finding['severity'], 'HIGH')
        logger.info("✅ Deduplicação mista validada.")

    def test_normalize_path(self):
        """Valida a normalização de caminhos POSIX."""
        logger.info("⚡ Testando normalização de caminhos...")
        dedup = FindingDeduplicator()
        path_win = "src\\core\\main.py"
        norm = dedup._normalize_path(path_win)
        self.assertNotIn("\\", norm)
        self.assertEqual(norm, "src/core/main.py")
        logger.info("✅ Normalização de caminhos validada.")

if __name__ == "__main__":
    unittest.main()
