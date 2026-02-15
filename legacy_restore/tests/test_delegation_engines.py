import unittest
import ast
import logging
from unittest.mock import MagicMock, patch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDelegationEngines")

# ========== ASTNodeInspector ==========
class TestASTNodeInspector(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.ast_node_inspector import ASTNodeInspector
        self.inspector = ASTNodeInspector()

    def test_is_descendant_true(self):
        logger.info("⚡ Testando is_descendant (positivo)...")
        tree = ast.parse("x = 1 + 2")
        assign = tree.body[0]
        bin_op = assign.value
        self.assertTrue(self.inspector.is_descendant(bin_op, tree))
        logger.info("✅ is_descendant positivo validado.")

    def test_is_descendant_false(self):
        logger.info("⚡ Testando is_descendant (negativo)...")
        tree1 = ast.parse("x = 1")
        tree2 = ast.parse("y = 2")
        self.assertFalse(self.inspector.is_descendant(tree2.body[0], tree1))
        logger.info("✅ is_descendant negativo validado.")

    def test_is_call_to_direct(self):
        logger.info("⚡ Testando is_call_to (chamada direta)...")
        tree = ast.parse("eval('x')")
        call = tree.body[0].value
        self.assertTrue(self.inspector.is_call_to(call, ["eval"]))
        self.assertFalse(self.inspector.is_call_to(call, ["exec"]))
        logger.info("✅ is_call_to direto validado.")

    def test_is_call_to_attribute(self):
        logger.info("⚡ Testando is_call_to (atributo)...")
        tree = ast.parse("logger.info('msg')")
        call = tree.body[0].value
        self.assertTrue(self.inspector.is_call_to(call, ["info"]))
        logger.info("✅ is_call_to atributo validado.")

    def test_is_call_to_non_call(self):
        logger.info("⚡ Testando is_call_to (não-chamada)...")
        tree = ast.parse("x = 1")
        self.assertFalse(self.inspector.is_call_to(tree.body[0], ["eval"]))
        logger.info("✅ is_call_to não-chamada validado.")

# ========== ASTTraversalLogic ==========
class TestASTTraversalLogic(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.ast_traversal_logic import ASTTraversalLogic
        self.logic = ASTTraversalLogic()

    def test_get_parent_chain(self):
        logger.info("⚡ Testando get_parent_chain...")
        tree = ast.parse("x = eval('y')")
        call = tree.body[0].value
        chain = self.logic.get_parent_chain(call, tree)
        self.assertTrue(len(chain) >= 1)
        logger.info("✅ get_parent_chain validado.")

    def test_is_in_dict_value_true(self):
        logger.info("⚡ Testando is_in_dict_value (positivo)...")
        tree = ast.parse("d = {'name': eval('x')}")
        dict_node = tree.body[0].value
        target = dict_node.values[0]
        self.assertTrue(self.logic.is_in_dict_value(dict_node, target, ["name"], self.logic))
        logger.info("✅ is_in_dict_value positivo validado.")

    def test_is_in_dict_value_false(self):
        logger.info("⚡ Testando is_in_dict_value (negativo)...")
        tree = ast.parse("d = {'other': 1}")
        dict_node = tree.body[0].value
        target = dict_node.values[0]
        self.assertFalse(self.logic.is_in_dict_value(dict_node, target, ["name"], self.logic))
        logger.info("✅ is_in_dict_value negativo validado.")

    def test_delegation_to_inspector(self):
        logger.info("⚡ Testando delegação is_descendant para ASTNodeInspector...")
        tree = ast.parse("x = 1")
        self.assertTrue(self.logic.is_descendant(tree.body[0], tree))
        logger.info("✅ Delegação para inspector validada.")

# ========== AuditRiskEngine ==========
class TestAuditRiskEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.audit_risk_engine import AuditRiskEngine
        self.engine = AuditRiskEngine()

    def test_map_risk_type_known(self):
        logger.info("⚡ Testando map_risk_type (padrão conhecido)...")
        result = self.engine.map_risk_type("eval")
        self.assertIsInstance(result, str)
        self.assertTrue(len(result) > 0)
        logger.info("✅ map_risk_type conhecido validado.")

    def test_map_risk_type_unknown(self):
        logger.info("⚡ Testando map_risk_type (padrão desconhecido)...")
        result = self.engine.map_risk_type("xyz_unknown_pattern")
        self.assertIsInstance(result, str)
        logger.info("✅ map_risk_type desconhecido validado.")

    def test_create_entry(self):
        logger.info("⚡ Testando create_entry...")
        ctx = {"lines": ["test_line", "line2", "line3"], "file_path": "test.py", "agent_name": "Auditor"}
        p = {"regex": "eval", "issue": "Insecure eval", "severity": "critical"}
        entry = self.engine.create_entry("test.py", 0, p, ctx, "HIGH")
        self.assertIsInstance(entry, dict)
        self.assertEqual(entry["file"], "test.py")
        self.assertEqual(entry["severity"], "HIGH")
        self.assertEqual(entry["line"], 1)
        self.assertEqual(entry["context"], "Auditor")
        logger.info("✅ create_entry validado.")

# ========== AuditScannerEngine ==========
class TestAuditScannerEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.audit_scanner_engine import AuditScannerEngine
        self.engine = AuditScannerEngine()

    def test_is_error_report_true(self):
        logger.info("⚡ Testando _is_error_report (positivo)...")
        lines = ["logger.error('falha')", "next_line"]
        self.assertTrue(self.engine._is_error_report(lines, 0))
        logger.info("✅ _is_error_report positivo validado.")

    def test_is_error_report_false(self):
        logger.info("⚡ Testando _is_error_report (negativo)...")
        lines = ["x = 1", "y = 2"]
        self.assertFalse(self.engine._is_error_report(lines, 0))
        logger.info("✅ _is_error_report negativo validado.")

    def test_parse_severity(self):
        logger.info("⚡ Testando _parse_severity...")
        self.assertEqual(self.engine._parse_severity("[Severity: HIGH]"), "HIGH")
        self.assertEqual(self.engine._parse_severity("Result STRATEGIC level"), "STRATEGIC")
        self.assertIsNone(self.engine._parse_severity("Normal reason"))
        logger.info("✅ _parse_severity validado.")

# ========== BattlePlanSectionsEngine ==========
class TestBattlePlanSectionsEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.battle_plan_sections_engine import BattlePlanSectionsEngine
        self.engine = BattlePlanSectionsEngine()

    def test_format_severity_group(self):
        logger.info("⚡ Testando format_severity_group...")
        items = ["Alerta sobre silenciamento de erros"]
        result = self.engine.format_severity_group("STRATEGIC", items, self.engine.format_item_entry)
        self.assertIn("STRATEGIC", result)
        self.assertIn("Alerta sobre silenciamento de erros", result)
        logger.info("✅ format_severity_group validado.")

    def test_format_item_entry_dict(self):
        logger.info("⚡ Testando format_item_entry (dict)...")
        item = {"file": "test.py", "issue": "Eval inseguro", "line": 10}
        result = self.engine.format_item_entry(item, "HIGH")
        self.assertIn("Eval inseguro", result)
        self.assertIn("10", result)
        logger.info("✅ format_item_entry dict validado.")

    def test_filter_active_results(self):
        logger.info("⚡ Testando filter_active_results...")
        items = [{"file": "a.py", "line": 1, "severity": "HIGH"}, {"file": "a.py", "line": 1, "severity": "HEALED"}]
        result = self.engine.filter_active_results(items, lambda i: f"{i['file']}:{i['line']}")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["severity"], "HIGH")
        logger.info("✅ filter_active_results validado.")

# ========== IntentHeuristicsEngine ==========
class TestIntentHeuristicsEngine(unittest.TestCase):
    def test_analysis_comparison(self):
        logger.info("⚡ Testando _is_analysis_comparison...")
        from src_local.agents.Support.intent_heuristics_engine import IntentHeuristicsEngine
        engine = IntentHeuristicsEngine()
        tree = ast.parse("'complexity' in data")
        node = tree.body[0].value
        result = engine._is_analysis_comparison(node)
        self.assertIsInstance(result, bool)
        logger.info("✅ _is_analysis_comparison validado.")

    def test_metadata_context_with_mock(self):
        logger.info("⚡ Testando is_metadata_context...")
        from src_local.agents.Support.intent_heuristics_engine import IntentHeuristicsEngine
        engine = IntentHeuristicsEngine()
        heuristics = MagicMock()
        heuristics.is_meta_analysis_node.return_value = True
        tree = ast.parse("x = 1")
        node = tree.body[0]
        result = engine.is_metadata_context(node, tree, heuristics)
        self.assertTrue(result)
        logger.info("✅ is_metadata_context validado.")

# ========== MetricsAssembler ==========
class TestMetricsAssembler(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.metrics_assembler import MetricsAssembler
        self.assembler = MetricsAssembler()

    def test_gather_qa_data_without_testify(self):
        logger.info("⚡ Testando gather_qa_data (sem Testify)...")
        result = self.assembler.gather_qa_data({}, {}, [])
        self.assertEqual(result["pyramid"], {})
        self.assertEqual(result["matrix"], [])
        logger.info("✅ gather_qa_data sem Testify validado.")

    def test_gather_qa_data_with_testify(self):
        logger.info("⚡ Testando gather_qa_data (com Testify)...")
        testify = MagicMock(name="Testify")
        testify.name = "Testify"
        testify.analyze_test_pyramid.return_value = {"unit": 10}
        testify.analyze_test_quality_matrix.return_value = [{"module": "x"}]
        result = self.assembler.gather_qa_data({}, {"status": "ok"}, [testify])
        self.assertEqual(result["pyramid"], {"unit": 10})
        self.assertEqual(result["execution"], {"status": "ok"})
        logger.info("✅ gather_qa_data com Testify validado.")

    def test_get_orchestration_metrics(self):
        logger.info("⚡ Testando get_orchestration_metrics...")
        m = {"complexity": 10}
        result = self.assembler.get_orchestration_metrics(m, [{"issue": "x"}])
        self.assertIn("all_findings", result)
        self.assertEqual(result["complexity"], 10)
        logger.info("✅ get_orchestration_metrics validado.")

# ========== ObfuscationCleanerEngine ==========
class TestObfuscationCleanerEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.obfuscation_cleaner_engine import ObfuscationCleanerEngine
        self.engine = ObfuscationCleanerEngine()

    def test_get_offset(self):
        logger.info("⚡ Testando get_offset...")
        lines = ["line one\n", "line two\n"]
        offset = self.engine.get_offset(lines, 1, 0)
        self.assertEqual(offset, 0)
        offset2 = self.engine.get_offset(lines, 2, 3)
        self.assertEqual(offset2, len(lines[0]) + 3)
        logger.info("✅ get_offset validado.")

    def test_collect_replacements_empty(self):
        logger.info("⚡ Testando collect_replacements (AST vazio)...")
        tree = ast.parse("x = 1")
        hunter = MagicMock()
        hunter.dangerous_keywords = ["eval"]
        result = self.engine.collect_replacements(tree, hunter)
        self.assertIsInstance(result, list)
        logger.info("✅ collect_replacements vazio validado.")

# ========== ObfuscationLogicEngine ==========
class TestObfuscationLogicEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.obfuscation_logic_engine import ObfuscationLogicEngine
        self.engine = ObfuscationLogicEngine()

    def test_resolve_constant_simple(self):
        logger.info("⚡ Testando resolve_constant (simples)...")
        tree = ast.parse("'hello'")
        node = tree.body[0].value
        self.assertEqual(self.engine.resolve_constant(node), "hello")
        logger.info("✅ resolve_constant simples validado.")

    def test_resolve_constant_concat(self):
        logger.info("⚡ Testando resolve_constant (concatenação)...")
        tree = ast.parse("'ev' + 'al'")
        node = tree.body[0].value
        self.assertEqual(self.engine.resolve_constant(node), "eval")
        logger.info("✅ resolve_constant concatenação validado.")

    def test_check_dangerous_keywords(self):
        logger.info("⚡ Testando check_dangerous_keywords...")
        tree = ast.parse("'ev' + 'al'")
        node = tree.body[0].value
        result = self.engine.check_dangerous_keywords(node, "eval", ["eval"])
        self.assertIsNotNone(result)
        self.assertEqual(result["keyword"], "eval")
        logger.info("✅ check_dangerous_keywords validado.")

    def test_check_dangerous_keywords_safe(self):
        logger.info("⚡ Testando check_dangerous_keywords (seguro)...")
        tree = ast.parse("'hello'")
        node = tree.body[0].value
        result = self.engine.check_dangerous_keywords(node, "hello", ["eval"])
        self.assertIsNone(result)
        logger.info("✅ check_dangerous_keywords seguro validado.")

# ========== ReportSectionsEngine ==========
class TestReportSectionsEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.report_sections_engine import ReportSectionsEngine
        self.engine = ReportSectionsEngine()

    def test_format_vitals_table(self):
        logger.info("⚡ Testando format_vitals_table...")
        data = {"dark_matter": [], "brittle_points": []}
        result = self.engine.format_vitals_table(data, "Paridade", "Sincronizada")
        self.assertIn("Pontos Cegos", result)
        self.assertIn("Seguro", result)
        self.assertIn("Paridade", result)
        logger.info("✅ format_vitals_table validado.")

    def test_format_vitals_table_critical(self):
        logger.info("⚡ Testando format_vitals_table (crítico)...")
        data = {"dark_matter": list(range(15)), "brittle_points": [1]}
        result = self.engine.format_vitals_table(data, "Infra", "OK")
        self.assertIn("15 Arquivos", result)
        logger.info("✅ format_vitals_table crítico validado.")

    def test_format_roadmap_sovereign(self):
        logger.info("⚡ Testando format_roadmap (soberano)...")
        data = {"health_breakdown": {
            "Purity (Complexity)": 20,
            "Stability (Coverage)": 40,
            "Observability (Telemetry)": 15,
            "Excellence (Documentation)": 10
        }}
        result = self.engine.format_roadmap(data)
        self.assertIn("soberania", result)
        logger.info("✅ format_roadmap soberano validado.")

    def test_format_roadmap_with_gaps(self):
        logger.info("⚡ Testando format_roadmap (com gaps)...")
        data = {"health_breakdown": {
            "Purity (Complexity)": 15,
            "Stability (Coverage)": 30,
        }, "dark_matter": list(range(5))}
        result = self.engine.format_roadmap(data)
        self.assertIn("ROADMAP", result)
        self.assertIn("Reduzir Complexidade", result)
        logger.info("✅ format_roadmap com gaps validado.")

# ========== SafetyAssignmentEngine ==========
class TestSafetyAssignmentEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.safety_assignment_engine import SafetyAssignmentEngine
        self.engine = SafetyAssignmentEngine()

    def test_is_in_metadata_assignment_true(self):
        logger.info("⚡ Testando is_in_metadata_assignment (positivo)...")
        tree = ast.parse("config = 'eval'")
        assign = tree.body[0]
        target = assign.value
        utils = MagicMock()
        utils.is_in_dict_value.return_value = False
        result = self.engine.is_in_metadata_assignment([assign], target, utils, {"config"})
        self.assertTrue(result)
        logger.info("✅ is_in_metadata_assignment positivo validado.")

    def test_is_in_metadata_assignment_false(self):
        logger.info("⚡ Testando is_in_metadata_assignment (negativo)...")
        tree = ast.parse("danger = eval('x')")
        assign = tree.body[0]
        target = assign.value
        utils = MagicMock()
        utils.is_in_dict_value.return_value = False
        result = self.engine.is_in_metadata_assignment([assign], target, utils, {"config"})
        self.assertFalse(result)
        logger.info("✅ is_in_metadata_assignment negativo validado.")

# ========== TelemetryMaturityLogic ==========
class TestTelemetryMaturityLogic(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.telemetry_maturity_logic import TelemetryMaturityLogic
        self.logic = TelemetryMaturityLogic()

    def test_is_simple_time_subtraction_true(self):
        logger.info("⚡ Testando is_simple_time_subtraction (positivo)...")
        tree = ast.parse("x = time.time() - start")
        node = tree.body[0]
        self.assertTrue(self.logic.is_simple_time_subtraction(node))
        logger.info("✅ is_simple_time_subtraction positivo validado.")

    def test_is_simple_time_subtraction_false(self):
        logger.info("⚡ Testando is_simple_time_subtraction (negativo)...")
        tree = ast.parse("x = 1 + 2")
        node = tree.body[0]
        self.assertFalse(self.logic.is_simple_time_subtraction(node))
        logger.info("✅ is_simple_time_subtraction negativo validado.")

    def test_is_tele_name_true(self):
        logger.info("⚡ Testando is_tele_name (positivo)...")
        tree = ast.parse("elapsed_duration = 1.0")
        target = tree.body[0].targets[0]
        result = self.logic.is_tele_name(target)
        self.assertIsInstance(result, bool)
        logger.info("✅ is_tele_name validado.")

    def test_is_tele_name_false_simple(self):
        logger.info("⚡ Testando is_tele_name (negativo)...")
        tree = ast.parse("x = 1")
        target = tree.body[0].targets[0]
        self.assertFalse(self.logic.is_tele_name(target))
        logger.info("✅ is_tele_name negativo validado.")

if __name__ == '__main__':
    unittest.main()
