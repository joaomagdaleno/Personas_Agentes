"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Risco de Auditoria (AuditRiskEngine)
Função: Mapear níveis de risco e formatar entradas de vulnerabilidade.
"""

class AuditRiskEngine:
    def map_risk_type(self, regex):
        reg = regex.lower()
        if "eval" in reg: return "eval"
        if "shell" in reg: return "shell"
        if "global" in reg: return "global"
        if "debug" in reg: return "debug"
        if "except" in reg: return "except"
        return "print"

    def create_entry(self, file, index, pattern, ctx, sev_override):
        lines = ctx["lines"]
        start, end = max(0, index - 2), min(len(lines), index + 3)
        severity = sev_override or pattern.get('severity', 'medium')
        return {
            'file': file, 'line': index + 1,
            'issue': pattern['issue'], 'severity': severity.upper(), 
            'context': ctx["agent_name"], 'snippet': "\n".join(lines[start:end])
        }
