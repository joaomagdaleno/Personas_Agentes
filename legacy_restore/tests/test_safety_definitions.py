import unittest
from src_local.agents.Support.safety_definitions import SAFE_METADATA_VARS, ANALYZER_CLASSES

class TestSafetyDefinitions(unittest.TestCase):
    def test_constants_presence(self):
        self.assertIn('MetaAnalysisDetector', ANALYZER_CLASSES)
        self.assertIn('evidences', SAFE_METADATA_VARS)

if __name__ == '__main__':
    unittest.main()
