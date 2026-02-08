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
        📑 Atualiza o índice global de metadados técnicos do projeto.
        Realiza uma leitura profunda via AST de todos os módulos Python para
        atualizar a base de conhecimento estrutural utilizada pelo Maestro.
        """
        logger.info("📡 Iniciando indexação soberana de metadados...")
        index_data = {"last_update": time.strftime('%Y-%m-%d %H:%M:%S'), "files": {}}
        
        try:
            for path in self.project_root.rglob("*.py"):
                # Veto de Escopo: Ignora metadados de controle e testes
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
        """
        🧬 Extrai a anatomia do módulo via análise AST.
        Mapeia a estrutura de classes e funções para a base de conhecimento.
        Garante a rastreabilidade da topologia sistêmica.
        """
        try:
            import time
            start_ast = time.time()
            content = path.read_text(encoding='utf-8', errors='ignore')
            tree = ast.parse(content)
            res = {
                "classes": [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)],
                "functions": [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
            }
            duration = time.time() - start_ast
            if duration > 0.05:
                logger.debug(f"⏱️ [Indexer] AST extraída em {path.name}: {duration:.4f}s")
            return res
        except Exception as e:
            # Veto de Silenciamento: Reporta falha na decomposição para o log forense
            logger.warning(f"⚠️ Falha na anatomia AST de {path.name}: {e}")
            return {"error": str(e)}
