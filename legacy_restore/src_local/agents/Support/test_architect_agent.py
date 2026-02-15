import logging
import ast
from pathlib import Path

logger = logging.getLogger(__name__)

class TestArchitectAgent:
    """Agente especialista em gerar esqueletos de testes unitários via IA."""
    
    def __init__(self, brain):
        self.brain = brain

    def draft_test_for_file(self, file_path: str, source_code: str) -> str:
        """Analisa o código e gera um arquivo de teste correspondente."""
        logger.info(f"🏗️ [Architect] Desenhando esqueleto de teste para {file_path}...")
        
        # Extrai assinaturas para economizar tokens
        tree = ast.parse(source_code)
        classes = [node.name for n in tree.body if isinstance(n, ast.ClassDef) for node in [n]]
        functions = [node.name for n in tree.body if isinstance(n, ast.FunctionDef) for node in [n]]
        
        prompt = f"""Crie um arquivo de teste unitário usando 'unittest' para o arquivo '{file_path}'.
Classes: {classes}
Funções: {functions}

O teste deve incluir Mocks para dependências externas.
Responda APENAS com o código Python, sem explicações.
"""
        return self.brain.reason(prompt)
