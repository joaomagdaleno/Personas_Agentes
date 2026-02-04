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

    """

    

    def __init__(self):

        from src_local.agents.Support.vulnerability_heuristic import VulnerabilityHeuristic

        self.heuristic = VulnerabilityHeuristic()



    def should_skip(self, line: str, pattern: dict, ctx: dict) -> bool:
        """⚖️ Decisor de Veto Soberano."""
        clean_line = line.strip()
        if clean_line.startswith("#"): return True

        file_path = ctx.get("file_path", "").replace("\\", "/")
        
        if self._check_test_permissions(line, pattern, file_path): return True
        if self._is_docstring(line, ctx): return True
        if self._is_domain_excluded(line, pattern, ctx): return True
        if self._is_technical_math_context(line, pattern): return True
        
        return self._is_rule_definition(line, pattern, ctx)

    def _check_test_permissions(self, line, pattern, file_path):
        # Rigor PhD: Em arquivos de teste, permitimos padrões perigosos para validação
        if "/tests/" in file_path or "test_" in file_path:
            # Se a linha contém o próprio padrão sendo buscado como string, veta
            regex_val = pattern.get('regex', '')
            if regex_val and (f"'{regex_val}'" in line or f'"{regex_val}"' in line):
                return True
            # Veto de criticidade em testes (permitir experimentos)
            if pattern.get("severity") == "critical" and "pass" in line:
                return True
        return False

    def _is_technical_math_context(self, line: str, pattern: dict) -> bool:
        """
        🧠 Diferenciação Semântica.
        Veta o alerta se a linha for claramente técnica (UI/Física/Sinais) 
        e não semântica para dinheiro.
        """
        if "Imprecisão Monetária" not in pattern.get('issue', ''):
            return False
            
        # Termos que indicam que o Float é legítimo e necessário
        tech_terms = [
            'alpha', 'progress', 'offset', 'dp', 'sp', 'x', 'y', 'width', 'height',
            'radius', 'velocity', 'phase', 'amplitude', 'frequency', 'duration',
            'color', 'rotation', 'scale', 'padding', 'margin', 'lerp', 'sin', 'cos'
        ]
        
        lower_line = line.lower()
        # Se houver um termo financeiro na mesma linha, o alerta deve disparar (não veta)
        financial_terms = ['price', 'amount', 'balance', 'cost', 'total', 'tax', 'fee']
        if any(f in lower_line for f in financial_terms):
            return False
            
        return any(rf"\b{t}\b" in lower_line for t in tech_terms)



    def _is_docstring(self, line, ctx):

        """Gerencia detecção de comentários multilinha."""

        if '"""' in line or "'''" in line:

            if line.count('"""') % 2 != 0 or line.count("'''") % 2 != 0:

                ctx["in_docstring"] = not ctx.get("in_docstring", False)

            return True

        return ctx.get("in_docstring", False)



    def _is_domain_excluded(self, line, pattern, ctx):

        """🛡️ Filtro de Domínio Estratégico."""

        if ctx.get("domain") == "EXPERIMENTATION":

            return pattern.get('severity') != 'critical'

        return False



    def _is_rule_definition(self, line, pattern, ctx):

        """🧠 Heurística de Definição de Regra vs. Execução."""

        if not ctx.get("is_technical"): return False

        keywords = ["rules =", "patterns =", "audit_rules =", "regex =", "diretriz:", "silent_pattern =", "brittle_pattern ="]

        if any(kw in line.lower() for kw in keywords):

            return True



        if self.heuristic.is_strategic_phrase(line):

            return True



        regex_val = pattern.get('regex', '')

        if regex_val and any(q + regex_val + q in line for q in ["'", '"']):

            return True



        return self.heuristic.is_obfuscated_vulnerability(line)
