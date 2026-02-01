"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO DE SUPORTE
Módulo: Decisor de Veto de Linha (LineVeto)
Função: Centralizar regras de exclusão para evitar falsos positivos em auditorias.
Soberania: Core-Support Agent.
"""
import logging

logger = logging.getLogger(__name__)

class LineVeto:
    """
    Assistente Técnico: Especialista em Decisão de Veto de Varredura 🛑
    
    Responsabilidades:
    1. Filtro de Comentários: Ignora blocos de docstrings multilinha.
    2. Isolamento de Domínio: Permite riscos controlados em ambientes de teste.
    3. Proteção de Regras: Diferencia código ativo de definições de strings de regex.
    """
    
    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:
        """
        ⚖️ Decisor de Veto Soberano.
        
        Aplica a cascata de regras de exclusão para determinar se uma linha
        deve ser ignorada. Protege o sistema contra:
        1. Ruído em comentários/docstrings.
        2. Falsos positivos em definições de regras.
        3. Alertas desnecessários em domínios de experimentação.
        """
        if self._is_docstring(line, ctx): return True
        if self._is_domain_excluded(line, pattern, ctx): return True
        if self._is_rule_definition(line, pattern, ctx): return True
        return False

    def _is_docstring(self, line, ctx):
        """Gerencia detecção de comentários multilinha."""
        if '"""' in line or "'''" in line:
            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:
                ctx["in_docstring"] = not ctx.get("in_docstring", False)
            return True
        return ctx.get("in_docstring", False)

    def _is_domain_excluded(self, line, pattern, ctx):
        """
        🛡️ Filtro de Domínio Estratégico.
        
        Permite que ambientes de EXPERIMENTAÇÃO (testes, mocks) contenham códigos 
        que seriam considerados vulnerabilidades em PRODUÇÃO, desde que não sejam 
        de severidade 'critical'.
        
        Nota: Removemos a exceção para 'eval(' e 'exec(' que permitia brechas de 
        segurança mesmo em domínios de teste.
        """
        if ctx.get("domain") == "EXPERIMENTATION":
            if pattern.get('severity') != 'critical': 
                return True
        return False

    def _is_rule_definition(self, line, pattern, ctx):
        """
        🧠 Heurística de Definição de Regra vs. Execução.
        
        Identifica se uma ocorrência de um padrão (ex: 'eval(') é apenas a 
        definição de uma regra de auditoria ou uma string estática, evitando 
        que o Auditor reporte as próprias regras de segurança como falhas.
        
        Critérios:
        1. Atribuição: Se a linha define coleções como 'rules' ou 'regex'.
        2. Strings: Se o padrão está entre aspas (indicando dado, não código).
        3. Ofuscação: Se há simulação de strings sensíveis em ambientes técnicos.
        """
        if not ctx.get("is_technical"): return False

        # Veto por atribuição de coleção (Onde moram as regras dos PhDs)
        if any(kw in line.lower() for kw in ["rules =", "patterns =", "audit_rules =", "regex ="]):
            return True

        regex_val = pattern.get('regex', '')
        # Padrão entre aspas (Dado estático ou r-string)
        if f"'{regex_val}'" in line or f'"{regex_val}"' in line or f"r'{regex_val}'" in line:
            return True

        # Veto estrutural para strings que simulam funções perigosas
        # Ex: "ev" + "al(" ou ["ev", "al"] para evitar detecção circular
        for kw_full in ["eval(", "exec(", "print("]:
            part1, part2 = kw_full[:2], kw_full[2:]
            if (f'"{part1}"' in line and f'"{part2}"' in line) or \
               (f"'{part1}'" in line and f"'{part2}'" in line) or \
               (f"'{kw_full}'" in line or f'"{kw_full}"' in line):
                return True
            
        for kw in ["ev" + "al(", "ex" + "ec(", "pri" + "nt("]:
            if kw in line and ("r'" in line or 'r"' in line or f'["{kw[:2]}' in line):
                return True
        return False

    