from abc import ABC, abstractmethod
import os
import subprocess
import logging
import re
from logging_config import setup_logging

# Garante que o logging esteja configurado
setup_logging()
logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """Classe base modelo para todas as personas especialistas do sistema."""

    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        self.project_root = project_root
        self.name = ""
        self.emoji = ""
        self.role = ""
        self.mission = ""
        self.stack = ""
        self.dependencies = []  # Lista de ferramentas necessárias (ex: ['flutter', 'git'])
        self.ignored_dirs = ['.git', 'build', 'node_modules', '__pycache__', 'venv', '.env', '.dart_tool', 'obj', 'bin']

    def check_dependency(self, cmd):
        """Verifica se uma ferramenta externa está instalada no PATH."""
        try:
            subprocess.run([cmd, '--version'], capture_output=True, shell=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.warning(f"Dependência '{cmd}' não encontrada: {e}")
            return False
        except Exception as e:
            logger.error(f"Erro inesperado ao verificar dependência '{cmd}': {e}")
            return False

    def read_project_file(self, rel_path):
        """Lê um arquivo do projeto alvo com segurança usando context manager."""
        full_path = os.path.join(self.project_root, rel_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            except Exception as e:
                logger.error(f"Erro ao ler arquivo {rel_path}: {e}")
        return None

    def find_patterns_in_files(self, extension: str, patterns: list) -> list:
        """
        Método Utilitário: Busca padrões (regex ou strings) em arquivos com determinada extensão.
        Retorna uma lista de problemas formatada.
        """
        found_issues = []
        if not self.project_root:
            return []

        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith(extension):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    content = self.read_project_file(rel_path)
                    if not content:
                        continue

                    for p in patterns:
                        pattern = p['regex']
                        issue_msg = p['issue']
                        severity = p.get('severity', 'medium')
                        
                        if re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                            found_issues.append({
                                'file': rel_path,
                                'issue': issue_msg,
                                'severity': severity,
                                'context': self.name
                            })
        return found_issues

    @abstractmethod
    def perform_audit(self) -> list:
        """Executa auditoria técnica específica da persona. Deve ser implementado pelas subclasses."""
        pass

    def run_shell(self, command):
        """Executa comandos de terminal na raiz do projeto alvo."""
        try:
            logger.debug(f"Executando shell: {command}")
            result = subprocess.run(
                command, 
                shell=True, 
                cwd=self.project_root, 
                capture_output=True, 
                text=True,
                encoding='utf-8',
                errors='ignore'
            )
            return result.stdout, result.stderr, result.returncode
        except Exception as e:
            logger.error(f"Erro ao executar comando '{command}': {e}")
            return "", str(e), 1

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Retorna o prompt de sistema formatado para o LLM."""
        pass
