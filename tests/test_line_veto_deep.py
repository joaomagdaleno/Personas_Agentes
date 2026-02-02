
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
        # Novo Regex busca palavras perigosas + sinais de manipulação
        line_string = "rules = [{'regex': r'eval\('}]"
        pattern = {'regex': r'eval\(', 'severity': 'critical'}
        ctx = {"file_path": "src/agents/base.py", "is_technical": True}
        
        # Deve retornar True (VETO), pois detecta 'eval' + 'regex ='
        self.assertTrue(self.veto._is_rule_definition(line_string, pattern, ctx))

    def test_structural_obfuscation_veto(self):
        """Valida proteção contra detecção circular via ofuscação técnica."""
        line_ofusc = '"ev" + "al("'
        pattern = {'regex': r'eval\(', 'severity': 'critical'}
        ctx = {"file_path": "src/agents/base.py", "is_technical": True}
        
        # O veto deve identificar que é uma técnica de ofuscação de regra e pular
        self.assertTrue(self.veto.should_skip(line_ofusc, pattern, ctx))

if __name__ == "__main__":
    unittest.main()
