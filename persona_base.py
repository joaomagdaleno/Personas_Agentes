from abc import ABC, abstractmethod
import os
import subprocess

class BaseActivePersona(ABC):
    """Especialista técnico do ecossistema Personas Agentes."""

    def __init__(self, project_root):
        """Executa funcionalidade da persona."""

        self.project_root = project_root

        self.name = ""

        self.emoji = ""

        self.role = ""

        self.mission = ""

        self.stack = ""

        self.dependencies = [] # Lista de ferramentas necessárias (ex: ['flutter', 'git'])



    def check_dependency(self, cmd):
        """Executa funcionalidade da persona."""

        """Verifica se uma ferramenta externa está instalada no PATH."""

        try:

            subprocess.run([cmd, '--version'], capture_output=True, shell=True)

            return True

        except:

            return False



    def read_project_file(self, rel_path):
        """Executa funcionalidade da persona."""

        """Lê um arquivo do projeto alvo com segurança."""

        full_path = os.path.join(self.project_root, rel_path)

        if os.path.exists(full_path):

            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:

                return f.read()

        return None



    @abstractmethod

    def perform_audit(self) -> list:
        """Executa a lógica principal da persona."""

        pass



    def run_shell(self, command):
        """Executa funcionalidade da persona."""

        """Executa comandos de terminal na raiz do projeto alvo."""

        try:

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

            return "", str(e), 1



    @abstractmethod

    def get_system_prompt(self) -> str:
        """Executa a lógica principal da persona."""

        pass
