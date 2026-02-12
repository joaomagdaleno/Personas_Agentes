"""Testes para SubmoduleSyncLogic"""
import unittest
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_submodule_sync_logic")

class TestSubmoduleSyncLogic(unittest.TestCase):
    def setUp(self):
        from src_local.utils.submodule_sync_logic import SubmoduleSyncLogic
        self.logic = SubmoduleSyncLogic()

    def test_is_locked(self):
        import time
        mock_path = MagicMock()
        mock_path.exists.return_value = False
        self.assertFalse(self.logic.is_locked(mock_path))
        
        # Test 2: Locked (recent mtime)
        mock_path.exists.return_value = True
        mock_path.stat.return_value.st_mtime = time.time()
        self.assertTrue(self.logic.is_locked(mock_path))
        
        # Test 3: Expired Lock
        mock_path.stat.return_value.st_mtime = time.time() - 700 # > 10 min
        self.assertFalse(self.logic.is_locked(mock_path))

if __name__ == '__main__': unittest.main()
