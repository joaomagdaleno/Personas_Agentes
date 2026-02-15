import unittest
import sys
import logging
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))
from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestObfuscationHunter")

class TestObfuscationHunter(unittest.TestCase):
    def test_concatenation_detection(self):
        logger.info("⚡ Testando detecção de ofuscação por concatenação...")
        hunter = ObfuscationHunter()
        
        # Test Case 1: Simple Concatenation
        code1 = 'x = "sh" + "ell=True"'
        findings1 = hunter.scan_file("test1.py", code1)
        self.assertEqual(len(findings1), 1)
        self.assertIn("shell=True", findings1[0]["reconstruction"])

        # Test Case 2: Multi-step Concatenation
        code2 = 'x = "e" + "v" + "al"'
        findings2 = hunter.scan_file("test2.py", code2)
        self.assertEqual(len(findings2), 1)
        self.assertIn("eval", findings2[0]["reconstruction"])

        # Test Case 3: Harmless Concatenation
        code3 = 'msg = "Hello " + "World"'
        findings3 = hunter.scan_file("test3.py", code3)
        self.assertEqual(len(findings3), 0)

        # Test Case 4: Broken Keyword
        code4 = 'x = "shell=" + "True"' 
        findings4 = hunter.scan_file("test4.py", code4)
        self.assertEqual(len(findings4), 1)
        logger.info("✅ Detecção de ofuscação validada.")

if __name__ == '__main__':
    unittest.main()
