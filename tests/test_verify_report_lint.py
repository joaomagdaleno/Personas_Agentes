import unittest
import logging
from scripts.verify_report_lint import main

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestVerifyReportLint")

class TestVerifyReportLint(unittest.TestCase):
    def test_main_exists(self):
        logger.info("⚡ Verificando existência de main em verify_report_lint...")
        self.assertTrue(callable(main))
        logger.info("✅ Main validada.")

    def test_lint_rules(self):
        """Valida as regras de lint MD012, MD022, MD024 e MD026."""
        logger.info("⚡ Testando regras de lint MD...")
        from scripts.verify_report_lint import verify_markdown_compliance
        import tempfile
        import os

        # Teste MD012: Linhas em branco consecutivas
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as tmp:
            tmp.write("# Title\n\n\nContent")
            tmp_path = tmp.name
        
        try:
            errors = verify_markdown_compliance(tmp_path)
            self.assertTrue(any("MD012" in e for e in errors), "Falha ao detectar MD012")
            
            # Teste MD026: Pontuação no final do header
            with open(tmp_path, 'w', encoding='utf-8') as f:
                f.write("# Error!\n\nContent")
            errors = verify_markdown_compliance(tmp_path)
            self.assertTrue(any("MD026" in e for e in errors), "Falha ao detectar MD026")

            # Teste MD022: Falta de espaço no header
            with open(tmp_path, 'w', encoding='utf-8') as f:
                f.write("# Title\nContent") # Erro MD022 abaixo
            errors = verify_markdown_compliance(tmp_path)
            self.assertTrue(any("MD022" in e for e in errors), "Falha ao detectar MD022")

            # Teste MD024: Heading duplicado
            with open(tmp_path, 'w', encoding='utf-8') as f:
                f.write("# Title\n\nContent\n\n# Title")
            errors = verify_markdown_compliance(tmp_path)
            self.assertTrue(any("MD024" in e for e in errors), "Falha ao detectar MD024")

            logger.info(f"✅ Regras de lint validadas: {len(errors)} erros encontrados no teste de duplicados.")
        finally:
            if os.path.exists(tmp_path): os.remove(tmp_path)

if __name__ == '__main__':
    unittest.main()
