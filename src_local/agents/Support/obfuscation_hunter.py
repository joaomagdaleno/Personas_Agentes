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
    
    Analisa a estrutura da árvore sintática (AST) para encontrar operações
    de soma (BinOp Add) que, quando resolvidas, resultam em palavras-chave
     proibidas (eval, exec, shell, etc).
    """
    
    DANGEROUS_KEYWORDS = {
        "eval", "exec", "shell=True", "system", "popen", 
        "importlib", "__import__", "subprocess"
    }

    def scan_file(self, file_path: str, content: str) -> list:
        """
        Executa a varredura profunda no arquivo.
        Retorna lista de dicionários com {linha, evidencia, reconstrucao}.
        """
        try:
            tree = ast.parse(content)
            findings = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
                    # Tenta resolver a string resultante da soma
                    resolved_str = self._resolve_string_concat(node)
                    
                    if resolved_str:
                        # Verifica se a string resolvida contém perigo
                        for kw in self.DANGEROUS_KEYWORDS:
                            if kw in resolved_str:
                                # Perigo detectado! Mas verificamos se é apenas uma string literal inocente
                                # Se foi construída via concatenação E contém kw, é suspeito.
                                # Mas "Development " + "System" não é perigoso.
                                # O perigo é "sys" + "tem" (quebra da palavra chave).
                                
                                # Heurística: Se a palavra chave foi formada pela JUNÇÃO (não existia nas partes)
                                if self._is_keyword_hidden(node, kw):
                                    findings.append({
                                        "line": node.lineno,
                                        "evidence": "Concatenação Suspeita",
                                        "reconstruction": resolved_str,
                                        "keyword": kw
                                    })
                                    break
            return findings
        except Exception as e:
            # logger.error(f"Erro ao analisar ofuscação em {file_path}: {e}")
            return []

    def _resolve_string_concat(self, node):
        """
        Reconstrói recursivamente uma string de uma cadeia de BinOps.
        Ex: "a" + "b" + "c" -> "abc"
        Retorna None se houver variáveis no meio (não determinístico estaticamente).
        """
        if isinstance(node, (ast.Str, ast.Constant)):
            val = getattr(node, "value", getattr(node, "s", ""))
            return val if isinstance(val, str) else None
            
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            left = self._resolve_string_concat(node.left)
            right = self._resolve_string_concat(node.right)
            
            if left is not None and right is not None:
                return left + right
                
        return None

    def _is_keyword_hidden(self, node, keyword):
        """
        Verifica se a palavra-chave estava 'quebrada' entre os operandos.
        Se 'eval' aparece inteiro no left ou no right, não é ofuscação (é uso explícito/formatado).
        Se 'eval' só existe no resultado final, é ofuscação.
        """
        left_val = self._resolve_string_concat(node.left)
        right_val = self._resolve_string_concat(node.right)
        
        # Se falhou resolver partes, assume que não dá pra julgar (ou retorna False)
        if left_val is None or right_val is None:
            return False
            
        # Se a keyword já existia intacta em uma das partes, não houve ocultação via concatenação.
        if keyword in left_val or keyword in right_val:
            return False
            
        # Se chegou aqui, a keyword só existe na união!
        return True
