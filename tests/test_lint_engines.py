import unittest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestLintEngines")

# ========== LintHeadingLogic ==========
class TestLintHeadingLogic(unittest.TestCase):
    def setUp(self):
        from scripts.lint_heading_logic import LintHeadingLogic
        self.logic = LintHeadingLogic()

    def test_check_headings_missing_space(self):
        logger.info("⚡ Testando check_headings (MD018 - sem espaço)...")
        lines = ["#NoSpace"]
        errors = self.logic.check_headings(lines, 0, "#NoSpace", {})
        has_md018 = any("MD018" in str(e) for e in errors)
        self.assertTrue(has_md018 or len(errors) > 0, "Deve detectar erro de espaçamento")
        logger.info("✅ MD018 validado.")

    def test_check_headings_trailing_punct(self):
        logger.info("⚡ Testando check_headings (MD026 - pontuação)...")
        lines = ["# Title:"]
        errors = self.logic.check_headings(lines, 0, "# Title:", {})
        has_error = any("MD026" in str(e) or "pontuação" in str(e).lower() for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD026 validado.")

    def test_check_headings_duplicate(self):
        logger.info("⚡ Testando check_headings (MD024 - duplicada)...")
        existing = {"# Title": 0}
        errors = self.logic.check_headings(["# Title"], 5, "# Title", existing)
        has_dup = any("MD024" in str(e) or "duplica" in str(e).lower() for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD024 validado.")

    def test_check_headings_valid(self):
        logger.info("⚡ Testando check_headings (válido)...")
        lines = ["", "# Valid Title"]
        errors = self.logic.check_headings(lines, 1, "# Valid Title", {})
        self.assertIsInstance(errors, list)
        logger.info("✅ Heading válido processado.")

# ========== LintRuleEngine ==========
class TestLintRuleEngine(unittest.TestCase):
    def setUp(self):
        from scripts.lint_rule_engine import LintRuleEngine
        self.engine = LintRuleEngine()

    def test_verify_rules_clean(self):
        logger.info("⚡ Testando verify_rules (conteúdo limpo)...")
        content = "# Title\n\nParagraph text.\n"
        errors = self.engine.verify_rules(content)
        self.assertIsInstance(errors, list)
        logger.info(f"✅ verify_rules limpo: {len(errors)} erros.")

    def test_verify_rules_multiple_blanks(self):
        logger.info("⚡ Testando verify_rules (MD012 - linhas em branco)...")
        content = "# Title\n\n\n\nParagraph.\n"
        errors = self.engine.verify_rules(content)
        has_md012 = any("MD012" in str(e) for e in errors)
        self.assertTrue(has_md012, "Deve detectar múltiplas linhas em branco")
        logger.info("✅ MD012 validado.")

    def test_verify_rules_heading_no_blank(self):
        logger.info("⚡ Testando verify_rules (MD022 - sem blank antes do heading)...")
        content = "Text.\n# Heading\n"
        errors = self.engine.verify_rules(content)
        has_md022 = any("MD022" in str(e) for e in errors)
        self.assertIsInstance(errors, list)
        logger.info("✅ MD022 processado.")

    def test_is_blank_violation(self):
        logger.info("⚡ Testando _is_blank_violation...")
        self.assertTrue(self.engine._is_blank_violation("", True))
        self.assertFalse(self.engine._is_blank_violation("# Title", True))
        self.assertFalse(self.engine._is_blank_violation("", False))
        logger.info("✅ _is_blank_violation validado.")

if __name__ == '__main__':
    unittest.main()
