import unittest
import logging
from pathlib import Path
from unittest.mock import MagicMock
from src_local.agents.Python.Strategic.director import DirectorPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestDirectorPersona(unittest.TestCase):
    """
    Testes para o Diretor Estratégico.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização do diretor."""
        logger.info("Auditando inicialização do Diretor...")
        director = DirectorPersona(Path("."))
        self.assertEqual(director.name, "Director")
        logger.info("✅ Diretor operacional.")

    def test_deduplicate_results(self):
        """Valida a deduplicação de resultados com normalização."""
        logger.info("⚡ Testando deduplicação do Diretor...")
        director = DirectorPersona()
        results = [
            {'file': 'a.py', 'line': 1, 'issue': 'Bug.'},
            {'file': 'a.py', 'line': 1, 'issue': 'Bug'}, # Duplicado por normalização (ponto final)
            "Texto Puro",
            "Texto Puro." # Duplicado por normalização
        ]
        unique = director._deduplicate_results(results)
        self.assertEqual(len(unique), 2)
        logger.info("✅ Deduplicação do Diretor validada.")

    def test_format_360_report_sections(self):
        """Valida a síntese das seções do relatório 360."""
        logger.info("⚡ Testando síntese de relatório 360...")
        director = DirectorPersona()
        health = {
            'map': {}, 'blind_spots': [], 'brittle_points': [], 
            'score': 10, 'alerts': [], 'sync_time': '12:00:00'
        }
        # Mock do formatter para evitar dependências pesadas
        director.formatter = MagicMock()
        director.formatter.format_header.return_value = "# Header"
        director.formatter.format_vitals.return_value = "## Vitals"
        director.formatter.format_efficiency.return_value = ""
        director.formatter.format_entropy.return_value = ""
        director.formatter.format_quality_matrix.return_value = ""
        director.formatter.format_battle_plan.return_value = "## Plan"
        
        report = director.format_360_report(health, [])
        self.assertIn("# Header", report)
        self.assertIn("## Vitals", report)
        self.assertIn("## Plan", report)
        self.assertIn("💀 Risco Existencial", report)
        logger.info("✅ Síntese de relatório validada.")

if __name__ == "__main__":
    unittest.main()
