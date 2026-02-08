"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Coordenador de Varredura (AuditEngine)
Função: Executar varreduras de padrões integrando vetos e detecção atômica.
Soberania: Core-Support Agent.
"""
import re
import logging

logger = logging.getLogger(__name__)

class AuditEngine:
    """
    Assistente Técnico: Coordenador de Varredura de Padrões 🕵️
    
    Este motor é o braço executor de todos os Agentes Ativos. Ele realiza a
    análise de baixo nível, integrando:
    
    1. Varredura Regex: Detecção de padrões definidos pelos PhDs.
    2. Filtragem Inteligente: Colaboração com LineVeto para ignorar falsos positivos.
    3. Consciência de Contexto: Diferencia código de produção, testes e definições de regras.
    4. Identificação de Falsa Positividade: Evita auditar linhas de logs ou docstrings.
    """
    
    def __init__(self):
        from src_local.agents.Support.line_veto import LineVeto
        self.veto = LineVeto()

    def scan_content(self, file: str, content: str, patterns: list, context_data: dict, agent_name: str) -> list:
        """🚀 Executa a Varredura Estratégica."""
        import time
        start_scan, issues = time.time(), []
        ctx = self._build_scan_context(content, context_data, agent_name, file)
        
        # Lazy load do auditor lógico para validação AST
        from src_local.agents.Support.logic_auditor import LogicAuditor
        logic_auditor = LogicAuditor()

        for p in patterns:
            ctx["in_docstring"] = False
            for i, line in enumerate(ctx["lines"]):
                if self.veto.should_skip(line, p, ctx): continue
                if not re.search(p['regex'], line, re.IGNORECASE): continue
                if self._is_log_statement(ctx["lines"], i): continue
                
                # 🧠 Deep Understanding: Se for arquivo Python e Padrão Crítico/Qualidade
                if file.endswith(".py") and self._is_risk_validated_safe(content, i, p, logic_auditor):
                    continue

                issues.append(self._create_issue_entry(file, i, p, ctx))
        
        self._log_perf(file, time.time() - start_scan)
        return issues

    def _is_risk_validated_safe(self, content, index, pattern, auditor):
        """Diferencia entre padrão detectado e risco real via AST."""
        risk_type = "eval" if "eval" in pattern['regex'].lower() else \
                    "shell" if "shell" in pattern['regex'].lower() else \
                    "global" if "global" in pattern['regex'].lower() else \
                    "debug" if "debug" in pattern['regex'].lower() else \
                    "except" if "except" in pattern['regex'].lower() else "print"
        
        is_safe, _ = auditor.is_interaction_safe(content, index + 1, risk_type)
        return is_safe

    def _log_perf(self, file, duration):
        if duration > 0.1:
            logger.debug(f"⏱️ [AuditEngine] Varredura lenta em {file}: {duration:.4f}s")

    def _build_scan_context(self, content, context_data, agent_name, file):
        """
        🧠 Constrói o estado contextual soberano para a varredura atômica.
        Diferencia domínios de produção, testes e ferramentas técnicas.
        """
        info = context_data.get(file, {})
        is_test = info.get("component_type") == "TEST" or "test" in file.lower()
        return {
            "domain": info.get("domain", "PRODUCTION"),
            "is_technical": info.get("component_type") == "AGENT" or info.get("is_gold_standard"),
            "lines": content.splitlines(), "in_docstring": False, "agent_name": agent_name,
            "file_path": file, "is_test": is_test
        }

    def _is_log_statement(self, lines, index):
        """
        🛡️ Veto de Telemetria: Evita auditar comandos que já são de log.
        Previne a detecção de padrões perigosos quando estes estão apenas sendo reportados.
        """
        line = lines[index]
        lookahead = lines[index+1] if index + 1 < len(lines) else ""
        context_block = line + lookahead
        return "logger.error" in context_block or "logger.exception" in context_block

    def _create_issue_entry(self, file, index, pattern, ctx):
        """
        📝 Cria o objeto estruturado de incidência PhD.
        Captura o contexto da linha (snippet) para análise forense posterior.
        """
        start, end = max(0, index - 2), min(len(ctx["lines"]), index + 3)
        return {
            'file': file, 'line': index + 1,
            'issue': pattern['issue'], 'severity': pattern.get('severity', 'medium'), 
            'context': ctx["agent_name"], 'snippet': "\n".join(ctx["lines"][start:end])
        }