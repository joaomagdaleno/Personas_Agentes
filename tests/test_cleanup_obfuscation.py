import unittest
from unittest.mock import MagicMock, patch
from scripts.cleanup_obfuscation import AutoDeobfuscator

class TestCleanupObfuscation(unittest.TestCase):
    @patch('scripts.cleanup_obfuscation.ObfuscationHunter')
    def test_init(self, mock_h):
        de = AutoDeobfuscator("root")
        self.assertTrue(mock_h.called)

if __name__ == '__main__':
    unittest.main()
