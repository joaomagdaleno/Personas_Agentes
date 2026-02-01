import unittest
import json
import shutil
from pathlib import Path
from src.utils.stability_ledger import StabilityLedger
from src.utils.context_engine import ContextEngine

class TestSystemIntelligence(unittest.TestCase):
    """
    Testa a capacidade do sistema de mapear riscos e lembrar de cicatrizes.
    """

    def setUp(self):
        self.test_root = Path("intelligence_test_env")
        self.test_root.mkdir(exist_ok=True)
        self.ledger = StabilityLedger(self.test_root)
        self.engine = ContextEngine(self.test_root)

    def test_stability_ledger_memory(self):
        """Garante que o sistema lembra de curas e recorrências."""
        results = [{"file": "core.py", "issue": "Bug", "severity": "HIGH"}]
        
        # Primeira vez: Marcar como UNSTABLE
        self.ledger.update(results)
        data = self.ledger.get_file_data("core.py")
        self.assertEqual(data["status"], "UNSTABLE")
        self.assertEqual(data["occurrences"], 1)

        # Segunda vez: Curado (não aparece nos resultados)
        self.ledger.update([])
        data = self.ledger.get_file_data("core.py")
        self.assertEqual(data["status"], "HEALED")
        self.assertEqual(data["occurrences"], 0)

    def test_gold_standard_veto(self):
        """Garante que arquivos Gold Standard não são marcados como instáveis."""
        results = [{"file": "src/utils/compliance_standard.py", "issue": "Pattern match", "severity": "MEDIUM"}]
        context_map = {
            "src/utils/compliance_standard.py": {"is_gold_standard": True, "component_type": "UTIL"}
        }
        
        self.ledger.update(results, context_map)
        data = self.ledger.get_file_data("src/utils/compliance_standard.py")
        self.assertEqual(data["status"], "REFERENCE")
        self.assertNotIn("occurrences", data)

    def test_criticality_mapping(self):
        """Valida se arquivos do 'core' recebem score de impacto maior."""
        core_file = self.test_root / "src" / "core" / "maestro.py"
        core_file.parent.mkdir(parents=True, exist_ok=True)
        core_file.write_text("class Maestro: pass")
        
        # Analisa projeto
        self.engine.analyze_project()
        score = self.engine.get_criticality_score("src/core/maestro.py")
        
        self.assertTrue(score >= 10, f"Score de criticidade para arquivos core deveria ser alto, recebido: {score}")

    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
