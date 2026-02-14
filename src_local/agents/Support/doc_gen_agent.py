import logging
import ast

logger = logging.getLogger(__name__)

class DocGenAgent:
    """Agente especialista em elevar o score de 'Excellence' via documentação cognitiva."""
    
    def __init__(self, brain):
        self.brain = brain

    def generate_docstring(self, file_name: str, content: str) -> str:
        """Gera uma docstring de cabeçalho soberana para o arquivo."""
        logger.info(f"✍️ [DocGen] Gerando propósito para {file_name}...")
        
        prompt = f"""Analise o código abaixo e gere uma Docstring de cabeçalho em PORTUGUÊS.
A docstring deve explicar o PROPÓSITO e a FUNÇÃO do arquivo no sistema.
Arquivo: {file_name}
Código: {content[:1500]}

Responda apenas com a string da docstring (entre aspas triplas).
"""
        return self.brain.reason(prompt)
