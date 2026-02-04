import ast

class ASTNavigator:
    """
    🧭 Navegador de AST.
    Encapsula a lógica de travessia e verificação de nós para aliviar o SafeContextJudge.
    """
    
    def is_descendant(self, target, parent):
        """Verifica se target é filho de parent na AST."""
        for child in ast.walk(parent):
            if child is target:
                return True
        return False

    def is_call_to(self, node, names):
        """Verifica se o nó é uma chamada para uma das funções listadas."""
        if not isinstance(node, ast.Call): return False
        
        # Chamada direta: eval()
        if isinstance(node.func, ast.Name):
            return hasattr(node.func, 'id') and node.func.id in names
            
        # Chamada de atributo: logger.info()
        if isinstance(node.func, ast.Attribute):
            return hasattr(node.func, 'attr') and node.func.attr in names
            
        return False

    def is_assignment_to(self, node, target_substrings):
        """Verifica se o nó é uma atribuição para uma variável contendo substrings alvo."""
        if not isinstance(node, ast.Assign): return False
        
        for target in node.targets:
            if isinstance(target, ast.Name):
                if any(x in target.id for x in target_substrings): return True
        return False
