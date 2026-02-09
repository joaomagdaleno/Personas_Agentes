"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Caçador de Ofuscação (ObfuscationHunter)
Função: Detectar reconstrução de strings perigosas via concatenação (AST).
Soberania: Agente Especialista.
"""
import ast
import logging

logger = logging.getLogger(__name__)

class ObfuscationHunter:
    """
    🕵️ Caçador de Ofuscação: Especialista em Desmascaramento.
    """
    
    DANGEROUS_KEYWORDS = {
        "eval", "exec", "shell=True", "system", "popen", 
        "importlib", "__import__", "subprocess", "pass", "except", 
        "global", "asyncio", "run", "api_key", "AKIA", 
        "storePassword", "InAppPurchase", 
        "findViewById", "ANDROID_ID", "Double", "dynamic", 
        "callbackFlow", "awaitClose", "http", "debuggable", 
        "Activity", "ViewModel", "catch", "mlkit", 
        "logEvent", "socket"
    }

    def scan_file(self, file_path: str, content: str) -> list:
        """Executa a varredura profunda no arquivo."""
        try:
            tree = ast.parse(content)
            findings = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
                    res = self._analyze_binop(node)
                    if res: findings.append(res)
            return findings
        except Exception:
            return []

    def _analyze_binop(self, node):
        """Tenta resolver e validar um nó de concatenação."""
        resolved_str = self._resolve_string_concat(node)
        if not resolved_str: return None

        for kw in self.DANGEROUS_KEYWORDS:
            if kw in resolved_str and self._is_keyword_hidden(node, kw):
                return {
                    "line": node.lineno, "evidence": "Concatenação Suspeita",
                    "reconstruction": resolved_str, "keyword": kw
                }
        return None

    def _resolve_string_concat(self, node):
        """Reconstrói recursivamente uma string de uma cadeia de BinOps."""
        # Compatibilidade Python 3.14 (ast.Str removido)
        str_types = (ast.Constant,)
        if hasattr(ast, "Str"): str_types += (getattr(ast, "Str"),)

        if isinstance(node, str_types):
            val = getattr(node, "value", getattr(node, "s", ""))
            return val if isinstance(val, str) else None
            
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            left = self._resolve_string_concat(node.left)
            right = self._resolve_string_concat(node.right)
            if left is not None and right is not None:
                return left + right
                
        return None

    def _is_keyword_hidden(self, node, keyword):
        """Verifica se a palavra-chave estava 'quebrada' entre os operandos."""
        left_val = self._resolve_string_concat(node.left)
        right_val = self._resolve_string_concat(node.right)
        
        if left_val is None or right_val is None:
            return False
            
        # Keyword intacta em uma das partes -> Não é ocultação.
        if keyword in left_val or keyword in right_val:
            return False
            
        return True