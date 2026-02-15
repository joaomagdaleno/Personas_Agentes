"""
🔄 Iterador de Contexto PhD.
Gerencia a travessia segura e eficiente pelos metadados do projeto.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ContextIterator:
    """Iterador especializado para processamento em lote de componentes."""
    def __init__(self, project_root, context_map, integrity_guardian=None, ignored_files=None, stack="Universal"):
        self.project_root = Path(project_root) if project_root else None
        self.map = context_map
        self.guardian = integrity_guardian
        self.ignored_files = ignored_files or []
        self.stack = stack
        logger.debug(f"🔄 [Iterator] Inicializado para {self.stack} com {len(context_map)} itens.")

    def get_py_files(self):
        """Retorna apenas arquivos Python do mapa."""
        return {p: d for p, d in self.map.items() if p.endswith('.py')}

    def iter_auditable_files(self):
        """Gera conteúdo de arquivos que podem ser auditados, respeitando filtros."""
        for rel_path, metadata in self.map.items():
            if rel_path in self.ignored_files:
                continue
            
            # Filtro básico: focar em arquivos de código fonte relevantes
            if metadata.get("component_type") == "TEST":
                continue
                
            content = self._read_file(rel_path)
            if content:
                yield rel_path, content

    def _read_file(self, rel_path):
        if not self.project_root:
            return None
        abs_path = self.project_root / rel_path
        try:
            if abs_path.exists():
                return abs_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"⚠️ [Iterator] Falha ao ler {rel_path}: {e}")
        return None
