"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Risco de Auditoria (AuditRiskEngine)
Função: Mapear níveis de risco e formatar entradas de vulnerabilidade.
"""

import logging
logger = logging.getLogger(__name__)
    
class AuditRiskEngine:
    def map_risk_type(self, regex):
        import time
        start_time = time.time()
        reg = regex.lower()
        risk = "print"
        if "eval" in reg: risk = "eval"
        elif "shell" in reg: risk = "shell"
        elif "global" in reg: risk = "global"
        elif "debug" in reg: risk = "debug"
        elif "except" in reg: risk = "except"
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: Risk mapping")
        return risk

    def create_entry(self, file, index, pattern, ctx, sev_override):
        lines = ctx["lines"]
        start, end = max(0, index - 2), min(len(lines), index + 3)
        severity = sev_override or pattern.get('severity', 'medium')
        return {
            'file': file, 'line': index + 1,
            'issue': pattern['issue'], 'severity': severity.upper(), 
            'context': ctx["agent_name"], 'snippet': "\n".join(lines[start:end])
        }
