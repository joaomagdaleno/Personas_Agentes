import logging
import json
import hashlib
from pathlib import Path
from typing import List, Dict

logger = logging.getLogger(__name__)

class MemoryEngine:
    """
    🧠 Motor de Memória (Local RAG).
    Indexa o projeto e fornece fragmentos relevantes para o CognitiveEngine.
    """
    
    def __init__(self, project_root):
        self.root = Path(project_root)
        self.index_path = self.root / ".gemini" / "memory_index.json"
        self.index_path.parent.mkdir(exist_ok=True)
        self.memory = self._load_index()

    def _load_index(self) -> Dict:
        if self.index_path.exists():
            try:
                return json.loads(self.index_path.read_text(encoding="utf-8"))
            except:
                return {}
        return {}

    def save_index(self):
        self.index_path.write_text(json.dumps(self.memory, indent=2), encoding="utf-8")

    def index_project(self, context_map: Dict):
        """Indexa arquivos chave do projeto (Resumos Cognitivos)."""
        logger.info("🧠 [Memory] Sincronizando memória do projeto...")
        for rel_path, data in context_map.items():
            content = data.get("content")
            if not content: continue
            
            # Apenas indexa se o conteúdo mudou
            content_hash = hashlib.md5(content.encode()).hexdigest()
            if self.memory.get(rel_path, {}).get("hash") == content_hash:
                continue
                
            # Extrai "âncoras" de conhecimento (Classes, Funções, Docstrings)
            anchors = self._extract_anchors(content)
            self.memory[rel_path] = {
                "hash": content_hash,
                "anchors": anchors,
                "type": data.get("component_type", "UNKNOWN")
            }
            
        self.save_index()
        logger.info(f"🧠 [Memory] {len(self.memory)} arquivos na memória de curto prazo.")

    def _extract_anchors(self, content: str) -> List[str]:
        """Extração simplificada de âncoras para busca semântica/keyword."""
        import re
        # Busca definições de classes e funções
        found = re.findall(r"(?:class|def)\s+([a-zA-Z_][a-zA-Z0-9_]*)", content)
        return list(set(found))[:20] # Limita a 20 âncoras por arquivo

    def search_context(self, query: str, limit: int = 5) -> str:
        """Busca arquivos relevantes baseado na query."""
        query_terms = set(query.lower().split())
        scored_files = []
        
        for path, data in self.memory.items():
            score = 0
            anchors = [a.lower() for a in data.get("anchors", [])]
            # Match simples de termos
            for term in query_terms:
                if any(term in a for a in anchors):
                    score += 2
                if term in path.lower():
                    score += 1
            
            if score > 0:
                scored_files.append((path, score))
                
        scored_files.sort(key=lambda x: x[1], reverse=True)
        
        context_str = "CONTEXTO RELEVANTE DO PROJETO:\n"
        for path, _ in scored_files[:limit]:
            context_str += f"- Arquivo: {path} (Componente: {self.memory[path]['type']})\n"
            context_str += f"  Âncoras: {', '.join(self.memory[path]['anchors'])}\n"
            
        return context_str if scored_files else ""
