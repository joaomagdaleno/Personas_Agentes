import unittest
import logging
from unittest.mock import MagicMock

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestUtilsEngines")

# ========== ContextMappingLogic ==========
class TestContextMappingLogic(unittest.TestCase):
    def setUp(self):
        from src_local.utils.context_mapping_logic import ContextMappingLogic
        self.logic = ContextMappingLogic()

    def test_get_initial_info(self):
        logger.info("⚡ Testando get_initial_info...")
        analyst = MagicMock()
        analyst.map_component_type.return_value = "MODULE"
        result = self.logic.get_initial_info("test.py", "test.py", analyst)
        self.assertIsInstance(result, dict)
        self.assertIn("path", result)
        self.assertIn("rel_path", result)
        self.assertEqual(result["path"], "test.py")
        self.assertEqual(result["component_type"], "MODULE")
        logger.info("✅ get_initial_info validado.")

    def test_get_initial_info_test_domain(self):
        logger.info("⚡ Testando get_initial_info (domínio TEST)...")
        analyst = MagicMock()
        analyst.map_component_type.return_value = "TEST"
        result = self.logic.get_initial_info("tests/test_x.py", "tests/test_x.py", analyst)
        self.assertEqual(result["domain"], "EXPERIMENTATION")
        logger.info("✅ get_initial_info domínio TEST validado.")

# ========== SubmoduleSyncLogic ==========
class TestSubmoduleSyncLogic(unittest.TestCase):
    def setUp(self):
        from src_local.utils.submodule_sync_logic import SubmoduleSyncLogic
        self.logic = SubmoduleSyncLogic()

    def test_is_locked_no_file(self):
        logger.info("⚡ Testando is_locked (sem arquivo)...")
        mock_path = MagicMock()
        mock_path.exists.return_value = False
        self.assertFalse(self.logic.is_locked(mock_path))
        logger.info("✅ is_locked sem arquivo validado.")

    def test_get_submodule_delta_no_remote(self):
        logger.info("⚡ Testando get_submodule_delta (sem remote)...")
        git = MagicMock()
        result = self.logic.get_submodule_delta(git, None)
        self.assertEqual(result, [])
        logger.info("✅ get_submodule_delta sem remote validado.")

    def test_get_submodule_delta_with_delta(self):
        logger.info("⚡ Testando get_submodule_delta (com delta)...")
        git = MagicMock()
        git.get_current_branch.return_value = "main"
        git.get_tracking_branch.return_value = "main"
        git.get_commit_count.return_value = 3
        result = self.logic.get_submodule_delta(git, "origin")
        self.assertEqual(len(result), 1)
        self.assertIn("Delta: 3", result[0]["issue"])
        logger.info("✅ get_submodule_delta com delta validado.")

# ========== VetoCriteriaEngine ==========
class TestVetoCriteriaEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.veto_criteria_engine import VetoCriteriaEngine
        self.engine = VetoCriteriaEngine()

    def test_check_permissions_test_file(self):
        logger.info("⚡ Testando check_permissions (arquivo test)...")
        p = {"regex": "eval", "severity": "high"}
        result = self.engine.check_permissions("'eval'", p, "/tests/test_eval.py")
        self.assertTrue(result)
        logger.info("✅ check_permissions test file validado.")

    def test_check_permissions_production(self):
        logger.info("⚡ Testando check_permissions (produção)...")
        p = {"regex": "eval", "severity": "high"}
        result = self.engine.check_permissions("eval(data)", p, "src/main.py")
        self.assertFalse(result)
        logger.info("✅ check_permissions produção validado.")

    def test_is_math_context_true(self):
        logger.info("⚡ Testando is_math_context (positivo)...")
        p = {"issue": "Imprecisão Monetária", "regex": "float"}
        result = self.engine.is_math_context("alpha = sin(x) + radius", p)
        self.assertTrue(result)
        logger.info("✅ is_math_context positivo validado.")

    def test_is_math_context_false_money(self):
        logger.info("⚡ Testando is_math_context (monetário)...")
        p = {"issue": "Imprecisão Monetária", "regex": "float"}
        result = self.engine.is_math_context("price = 10.5 + tax", p)
        self.assertFalse(result)
        logger.info("✅ is_math_context monetário validado.")

    def test_is_rule_def(self):
        logger.info("⚡ Testando is_rule_def...")
        ctx = {"is_technical": True}
        heuristic = MagicMock()
        heuristic.is_strategic_phrase.return_value = False
        heuristic.is_obfuscated_vulnerability.return_value = False
        p = {"regex": "eval"}
        result = self.engine.is_rule_def("rules = ['eval']", p, ctx, heuristic)
        self.assertTrue(result)
        logger.info("✅ is_rule_def validado.")

# ========== VetoStructuralEngine ==========
class TestVetoStructuralEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.veto_structural_engine import VetoStructuralEngine
        self.engine = VetoStructuralEngine()

    def test_is_comment(self):
        logger.info("⚡ Testando is_comment...")
        self.assertTrue(self.engine.is_comment("# This is a comment"))
        self.assertFalse(self.engine.is_comment("x = 1  # inline"))
        logger.info("✅ is_comment validado.")

    def test_is_docstring(self):
        logger.info("⚡ Testando is_docstring...")
        ctx_in = {"in_docstring": False}
        result = self.engine.is_docstring('    \"\"\"Docstring start.\"\"\"', ctx_in)
        self.assertIsInstance(result, bool)
        logger.info("✅ is_docstring validado.")

    def test_is_docstring_multiline(self):
        logger.info("⚡ Testando is_docstring (multi-linha)...")
        ctx = {"in_docstring": True}
        result = self.engine.is_docstring("    continuing docstring", ctx)
        self.assertTrue(result)
        logger.info("✅ is_docstring multi-linha validado.")

if __name__ == '__main__':
    unittest.main()
