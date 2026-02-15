import unittest
import logging
from unittest.mock import MagicMock, patch
from src_local.utils.reflex_engine_phd import ReflexEnginePhd

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestReflexEnginePhd")

class TestReflexEnginePhd(unittest.TestCase):
    def test_trigger_voyager_healing(self):
        """Valida o gatilho de cura ativa do Voyager para blind spots."""
        logger.info("⚡ Testando gatilho de cura do Voyager...")
        health = {
            'blind_spots': ['src_local/core.py'],
            'map': {'src_local/core.py': {'domain': 'PRODUCTION'}}
        }
        mock_voyager = MagicMock()
        mock_voyager.name = "Voyager"
        
        personas = [mock_voyager]
        ReflexEnginePhd.trigger(health, personas, None, None)
        
        self.assertTrue(mock_voyager.perform_active_healing.called)
        mock_voyager.perform_active_healing.assert_called_with(['src_local/core.py'])
        logger.info("✅ Gatilho do Voyager validado.")

    def test_trigger_auditor_sync(self):
        """Valida a sincronia do DependencyAuditor via reflexo."""
        logger.info("⚡ Testando sincronia do DependencyAuditor...")
        health = {}
        mock_auditor = MagicMock()
        job_queue = [{'context': 'DependencyAuditor'}]
        
        ReflexEnginePhd.trigger(health, [], job_queue, mock_auditor)
        
        self.assertTrue(mock_auditor.sync_submodule.called)
        logger.info("✅ Sincronia do Auditor validada.")

    def test_brittle_point_warning(self):
        """Valida log de aviso para pontos de fragilidade."""
        logger.info("⚡ Testando aviso de fragilidade...")
        health = {'brittle_points': ['test_x.py', 'test_y.py']}
        
        with patch("src_local.utils.reflex_engine_phd.logger.warning") as mock_warn:
            ReflexEnginePhd.trigger(health, [], None, None)
            self.assertTrue(mock_warn.called)
            self.assertIn("2 pontos", mock_warn.call_args[0][0])
        logger.info("✅ Aviso de fragilidade validado.")

if __name__ == "__main__":
    unittest.main()
