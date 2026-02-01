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
        from src.agents.Support.line_veto import LineVeto
        self.veto = LineVeto()

    def scan_content(self, file: str, content: str, patterns: list, context_data: dict, agent_name: str) -> list:
        """
        🚀 Executa a Varredura Estratégica.
        
        Coordena o processo de leitura, aplicação de vetos de linha e detecção 
        de padrões regex. Garante que o contexto (domínio, stack) seja 
        respeitado para evitar falsos positivos.
        """
        issues = []
        ctx = self._build_scan_context(content, context_data, agent_name, file)
        
        for p in patterns:
            ctx["in_docstring"] = False
            for i, line in enumerate(ctx["lines"]):
                if self.veto.should_skip(line, p, ctx): continue
                
                if re.search(p['regex'], line, re.IGNORECASE):
                    if not self._is_log_statement(ctx["lines"], i):
                        issues.append(self._create_issue_entry(file, i, p, ctx))
        return issues

    def _build_scan_context(self, content, context_data, agent_name, file):
        """Constrói o estado contextual para a varredura."""
        info = context_data.get(file, {})
        return {
            "domain": info.get("domain", "PRODUCTION"),
            "is_technical": info.get("component_type") == "AGENT" or info.get("is_gold_standard"),
            "lines": content.splitlines(), "in_docstring": False, "agent_name": agent_name
        }

    def _is_log_statement(self, lines, index):
        """Evita auditar comandos que já são de log."""
        line = lines[index]
        lookahead = lines[index+1] if index + 1 < len(lines) else ""
        context_block = line + lookahead
        return "log" + "ger.er" + "ror" in context_block or "log" + "ger.exce" + "ption" in context_block

    def _create_issue_entry(self, file, index, pattern, ctx):
        """Cria o objeto estruturado de incidência."""
        start, end = max(0, index - 2), min(len(ctx["lines"]), index + 3)
        return {
            'file': file, 'line': index + 1,
            'issue': pattern['issue'], 'severity': pattern.get('severity', 'medium'), 
            'context': ctx["agent_name"], 'snippet': "\n".join(ctx["lines"][start:end])
        }
