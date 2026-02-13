import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ContextIterator:
    """
    🧬 Iterador de Contexto PhD.
    Encapsula a lógica de travessia e filtragem de arquivos do projeto.
    """
    def __init__(self, project_root, context_data, integrity_guardian, ignored_files, stack):
        self.project_root = project_root
        self.context_data = context_data
        self.integrity_guardian = integrity_guardian
        self.ignored_files = ignored_files
        self.stack = stack

    def iter_auditable_files(self):
        """Gerador para iteração limpa e eficiente de arquivos auditáveis."""
        for file in self.context_data.keys():
            if self._should_audit_file(file):
                content = self.read_project_file(file)
                if content:
                    yield file, content

    def _should_audit_file(self, file):
        """Valida relevância via IntegrityGuardian."""
        if file in self.ignored_files: return False
        if self.context_data.get(file, {}).get("component_type") == "TEST": return False
        return self.integrity_guardian.is_relevant_file(file, self.stack)

    def read_project_file(self, rel_path):
        """Leitura segura."""
        abs_path = Path(self.project_root) / rel_path
        try:
            return abs_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"⚠️ Falha na leitura do arquivo {rel_path}: {e}")
            return None
