import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class SemanticSearchAgent:
    """Busca semântica leve para hardware mobile (i5 7200U)."""
    
    def __init__(self, brain):
        self.brain = brain # CognitiveEngine

    def find_relevant_files(self, query, context_map, limit=3):
        """Usa a IA para filtrar arquivos por INTENÇÃO, não apenas texto."""
        logger.info(f"🧠 [Semantic] Buscando por intenção: '{query}'")
        
        # Cria um resumo compacto dos arquivos para a IA decidir
        summary = ""
        for file, data in list(context_map.items())[:30]: # Amostra para não estourar RAM
            summary += f"- {file}: {data.get('component_type')}
"

        prompt = f"""Dada a pergunta do usuário: '{query}'
E a lista de arquivos do projeto:
{summary}

Quais os 3 arquivos mais prováveis de conter a resposta? 
Responda APENAS os caminhos dos arquivos, um por linha.
"""
        res = self.brain.reason(prompt)
        return res.strip().split('
') if res else []
