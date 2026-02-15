import unittest
import logging
from pathlib import Path
from src_local.utils.scoring_engine_phd import ScoringEnginePhd
from src_local.utils.veto_rules_phd import VetoRulesPhd
from src_local.utils.topology_engine_phd import TopologyEnginePhd
from src_local.utils.maintenance_engine_phd import MaintenanceEnginePhd
from src_local.utils.reflex_engine_phd import ReflexEnginePhd

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPhdHelpers")

class TestPhdHelpers(unittest.TestCase):
    def test_scoring_engine_basic(self):
        logger.info("⚡ Testando ScoringEnginePhD...")
        score = ScoringEnginePhd.calculate({}, [], 0)
        self.assertEqual(score, 0)
        logger.info("✅ ScoringEngine validado.")
        
    def test_veto_rules(self):
        logger.info("⚡ Testando VetoRulesPhD...")
        self.assertTrue(VetoRulesPhd.should_veto("node_modules/foo.js"))
        self.assertFalse(VetoRulesPhd.should_veto("src/main.py"))
        logger.info("✅ VetoRules validado.")

    def test_topology_engine(self):
        logger.info("⚡ Testando TopologyEnginePhD...")
        # Smoke test since it depends on filesystem
        dirs = TopologyEnginePhd.get_search_dirs(Path("."))
        self.assertIsInstance(dirs, list)
        logger.info("✅ TopologyEngine validado.")

    def test_maintenance_engine_no_submodules(self):
        logger.info("⚡ Testando MaintenanceEnginePhD (sem submódulos)...")
        # Verifies it doesn't crash if no .gitmodules
        MaintenanceEnginePhd.clean_submodules(Path("."), lambda x: None)
        logger.info("✅ MaintenanceEngine validado.")

    def test_reflex_engine_trigger_none(self):
        logger.info("⚡ Testando ReflexEnginePhD (trigger none)...")
        # Verifies it handles empty inputs
        ReflexEnginePhd.trigger({}, [], None, None)
        logger.info("✅ ReflexEngine validado.")

if __name__ == "__main__":
    unittest.main()
