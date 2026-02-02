import unittest
from src.agents.Support.battle_plan_formatter import BattlePlanFormatter

class TestBattlePlanFormatterDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Formatador de Missão 🎯"""
    
    def setUp(self):
        self.formatter = BattlePlanFormatter()

    def test_empty_results(self):
        """Garante mensagem de paz quando não há erros."""
        res = self.formatter.format([])
        self.assertIn("Nenhuma intervenção necessária", res)

    def test_grouping_logic(self):
        """Valida se o agrupamento por severidade e arquivo funciona."""
        audit_results = [
            {"file": "src/core.py", "issue": "Critical Bug", "severity": "critical", "line": 10},
            {"file": "src/core.py", "issue": "Minor issue", "severity": "low", "line": 50},
            "Diretriz Estratégica Alpha"
        ]
        res = self.formatter.format(audit_results)
        
        self.assertIn("NÍVEL: CRITICAL", res)
        self.assertIn("NÍVEL: LOW", res)
        self.assertIn("NÍVEL: STRATEGIC", res)
        self.assertIn("Alvo: `src/core.py`", res)
        self.assertIn("Diretriz Estratégica Alpha", res)

    def test_item_formatting(self):
        """Valida a formatação atômica de cada item."""
        item = {"file": "test.py", "issue": "Logic flaw", "severity": "high", "line": 5, "snippet": "eval(x)"}
        res = self.formatter._format_item(item, "HIGH")
        self.assertIn("#### 🔴 Item 5: Logic flaw", res)
        self.assertIn("```kotlin\neval(x)\n```", res)
        self.assertIn("Padrão soberano de high", res)
