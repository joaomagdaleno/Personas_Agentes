"""
SISTEMA DE PERSONAS AGENTES - INDEXADOR TÉCNICO
Módulo: Indexador de Metadados (Indexer)
Função: Gerar o mapa de conhecimento estrutural (classes/funções).
Soberania: CORE-UTILITY.
"""
import logging
import ast
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class Indexer:
    """
    Estrategista de Conhecimento: Cataloga a estrutura anatômica do projeto 📑.
    
    Responsabilidades:
    1. Varredura Estrutural: Identifica todos os componentes Python do ecossistema.
    2. Extração de Consciência: Mapeia classes e funções para o grafo de chamadas.
    3. Persistência de Conhecimento: Mantém o 'index.json' sincronizado.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.index_file = self.project_root / "index.json"

    def update_index(self):
        """
        📑 Atualiza o índice global de metadados técnicos.
        
        Realiza a leitura profunda de todos os módulos para atualizar a
        base de conhecimento utilizada pelo Orquestrador.
        """
        logger.info("📡 Iniciando indexação soberana de metadados...")
        index_data = {"last_update": time.strftime('%Y-%m-%d %H:%M:%S'), "files": {}}
        
        try:
            for path in self.project_root.rglob("*.py"):
                # Filtro de exclusão via Pathlib
                if any(part in ["__pycache__", "build", "tests"] for part in path.parts):
                    continue
                
                rel_path = path.relative_to(self.project_root).as_posix()
                index_data["files"][rel_path] = self._extract_metadata(path)
                
            logger.info(f"✅ Indexação concluída: {len(index_data['files'])} módulos catalogados.")
            return index_data
        except Exception as e:
            logger.error(f"🚨 Falha crítica no motor de indexação: {e}", exc_info=True)
            return index_data

    def _extract_metadata(self, path: Path):
        """Extrai a anatomia do módulo via análise AST."""
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            tree = ast.parse(content)
            return {
                "classes": [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)],
                "functions": [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            }
        except Exception as e:
            logger.warning(f"⚠️ Falha na anatomia AST de {path.name}: {e}")
            return {"error": str(e)}
