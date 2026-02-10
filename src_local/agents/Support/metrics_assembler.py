"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Montador de Métricas (MetricsAssembler)
Função: Centralizar a coleta de metadados de QA e métricas operacionais.
"""
import logging

logger = logging.getLogger(__name__)

class MetricsAssembler:
    """Assistente Técnico: Especialista em Síntese de QA 📊"""

    def gather_qa_data(self, map_data, internal_health, personas):
        """Coleta a matriz de qualidade e pirâmide de testes via personas."""
        testify = next((p for p in personas if p.name == "Testify"), None)
        
        return {
            "pyramid": testify.analyze_test_pyramid(map_data) if testify else {}, 
            "execution": internal_health,
            "matrix": testify.analyze_test_quality_matrix(map_data) if testify else []
        }

    def get_orchestration_metrics(self, current_metrics, all_findings=None):
        """Sintetiza métricas com resultados de auditoria."""
        m = dict(current_metrics)
        if all_findings:
            m["all_findings"] = all_findings
        return m
