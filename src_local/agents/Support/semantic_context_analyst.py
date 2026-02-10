"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Analista de Contexto Semântico (SemanticContextAnalyst)
Função: Identificar a intencionalidade do código (Observabilidade, Definição ou Lógica).
"""
import ast
import logging

logger = logging.getLogger(__name__)

class SemanticContextAnalyst:
    def __init__(self, heuristics):
        from src_local.agents.Support.intent_heuristics_engine import IntentHeuristicsEngine
        self.heuristics = heuristics
        self.engine = IntentHeuristicsEngine()

    def classify_intent(self, node, tree):
        """
        🔍 Classifica a intenção do nó AST.
        Retorna: 'METADATA', 'OBSERVABILITY', ou 'LOGIC'
        """
        if self._is_metadata_context(node, tree):
            return 'METADATA'
            
        if self._is_observability_context(node, tree):
            return 'OBSERVABILITY'

        return 'LOGIC'

    def _is_metadata_context(self, node, tree):
        """Encapsula todas as verificações de contexto de metadados/técnico."""
        return self.engine.is_metadata_context(node, tree, self.heuristics)

    def _is_observability_context(self, node, tree):
        """Verifica se o nó está relacionado à telemetria ou logs."""
        return self.heuristics.is_inside_log_call(node, tree)


