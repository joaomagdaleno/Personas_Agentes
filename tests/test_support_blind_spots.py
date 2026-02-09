"""
Testes para os módulos de suporte criados durante o refactoring.
Cobre: LogicNodeAuditor, MetaAnalysisDetector, SafetyDefinitions
"""
import unittest


class TestLogicNodeAuditor(unittest.TestCase):
    """Testes para o LogicNodeAuditor."""
    
    def test_instantiation(self):
        """Verifica que o auditor pode ser instanciado."""
        from src_local.agents.Support.logic_node_auditor import LogicNodeAuditor
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        from src_local.agents.Support.safe_context_judge import SafeContextJudge
        from src_local.agents.Support.call_safety_judge import CallSafetyJudge
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        nav = ASTNavigator()
        heuristics = nav.safety_nav.heuristics
        judge = SafeContextJudge()
        call_judge = CallSafetyJudge(judge)
        auditor = LogicNodeAuditor(heuristics, judge, call_judge)
        self.assertIsNotNone(auditor)

    def test_audit_safe_node(self):
        """Verifica que nós seguros são aprovados."""
        import ast
        from src_local.agents.Support.logic_node_auditor import LogicNodeAuditor
        from src_local.agents.Support.safe_context_judge import SafeContextJudge
        from src_local.agents.Support.call_safety_judge import CallSafetyJudge
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        code = "x = 1 + 2"
        tree = ast.parse(code)
        nav = ASTNavigator()
        heuristics = nav.safety_nav.heuristics
        judge = SafeContextJudge()
        call_judge = CallSafetyJudge(judge)
        auditor = LogicNodeAuditor(heuristics, judge, call_judge)
        
        node = list(ast.walk(tree))[1]  # Assign node
        result, reason = auditor.audit(node, tree, code, 1, "test", False)
        # Should not be flagged as dangerous
        self.assertIsNone(result)


class TestMetaAnalysisDetector(unittest.TestCase):
    """Testes para o MetaAnalysisDetector."""
    
    def test_isinstance_ast_check(self):
        """Verifica detecção de isinstance(node, ast.XYZ)."""
        import ast
        from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector
        
        code = "isinstance(node, ast.Global)"
        tree = ast.parse(code)
        call_node = tree.body[0].value
        
        detector = MetaAnalysisDetector()
        self.assertTrue(detector.is_meta_analysis_node(call_node))
    
    def test_regex_call_detected(self):
        """Verifica detecção de re.search/match."""
        import ast
        from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector
        
        code = "re.search(pattern, text)"
        tree = ast.parse(code)
        call_node = tree.body[0].value
        
        detector = MetaAnalysisDetector()
        self.assertTrue(detector.is_meta_analysis_node(call_node))
    
    def test_normal_call_not_detected(self):
        """Verifica que chamadas normais não são meta-análise."""
        import ast
        from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector
        
        code = "print('hello')"
        tree = ast.parse(code)
        call_node = tree.body[0].value
        
        detector = MetaAnalysisDetector()
        self.assertFalse(detector.is_meta_analysis_node(call_node))


class TestSafetyDefinitions(unittest.TestCase):
    """Testes para as definições de segurança."""
    
    def test_safe_metadata_vars_not_empty(self):
        """Verifica que SAFE_METADATA_VARS está populado."""
        from src_local.agents.Support.safety_definitions import SAFE_METADATA_VARS
        self.assertGreater(len(SAFE_METADATA_VARS), 0)
    
    def test_analyzer_classes_defined(self):
        """Verifica que ANALYZER_CLASSES está definido."""
        from src_local.agents.Support.safety_definitions import ANALYZER_CLASSES
        self.assertIn('LogicAuditor', ANALYZER_CLASSES)
        self.assertIn('SafetyHeuristics', ANALYZER_CLASSES)
    
    def test_meta_analysis_libs_defined(self):
        """Verifica que META_ANALYSIS_LIBS está definido."""
        from src_local.agents.Support.safety_definitions import META_ANALYSIS_LIBS
        self.assertIn('ast', META_ANALYSIS_LIBS)
        self.assertIn('re', META_ANALYSIS_LIBS)


if __name__ == "__main__":
    unittest.main()
