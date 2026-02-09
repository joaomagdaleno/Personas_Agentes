"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Juiz de Intencionalidade de Telemetria (TelemetryIntentJudge)
Função: Diferenciar entre telemetria manual para log (Sugerir Melhoria) e para lógica (Risco).
"""
import ast
import logging

logger = logging.getLogger(__name__)

class TelemetryIntentJudge:
    def __init__(self, heuristics, judge):
        self.heuristics = heuristics
        self.judge = judge

    def judge_intent(self, node, tree, ignore_test_context=False):
        """
        ⚖️ Analisa a intencionalidade do uso de tempo/performance.
        Retorna (is_safe, severity_override, reason)
        """
        # 1. Contexto de Definição Técnica (Regex/Regras)
        if self.heuristics.is_inside_rule_definition(node, tree):
            return True, "STRATEGIC", "Definição técnica de padrão de telemetria."
            
        # 2. Uso em Reporte de Erro Crítico (Sempre perigoso se manual)
        if self._is_inside_error_report(node, tree):
            return False, "HIGH", "Telemetria manual em fluxo de erro crítico. Use _log_performance para integridade."

        # 3. Uso em Chamada de Log Informacional (Melhoria sugerida)
        if self.heuristics.is_inside_log_call(node, tree):
            return False, "STRATEGIC", "Telemetria manual em Log (Info/Debug). Sugestão: Migrar para _log_performance."

        # 4. Uso em Atribuição para variável de duração usada em Log
        if self._is_assigned_to_log_variable(node, tree):
            return False, "STRATEGIC", "Cálculo de duração manual para Log futuro. Sugestão: Usar utilitários da Base."

        # 5. Uso em Lógica de Controle (Risco Real de Débito)
        # Se for apenas uma subtração simples (time.time() - x), e não estiver em um 'if' ou 'while', 
        # provavelmente é apenas um log manual esquecido.
        if self._is_simple_time_subtraction(node):
            return False, "STRATEGIC", "Telemetria manual detectada. Sugestão: Migrar para _log_performance."

        return False, "MEDIUM", "Telemetria manual detectada em Lógica de Controle (Risco de Runtime)."

    def _is_simple_time_subtraction(self, node):
        """Verifica se o nó é uma subtração simples de time.time()."""
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Sub):
            # Verifica se o lado esquerdo é uma chamada a time.time() ou time()
            left = node.left
            if isinstance(left, ast.Call):
                func = left.func
                # Trata 'time.time()'
                if isinstance(func, ast.Attribute) and func.attr == 'time':
                    return True
                # Trata 'from time import time; time()'
                if isinstance(func, ast.Name) and func.id == 'time':
                    return True
        return False

    def _is_inside_error_report(self, target_node, tree):
        """Detecta se o nó está dentro de um logger.error ou exception."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.Call):
                if self.heuristics.utils.is_call_to(parent, ['error', 'exception', 'critical']):
                    return True
        return False

    def _is_assigned_to_log_variable(self, target_node, tree):
        """Detecta se o resultado da subtração de tempo vai para uma variável de telemetria."""
        parent_chain = self.heuristics.utils.get_parent_chain(target_node, tree)
        for parent in parent_chain:
            if isinstance(parent, ast.Assign):
                for t in parent.targets:
                    name = ""
                    if isinstance(t, ast.Name): name = t.id
                    elif isinstance(t, ast.Attribute): name = t.attr
                    
                    if any(k in name.lower() for k in ["duration", "elapsed", "took", "time_diff", "start_t"]):
                        return True
        return False