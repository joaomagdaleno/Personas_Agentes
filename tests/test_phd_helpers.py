import unittest
from pathlib import Path
from src_local.utils.scoring_engine_phd import ScoringEnginePhd
from src_local.utils.veto_rules_phd import VetoRulesPhd
from src_local.utils.topology_engine_phd import TopologyEnginePhd
from src_local.utils.maintenance_engine_phd import MaintenanceEnginePhd
from src_local.utils.reflex_engine_phd import ReflexEnginePhd

class TestPhdHelpers(unittest.TestCase):
    def test_scoring_engine_basic(self):
        score = ScoringEnginePhd.calculate({}, [], 0)
        self.assertEqual(score, 0)
        
    def test_veto_rules(self):
        self.assertTrue(VetoRulesPhd.should_veto("node_modules/foo.js"))
        self.assertFalse(VetoRulesPhd.should_veto("src/main.py"))

    def test_topology_engine(self):
        # Smoke test since it depends on filesystem
        dirs = TopologyEnginePhd.get_search_dirs(Path("."))
        self.assertIsInstance(dirs, list)

    def test_maintenance_engine_no_submodules(self):
        # Verifies it doesn't crash if no .gitmodules
        MaintenanceEnginePhd.clean_submodules(Path("."), lambda x: None)

    def test_reflex_engine_trigger_none(self):
        # Verifies it handles empty inputs
        ReflexEnginePhd.trigger({}, [], None, None)

if __name__ == "__main__":
    unittest.main()
