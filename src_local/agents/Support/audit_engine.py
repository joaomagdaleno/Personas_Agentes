"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Coordenador de Varredura (AuditEngine)
Função: Executar varreduras de padrões integrando vetos e detecção atômica.
Soberania: Core-Support Agent.
"""
import re
import logging
import time

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
        self.veto = LineVeto()

    def scan_content(self, file: str, content: str, patterns: list, context_data: dict, agent_name: str) -> list:
        """🚀 Executa a Varredura Estratégica."""
        start_scan, issues = time.time(), []
        ctx = self._build_scan_context(content, context_data, agent_name, file)
        
        from src_local.agents.Support.logic_auditor import LogicAuditor
        logic_auditor = LogicAuditor()

        for p in patterns:
            ctx["in_docstring"] = False
            for i, line in enumerate(ctx["lines"]):
                if self.veto.should_skip(line, p, ctx): continue
                if not re.search(p['regex'], line, re.IGNORECASE): continue
                
                # 🛡️ Veto de Reporte: Evita auditar comandos que já são de reporte de erro (prevenir loop)
                if self._is_error_report_statement(ctx["lines"], i): continue
                
                # 🧠 Deep Understanding via AST
                severity_override = None
                if file.endswith(".py"):
                    is_safe, reason = self._validate_risk(content, i, p, logic_auditor)
                    if is_safe: continue
                    
                    # Extração de severidade dinâmica se presente no motivo
                    if "[Severity: " in reason:
                        severity_override = reason.split("[Severity: ")[1].split("]")[0]
                    elif "STRATEGIC" in reason.upper():
                        severity_override = "STRATEGIC"

                issues.append(self._create_issue_entry(file, i, p, ctx, severity_override))
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_scan, f"⏱️ [AuditEngine] Varredura em {file}")
        return issues

    def _validate_risk(self, content, index, pattern, auditor):
        """Diferencia entre padrão detectado e risco real via AST."""
        risk_type = "eval" if "eval" in pattern['regex'].lower() else \
                    "shell" if "shell" in pattern['regex'].lower() else \
                    "global" if "global" in pattern['regex'].lower() else \
                    "debug" if "debug" in pattern['regex'].lower() else \
                    "except" if "except" in pattern['regex'].lower() else "print"
        
        return auditor.is_interaction_safe(content, index + 1, risk_type)

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

    def _is_error_report_statement(self, lines, index):
        """
        🛡️ Veto de Reporte: Evita auditar comandos que reportam erros críticos.
        """
        line = lines[index]
        lookahead = lines[index+1] if index + 1 < len(lines) else ""
        context_block = line + lookahead
        # Apenas erro/exceção. Informações gerais (info/debug) devem ser auditadas se contiverem telemetria manual.
        return "logger.error" in context_block or "logger.exception" in context_block

    def _create_issue_entry(self, file, index, pattern, ctx, severity_override=None):
        start, end = max(0, index - 2), min(len(ctx["lines"]), index + 3)
        severity = severity_override or pattern.get('severity', 'medium')
        return {
            'file': file, 'line': index + 1,
            'issue': pattern['issue'], 'severity': severity.upper(), 
            'context': ctx["agent_name"], 'snippet': "\n".join(ctx["lines"][start:end])
        }
