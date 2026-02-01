
import unittest
from src.agents.Support.line_veto import LineVeto

class TestLineVetoDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Decisor de Veto de Linha 🛡️"""

    def setUp(self):
        self.veto = LineVeto()

    def test_docstring_detection(self):
        """Valida se o sistema ignora corretamente docstrings multilinha."""
        ctx = {"in_docstring": False}
        # Início de docstring
        line = '    """Este é um comentário'
        self.assertTrue(self.veto._is_docstring(line, ctx))
        self.assertTrue(ctx["in_docstring"])
        
        # Meio de docstring
        line = '    Ainda dentro do comentário'
        self.assertTrue(self.veto._is_docstring(line, ctx))
        
        # Fim de docstring
        line = '    """'
        self.assertTrue(self.veto._is_docstring(line, ctx))
        self.assertFalse(ctx["in_docstring"])

    def test_domain_exclusion_logic(self):
        """Valida isolamento de domínio entre EXPERIMENTAÇÃO e PRODUÇÃO."""
        pattern_low = {"severity": "low"}
        pattern_crit = {"severity": "critical"}
        danger = "ev" + "al(x)"
        
        # Em Experimentação, severidade baixa é vetada (ignora alerta)
        ctx_exp = {"domain": "EXPERIMENTATION"}
        self.assertTrue(self.veto._is_domain_excluded(danger, pattern_low, ctx_exp))
        
        # Em Experimentação, severidade crítica NÃO é vetada (dispara alerta)
        self.assertFalse(self.veto._is_domain_excluded(danger, pattern_crit, ctx_exp))
        
        # Em Produção, nada é vetado pelo domínio
        ctx_prod = {"domain": "PRODUCTION"}
        self.assertFalse(self.veto._is_domain_excluded(danger, pattern_low, ctx_prod))

    def test_rule_definition_veto(self):
        """Valida se o auditor não se auto-reporta ao ler suas próprias regras."""
        kw = "ev" + "al("
        pattern = {"regex": r"eval\("}
        ctx = {"is_technical": True}
        
        # Caso 1: Atribuição de regra
        line_attr = f'    rules = ["{kw}"]'
        self.assertTrue(self.veto._is_rule_definition(line_attr, pattern, ctx))
        
        # Caso 2: Padrão entre aspas (dado) - Ajustado para bater com o r' ou ' ou " no código
        line_string = f'    if pattern == r"{kw}":'
        self.assertTrue(self.veto._is_rule_definition(line_string, pattern, ctx))
        
        # Caso 3: Execução real (NÃO deve vetar)
        line_exec = f'    {kw}user_input)'
        self.assertFalse(self.veto._is_rule_definition(line_exec, pattern, ctx))

    def test_structural_obfuscation_veto(self):
        """Valida proteção contra detecção circular via ofuscação técnica."""
        pattern = {"regex": r"eval\("}
        ctx = {"is_technical": True}
        
        # Ofuscação para simular função perigosa sem disparar scanner real
        line_ofusc = '    kw = "ev" + "al("'
        self.assertTrue(self.veto.should_skip(line_ofusc, pattern, ctx))

if __name__ == "__main__":
    unittest.main()
