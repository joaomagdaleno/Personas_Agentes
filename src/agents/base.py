from abc import ABC, abstractmethod
import os
import re
import ast
import logging

logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """Classe base com Consciência Estrutural e Auto-Cura Inteligente."""
    def __init__(self, project_root=None):
        self.project_root = project_root
        self.name = "Base"
        self.emoji = "👤"
        self.role = "Generalist"
        self.stack = "Universal"
        self.context_data = {}
        self.ignored_dirs = ['.git', '__pycache__', 'build', 'node_modules', '.venv']

    def set_context(self, context_map):
        self.context_data = context_map

    def find_patterns(self, extensions, patterns):
        """
        Busca inteligente: Diferencia código vivo de strings/exemplos.
        """
        issues = []
        if not self.project_root: return []

        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith(extensions):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    
                    # Se for Python, usamos análise AST para evitar falsos positivos
                    if file.endswith('.py'):
                        issues.extend(self._audit_python_ast(rel_path, patterns))
                    else:
                        # Para outras extensões, mantemos o regex padrão
                        content = self.read_project_file(rel_path)
                        if not content: continue
                        for p in patterns:
                            if re.search(p['regex'], content, re.MULTILINE | re.IGNORECASE):
                                issues.append({
                                    'file': rel_path, 'issue': p['issue'],
                                    'severity': p.get('severity', 'medium'), 'context': self.name
                                })
        return issues

    def _audit_python_ast(self, rel_path, patterns):
        """Analisa o Python estruturalmente para encontrar erros REAIS."""
        issues = []
        abs_path = os.path.join(self.project_root, rel_path)
        try:
            with open(abs_path, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            
            for node in ast.walk(tree):
                # 1. Busca por DEBUG = True (Apenas se for atribuição real)
                if isinstance(node, ast.Assign):
                    for target in node.targets:
                        if isinstance(target, ast.Name) and target.id == 'DEBUG':
                            if isinstance(node.value, ast.Constant) and node.value.value is True:
                                issues.append({
                                    'file': rel_path, 'issue': 'DEBUG=True detectado como configuração ativa.',
                                    'severity': 'medium', 'context': self.name
                                })

                # 2. Busca por print() (Apenas se for chamada de função real)
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name) and node.func.id == 'print':
                        issues.append({
                            'file': rel_path, 'issue': 'Uso de print() detectado em código de execução.',
                            'severity': 'low', 'context': self.name
                        })

            return issues
        except: return []

    def analyze_logic(self, file_path):
        """Diagnóstico de 'cada letra' via AST."""
        issues = []
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                tree = ast.parse(f.read())
            
            for node in ast.walk(tree):
                # Detecta logicamente o 'pass' silencioso
                if isinstance(node, ast.ExceptHandler):
                    if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                        issues.append({
                            'file': os.path.relpath(file_path, self.project_root),
                            'issue': 'Captura de erro silenciosa (pass).',
                            'severity': 'high', 'context': self.name
                        })
            return issues
        except SyntaxError as e:
            return [{'file': os.path.relpath(file_path, self.project_root), 
                     'issue': f"Erro de sintaxe: {e.msg} na linha {e.lineno}", 'severity': 'critical'}]
        except: return []

    def apply_auto_fix(self, file_path, issue_desc):
        """Auto-Cura com validação de sintaxe pré-salvamento."""
        content = self.read_project_file(os.path.relpath(file_path, self.project_root))
        if not content: return False

        new_content = content
        fixed = False

        if "pass" in issue_desc:
            new_content = re.sub(r"except:\s*pass|except\s+Exception:\s*pass", 
                                 "except Exception as e:\n            logger.error(f'Erro: {e}')", content)
            fixed = True
        elif "DEBUG" in issue_desc:
            new_content = re.sub(r"DEBUG\s*=\s*True", "DEBUG = os.getenv('DEBUG', 'False') == 'True'", content)
            fixed = True
        elif "print()" in issue_desc:
            new_content = re.sub(r"print\((.*?)\)", r"logger.info(\1)", content)
            fixed = True

        if fixed and new_content != content:
            try:
                # Validação de Sanidade: Só salva se o novo código for válido
                ast.parse(new_content)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
            except:
                logger.error(f"Cura abortada: a correção geraria erro de sintaxe em {file_path}")
        return False

    def read_project_file(self, rel_path):
        abs_path = os.path.join(self.project_root, rel_path)
        try:
            with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except: return None

    @abstractmethod
    def perform_audit(self) -> list: pass

    @abstractmethod
    def get_system_prompt(self) -> str: pass