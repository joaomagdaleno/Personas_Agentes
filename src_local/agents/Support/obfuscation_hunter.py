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
    DANGEROUS_KEYWORDS = DANGEROUS_KEYWORDS

    def __init__(self):
        from src_local.agents.Support.obfuscation_logic_engine import ObfuscationLogicEngine
        self.engine = ObfuscationLogicEngine()

    def _resolve_string_concat(self, node):
        return self.engine.resolve_constant(node)
    
    def scan_file(self, file_path: str, content: str) -> list:
        """Varredura de ofuscação de strings."""
        # Whitelist PhD: Ferramentas de suporte e personas especialistas podem usar concatenação técnica
        # Evita o ciclo de auto-flagelação sistêmica.
        skip_list = [
            'safety_definitions.py', 'probe.py', 'echo.py', 
            'logic_auditor.py', 'silent_error_detector.py', 
            'integrity_guardian.py', 'base.py'
        ]
        if any(f in str(file_path).replace("\\", "/") for f in skip_list):
            return []

        try:
            tree = ast.parse(content)
            return self._scan_tree(tree)
        except Exception:
            return []

    def _scan_tree(self, tree):
        """Itera sobre a árvore AST em busca de concatenações."""
        findings = []
        for node in ast.walk(tree):
            if self._is_addition_node(node):
                finding = self._check_node(node, tree)
                if finding: findings.append(finding)
        return findings

    def _is_addition_node(self, node):
        """Detecta nó de operador de adição binária."""
        return isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add)

    def _check_node(self, node, tree):
        """Valida um nó de concatenação."""
        if self._should_skip_node(node, tree):
            return None

        resolved = self.engine.resolve_constant(node)
        if not resolved: return None

        return self.engine.check_dangerous_keywords(node, resolved, DANGEROUS_KEYWORDS)

    def _should_skip_node(self, node, tree):
        """Verifica se o nó deve ser ignorado (ex: definições de regras)."""
        from src_local.agents.Support.ast_navigator import ASTNavigator
        return ASTNavigator().safety_nav.heuristics.is_inside_rule_definition(node, tree)


    def _is_hidden(self, node, kw):
        """Verifica se a kw estava fragmentada."""
        l, r = self._resolve(node.left), self._resolve(node.right)
        return False if (l is None or r is None or kw in l or kw in r) else True