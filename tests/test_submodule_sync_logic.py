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
        mock_path = MagicMock()
        mock_path.exists.return_value = False
        self.assertFalse(self.logic.is_locked(mock_path))

if __name__ == '__main__': unittest.main()
