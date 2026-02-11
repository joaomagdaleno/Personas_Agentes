"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Lógica de Ofuscação (ObfuscationLogicEngine)
Função: Resolver concatenações AST e detectar palavras perigosas ocultas.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class ObfuscationLogicEngine:
    def resolve_constant(self, node):
        """Resolve recursivamente a string concatenada."""
        if isinstance(node, (ast.Constant, getattr(ast, "Str", ast.Constant))):
            val = getattr(node, "value", getattr(node, "s", ""))
            return val if isinstance(val, str) else None
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            l, r = self.resolve_constant(node.left), self.resolve_constant(node.right)
            return l + r if l is not None and r is not None else None
        return None

    def check_dangerous_keywords(self, node, resolved, keywords):
        import time
        start_time = time.time()
        
        for kw in keywords:
            if kw in resolved and self._is_fragmented(node, kw):
                logger.warning(f"Obfuscation: Detectado na linha {node.lineno}")
                
                from src_local.utils.logging_config import log_performance
                log_performance(logger, start_time, "Telemetry: Keyword check")
                return {
                    "line": node.lineno, "evidence": "Concatenação Suspeita", 
                    "reconstruction": resolved, "keyword": kw
                }
        return None

    def _is_fragmented(self, node, kw):
        l, r = self.resolve_constant(node.left), self.resolve_constant(node.right)
        return False if (l is None or r is None or kw in l or kw in r) else True
