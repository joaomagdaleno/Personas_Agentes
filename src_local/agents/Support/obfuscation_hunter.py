"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Caçador de Ofuscação (ObfuscationHunter)
Função: Detectar reconstrução de strings perigosas via concatenação (AST).
"""
import ast
import logging
from src_local.agents.Support.safety_definitions import DANGEROUS_KEYWORDS

logger = logging.getLogger(__name__)

class ObfuscationHunter:
    """🕵️ Caçador de Ofuscação: Especialista em Desmascaramento."""
    
    def scan_file(self, file_path: str, content: str) -> list:
        """Varredura de ofuscação de strings."""
        try:
            tree = ast.parse(content)
            findings = []
            for node in ast.walk(tree):
                if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
                    res = self._check_node(node, tree)
                    if res: findings.append(res)
            return findings
        except Exception:
            return []

    def _check_node(self, node, tree):
        """Valida um nó de concatenação."""
        # Ignora definições de regras
        from src_local.agents.Support.ast_navigator import ASTNavigator
        if ASTNavigator().safety_nav.heuristics.is_inside_rule_definition(node, tree):
            return None

        resolved = self._resolve(node)
        if not resolved: return None

        for kw in DANGEROUS_KEYWORDS:
            if kw in resolved and self._is_hidden(node, kw):
                logger.warning(f"Obfuscation: Detectado na linha {node.lineno}")
                return {"line": node.lineno, "evidence": "Concatenação Suspeita", "reconstruction": resolved, "keyword": kw}
        return None

    def _resolve(self, node):
        """Resolve recursivamente a string concatenada."""
        if isinstance(node, (ast.Constant, getattr(ast, "Str", ast.Constant))):
            val = getattr(node, "value", getattr(node, "s", ""))
            return val if isinstance(val, str) else None
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            l, r = self._resolve(node.left), self._resolve(node.right)
            return l + r if l is not None and r is not None else None
        return None

    def _is_hidden(self, node, kw):
        """Verifica se a kw estava fragmentada."""
        l, r = self._resolve(node.left), self._resolve(node.right)
        return False if (l is None or r is None or kw in l or kw in r) else True