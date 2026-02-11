"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Lógica de Travessia AST (ASTTraversalLogic)
Função: Utilitários complexos para navegação em árvores sintáticas.
"""
import ast
import logging
logger = logging.getLogger(__name__)

class ASTTraversalLogic:
    def get_parent_chain(self, target_node, tree):
        """Reconstrói a linhagem do nó de baixo para cima."""
        import time
        start_time = time.time()
        
        parent_map = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        chain = []
        curr = target_node
        while curr in parent_map:
            curr = parent_map[curr]
            chain.append(curr)
            
        duration = time.time() - start_time
        # logger.debug(f"Telemetry: Parent chain traversal took {duration:.6f}s")
        return chain

    def is_in_dict_value(self, node, target_node, key_names, utils):
        """Verifica se target_node é valor em um dicionário cuja chave tem um dos nomes listados."""
        if not isinstance(node, ast.Dict): return False
        
        str_types = (ast.Constant,)
        if hasattr(ast, "Str"): str_types += (getattr(ast, "Str"),)

        for k, v in zip(node.keys, node.values):
            if not v or not utils.is_descendant(target_node, v): continue
            
            if isinstance(k, str_types): 
                if getattr(k, "value", getattr(k, "s", "")) in key_names: return True
        return False
    def is_descendant(self, target, parent):
        """Delega para ASTNodeInspector."""
        return self._inspector().is_descendant(target, parent)

    def is_call_to(self, node, names):
        """Delega para ASTNodeInspector."""
        return self._inspector().is_call_to(node, names)

    def _inspector(self):
        if not hasattr(self, '_insp'):
            from src_local.agents.Support.ast_node_inspector import ASTNodeInspector
            self._insp = ASTNodeInspector()
        return self._insp
