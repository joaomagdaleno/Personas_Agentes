import unittest
import logging
from src_local.agents.Python.Audit.metric import MetricPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestMetric")

class TestMetric(unittest.TestCase):
    """🧪 Testes Unitários: Entendimento de Contexto Semântico."""

    def setUp(self):
        self.agent = MetricPersona("mock_root")

    def test_telemetry_intent_discrimination(self):
        """Garante que o sistema entenda a diferença entre Log e Lógica via Intencionalidade."""
        logger.info("⚡ Testando discriminação de intenção semântica...")
        
        # Caso 1: Telemetria manual em Log (Intenção: OBSERVABILIDADE -> Sugestão STRATEGIC)
        log_code = "import time\nlogger.info(time.time() - start)"
        
        # Caso 2: Telemetria manual em Lógica (Intenção: LOGIC -> Sugestão STRATEGIC para padronização)
        logic_code = "import time\nduration = time.time() - start"
        
        self.agent.set_context({
            "identity": {},
            "map": {"app.py": {"component_type": "LOGIC", "domain": "PRODUCTION"}}
        })
        
        from src_local.agents.Support.audit_engine import AuditEngine
        engine = AuditEngine()
        
        # Auditoria Semântica
        findings_log = engine.scan_content("app.py", log_code, self.agent.perform_audit_rules(), self.agent.context_data, "Metric")
        findings_logic = engine.scan_content("app.py", logic_code, self.agent.perform_audit_rules(), self.agent.context_data, "Metric")

        # Verifica se o sistema ENTENDEU a diferença de intenção
        self.assertGreater(len(findings_log), 0, "Deveria ter encontrado a telemetria no log")
        self.assertEqual(findings_log[0]["severity"], "STRATEGIC", "Deveria ser estratégica (melhoria) em contexto de Observabilidade.")
        
        self.assertGreater(len(findings_logic), 0, "Deveria ter encontrado a telemetria na lógica")
        # Agora padronizamos como STRATEGIC em todos os contextos de uso manual simples
        self.assertEqual(findings_logic[0]["severity"], "STRATEGIC", "Deveria ser estratégica (melhoria) também em contexto de Lógica (Padronização).")
        
        logger.info("✅ Discriminação de intenção semântica validada.")

    def test_technical_definition_ignored(self):
        """Garante que definições técnicas de regras não sejam flagadas (Intenção: METADATA)."""
        rules_code = "audit_rules = [{'regex': 'time.time() - start_time'}]"
        
        self.agent.set_context({
            "identity": {},
            "map": {"rules.py": {"component_type": "AGENT", "domain": "PRODUCTION"}}
        })
        
        from src_local.agents.Support.audit_engine import AuditEngine
        findings = AuditEngine().scan_content("rules.py", rules_code, self.agent.perform_audit_rules(), self.agent.context_data, "Metric")
        
        self.assertEqual(len(findings), 0, "Deveria ignorar definição técnica de regra (Metadados).")

if __name__ == "__main__":
    unittest.main()
