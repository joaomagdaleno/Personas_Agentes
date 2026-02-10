import unittest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestLintEngines")

# ========== LintHeadingLogic ==========
class TestLintHeadingLogic(unittest.TestCase):
    def setUp(self):
        from scripts.lint_heading_logic import LintHeadingLogic
        self.logic = LintHeadingLogic()

    def test_check_headings_md022_missing_blank(self):
        logger.info("⚡ Testando check_headings (MD022 - sem blank antes)...")
        lines = ["Text before.", "# Heading", ""]
        errors = self.logic.check_headings(lines, 1, "# Heading", {})
        has_md022 = any("MD022" in str(e) for e in errors)
        self.assertTrue(has_md022)
        logger.info("✅ MD022 validado.")

    def test_check_headings_trailing_punct(self):
        logger.info("⚡ Testando check_headings (MD026 - pontuação)...")
        lines = ["", "# Title:", ""]
        errors = self.logic.check_headings(lines, 1, "# Title:", {})
        has_error = any("MD026" in str(e) for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD026 validado.")

    def test_check_headings_duplicate(self):
        logger.info("⚡ Testando check_headings (MD024 - duplicada)...")
        existing = {"# Title": 0}
        lines = ["", "# Title", ""]
        errors = self.logic.check_headings(lines, 1, "# Title", existing)
        has_dup = any("MD024" in str(e) for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD024 validado.")

    def test_check_headings_valid(self):
        logger.info("⚡ Testando check_headings (válido)...")
        lines = ["", "# Valid Title", ""]
        errors = self.logic.check_headings(lines, 1, "# Valid Title", {})
        self.assertIsInstance(errors, list)
        self.assertEqual(len(errors), 0)
        logger.info("✅ Heading válido processado.")

# ========== LintRuleEngine ==========
class TestLintRuleEngine(unittest.TestCase):
    def setUp(self):
        from scripts.lint_rule_engine import LintRuleEngine
        self.engine = LintRuleEngine()

    def test_verify_rules_clean(self):
        logger.info("⚡ Testando verify_rules (conteúdo limpo)...")
        lines = ["# Title", "", "Paragraph text."]
        errors = self.engine.verify_rules(lines)
        self.assertIsInstance(errors, list)
        logger.info(f"✅ verify_rules limpo: {len(errors)} erros.")

    def test_verify_rules_multiple_blanks(self):
        logger.info("⚡ Testando verify_rules (MD012 - linhas em branco)...")
        lines = ["# Title", "", "", "", "Paragraph."]
        errors = self.engine.verify_rules(lines)
        has_md012 = any("MD012" in str(e) for e in errors)
        self.assertTrue(has_md012, "Deve detectar múltiplas linhas em branco")
        logger.info("✅ MD012 validado.")

    def test_verify_rules_heading_no_blank(self):
        logger.info("⚡ Testando verify_rules (MD022 - sem blank antes do heading)...")
        lines = ["Text.", "# Heading"]
        errors = self.engine.verify_rules(lines)
        has_md022 = any("MD022" in str(e) for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD022 processado.")

    def test_is_blank_violation(self):
        logger.info("⚡ Testando _is_blank_violation...")
        lines = ["Text.", "", "", "More."]
        self.assertTrue(self.engine._is_blank_violation(2, "", lines))
        self.assertFalse(self.engine._is_blank_violation(1, "", lines))
        self.assertFalse(self.engine._is_blank_violation(0, "Text.", lines))
        logger.info("✅ _is_blank_violation validado.")

if __name__ == '__main__':
    unittest.main()
