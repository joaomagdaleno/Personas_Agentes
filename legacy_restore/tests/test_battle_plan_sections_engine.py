"""Testes para BattlePlanSectionsEngine"""
import unittest
import logging

logger = logging.getLogger("test_battle_plan_sections_engine")

class TestBattlePlanSectionsEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.battle_plan_sections_engine import BattlePlanSectionsEngine
        self.engine = BattlePlanSectionsEngine()

    def test_format_severity_group(self):
        items = ["Alerta de segurança"]
        result = self.engine.format_severity_group("STRATEGIC", items, self.engine.format_item_entry)
        self.assertIn("STRATEGIC", result)

    def test_filter_active_results(self):
        items = [{"file": "a.py", "line": 1, "severity": "HIGH"}, {"file": "a.py", "line": 1, "severity": "HEALED"}]
        result = self.engine.filter_active_results(items, lambda i: f"{i['file']}:{i['line']}")
        self.assertEqual(len(result), 1)

if __name__ == '__main__': unittest.main()
