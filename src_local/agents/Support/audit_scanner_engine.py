"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Varredura AST (AuditScannerEngine)
Função: Executar análise profunda de risco e varredura de padrões em nível de linha.
"""
import re
import logging
logger = logging.getLogger(__name__)

class AuditScannerEngine:
    def scan_pattern(self, p, ctx, file, content, auditor, veto):
        import time
        start_time = time.time()
        pattern_issues = []
        for i, line in enumerate(ctx["lines"]):
            if veto.should_skip(line, p, ctx): continue
            if not re.search(p['regex'], line, re.IGNORECASE): continue
            
            if self._is_error_report(ctx["lines"], i): continue
            
            severity = self._validate_risk_level(file, content, i, p, auditor)
            if severity == "SKIP": continue

            pattern_issues.append(self._create_entry(file, i, p, ctx, severity))
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, f"Telemetry: Pattern scan for {p.get('issue')}")
        return pattern_issues

    def _validate_risk_level(self, file, content, i, p, auditor):
        if not file.endswith(".py"): return None
        from src_local.agents.Support.audit_risk_engine import AuditRiskEngine
        self.risk_engine = AuditRiskEngine()
        
        risk_type = self.risk_engine.map_risk_type(p['regex'])
        is_safe, reason = auditor.is_interaction_safe(content, i + 1, risk_type)
        if is_safe: return "SKIP"
        
        return self._parse_severity(reason)


    def _parse_severity(self, reason):
        if "[Severity: " in reason: return reason.split("[Severity: ")[1].split("]")[0]
        return "STRATEGIC" if "STRATEGIC" in reason.upper() else None

    def _is_error_report(self, lines, idx):
        line = lines[idx]
        lookahead = lines[idx+1] if idx + 1 < len(lines) else ""
        return "logger.error" in (line + lookahead) or "logger.exception" in (line + lookahead)

    def _create_entry(self, file, index, pattern, ctx, sev_override):
        return self.risk_engine.create_entry(file, index, pattern, ctx, sev_override)
