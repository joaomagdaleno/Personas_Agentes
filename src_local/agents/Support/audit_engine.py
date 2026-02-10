"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Coordenador de Varredura (AuditEngine)
Função: Executar varreduras de padrões integrando vetos e detecção atômica.
Soberania: Core-Support Agent.
"""
import re
import logging
import time
from src_local.utils.logging_config import log_performance

logger = logging.getLogger(__name__)

class AuditEngine:
    """
    Assistente Técnico: Coordenador de Varredura de Padrões 🕵️
    
    Este motor é o braço executor de todos os Agentes Ativos. Ele realiza a
    análise de baixo nível, integrando:
    
    1. Varredura Regex: Detecção de padrões definidos pelos PhDs.
    2. Filtragem Inteligente: Colaboração com LineVeto para ignorar falsos positivos.
    3. Consciência de Contexto: Diferencia código de produção, testes e definições de regras.
    """
    
    def __init__(self):
        from src_local.agents.Support.line_veto import LineVeto
        from src_local.agents.Support.audit_scanner_engine import AuditScannerEngine
        self.veto = LineVeto()
        self.engine = AuditScannerEngine()

    def scan_content(self, file: str, content: str, patterns: list, context_data: dict, agent_name: str) -> list:
        """🚀 Executa a Varredura Estratégica."""
        start_scan, issues = time.time(), []
        ctx = self._build_scan_context(content, context_data, agent_name, file)
        
        from src_local.agents.Support.logic_auditor import LogicAuditor
        auditor = LogicAuditor()
        
        for p in patterns:
            ctx["in_docstring"] = False
            issues.extend(self.engine.scan_pattern(p, ctx, file, content, auditor, self.veto))
        
        log_performance(logger, start_scan, f"⏱️ [AuditEngine] Varredura em {file}")
        return issues


    def scan_multiple_files(self, files, patterns, read_func, context_data, agent_name):
        """🚀 Executa varredura em lote para reduzir entropia do Agente."""
        issues = []
        for file in files:
            content = read_func(file)
            if content:
                issues.extend(self.scan_content(file, content, patterns, context_data, agent_name))
        return issues


    def _log_perf(self, file, duration):
        if duration > 0.1:
            logger.debug(f"⏱️ [AuditEngine] Varredura lenta em {file}: {duration:.4f}s")

    def _build_scan_context(self, content, context_data, agent_name, file):
        info = context_data.get(file, {})
        is_test = info.get("component_type") == "TEST" or "test" in file.lower()
        return {
            "domain": info.get("domain", "PRODUCTION"),
            "is_technical": info.get("component_type") == "AGENT" or info.get("is_gold_standard"),
            "lines": content.splitlines(), "in_docstring": False, "agent_name": agent_name,
            "file_path": file, "is_test": is_test
        }


