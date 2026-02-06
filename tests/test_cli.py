import unittest
from unittest.mock import MagicMock, patch
from src_local.interface.cli import main

class TestCLI(unittest.TestCase):
    @patch('src_local.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py'])
    def test_main(self, mock_orch):
        main()
        self.assertTrue(mock_orch.called)

if __name__ == '__main__':
    unittest.main()
