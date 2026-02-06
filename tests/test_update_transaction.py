import unittest
from unittest.mock import MagicMock
from src_local.utils.update_transaction import UpdateTransaction

class TestUpdateTransaction(unittest.TestCase):
    def test_init(self):
        mock_git = MagicMock()
        tx = UpdateTransaction(mock_git, "root")
        self.assertEqual(tx.git, mock_git)

if __name__ == '__main__':
    unittest.main()
