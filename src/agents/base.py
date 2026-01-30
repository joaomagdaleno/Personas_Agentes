from abc import ABC, abstractmethod
import os
import subprocess
import logging
import re
from src.utils.logging_config import setup_logging

# Garante que o logging esteja configurado globalmente
setup_logging()
logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """
    Classe Abstrata Base (Model). 
    Define o contrato para todos os agentes especialistas.
    """

    def __init__(self, project_root):
        self.project_root = project_root
        self.name = ""
        self.emoji = ""
        self.role = ""
        self.mission = ""
        self.stack = ""
        self.dependencies = []
        self.ignored_dirs = ['.git', 'build', 'node_modules', '__pycache__', 'venv', '.env', '.dart_tool', 'obj', 'bin']

    def read_project_file(self, rel_path):
        """Lê arquivos com tratamento centralizado de erro e contexto."""
        full_path = os.path.join(self.project_root, rel_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            except Exception as e:
                logger.error(f"[{self.name}] Erro ao ler {rel_path}: {e}")
        return None

    def find_patterns(self, extension: str, patterns: list) -> list:
        """
        Reutilização de Código: Engine genérica de busca para as personas.
        Evita que cada persona precise implementar loops complexos de os.walk.
        """
        issues = []
        if not self.project_root:
            return []

        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith(extension):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    content = self.read_project_file(rel_path)
                    if not content: continue

                    for p in patterns:
                        if re.search(p['regex'], content, re.MULTILINE | re.IGNORECASE):
                            issues.append({
                                'file': rel_path,
                                'issue': p['issue'],
                                'severity': p.get('severity', 'medium'),
                                'context': self.name
                            })
        return issues

    @abstractmethod
    def perform_audit(self) -> list:
        """Implementação obrigatória da lógica de auditoria."""
        pass

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Retorna o prompt de sistema especializado."""
        pass

    def __str__(self):
        return f"{self.emoji} {self.name} ({self.role})"