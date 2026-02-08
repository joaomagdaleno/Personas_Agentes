"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Auditor de Lógica (LogicAuditor)
Função: Detectar anti-padrões lógicos via AST.
"""
import ast

class LogicAuditor:
    """Assistente Técnico: Especialista em Integridade Lógica 🧠"""

    def __init__(self):
        from src_local.agents.Support.safe_context_judge import SafeContextJudge
        self.judge = SafeContextJudge()

    def scan_flaws(self, tree, rel_path, lines, agent_name, ignore_test_context=False):
        """Identifica padrões de falha lógica via AST."""
        issues = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler):
                if not node.type or (len(node.body) == 1 and isinstance(node.body[0], (ast.Pass, ast.Continue))):
                    if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
                        continue
                    
                    i = node.lineno - 1
                    issues.append({
                        'file': rel_path, 'line': node.lineno, 
                        'issue': 'Captura de erro silenciosa detectada.',
                        'severity': 'high', 'context': agent_name,
                        'snippet': "\n".join(lines[max(0, i-2):min(len(lines), i+3)])
                    })
        return issues

    def is_interaction_safe(self, content: str, line_number: int, risk_type: str, ignore_test_context=False) -> tuple:
        """⚖️ Validação profunda: Retorna (is_safe, reason) para transparência total."""
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if hasattr(node, 'lineno') and node.lineno == line_number:
                    # Risco Estrutural (except)
                    if risk_type == "except" and isinstance(node, ast.ExceptHandler):
                        if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
                            return True, "Captura segura."
                    
                    # Risco de Execução Dinâmica (Call)
                    if risk_type in ["eval", "shell", "os.system"] and isinstance(node, ast.Call):
                        if self.judge.is_node_safe(node, tree, ignore_test_context=ignore_test_context):
                            return True, "Execução dinâmica em contexto seguro (Teste/Log)."

                    # Risco de Definição (Strings em regras)
                    str_types = (ast.Constant,)
                    if hasattr(ast, "Str"): str_types += (getattr(ast, "Str"),)
                    if isinstance(node, str_types):
                        # Strings são seguras a menos que sejam executadas (ex: eval("os.system"))
                        # O SafetyNavigator verifica se o nó é argumento de função perigosa
                        from src_local.agents.Support.ast_navigator import ASTNavigator
                        nav = ASTNavigator()
                        if nav.safety_nav.is_being_executed(node, tree):
                             return False, "String sendo executada dinamicamente!"
                        
                        # Se não for executada, é apenas texto (mesmo que contenha 'os.system')
                        return True, "Literal de string não executado (Seguro)."
            
            return False, "Padrão de risco em contexto de execução potencial."
        except Exception as e:
            return False, f"Falha na análise AST: {e}"