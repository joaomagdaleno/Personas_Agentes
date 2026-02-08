import ast

class ASTNavigator:
    """
    🧭 Navegador de AST.
    Atua como coordenador de travessia, delegando inteligência para 
    navegadores especializados (TestNavigator, SafetyNavigator).
    """
    
    def __init__(self):
        from src_local.agents.Support.test_navigator import TestNavigator
        from src_local.agents.Support.safety_navigator import SafetyNavigator
        self.test_nav = TestNavigator(self)
        self.safety_nav = SafetyNavigator(self)

    def check_safety_rules(self, node, tree):
        """Coordenador: Executa verificação em cascata via delegados."""
        if self.test_nav.is_inside_test_context(node, tree): return True
        if self.safety_nav.is_safe_context(node, tree): return True
        return not self.safety_nav.is_being_executed(node, tree)

    # --- Utilitários Compartilhados (Low Complexity) ---

    def is_descendant(self, target, parent):
        """Verifica se target é filho de parent na AST."""
        if target is parent: return True
        for child in ast.iter_child_nodes(parent):
            if self.is_descendant(target, child):
                return True
        return False

    def is_call_to(self, node, names):
        """Verifica se o nó é uma chamada para uma das funções listadas."""
        if not isinstance(node, ast.Call): return False
        
        # Chamada direta: eval()
        if isinstance(node.func, ast.Name):
            return node.func.id in names
            
        # Chamada de atributo: logger.info()
        if isinstance(node.func, ast.Attribute):
            return node.func.attr in names
            
        return False

    def is_in_dict_value(self, node, target_node, key_names):
        """Verifica se target_node é valor em um dicionário cuja chave tem um dos nomes listados."""
        if not isinstance(node, ast.Dict): return False
        
        # Compatibilidade Python modern (Constant) vs antigo (Str)
        str_types = (ast.Constant,)
        if hasattr(ast, "Str"): str_types += (getattr(ast, "Str"),)

        for k, v in zip(node.keys, node.values):
            if not v or not self.is_descendant(target_node, v): continue
            
            if isinstance(k, str_types): 
                if getattr(k, "value", getattr(k, "s", "")) in key_names: return True
        return False
