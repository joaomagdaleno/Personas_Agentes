import os
import subprocess
import sys
import re
import json

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(msg, type="INFO"):
    if type == "INFO": logger.info(f"{Colors.OKBLUE}[INFO] {msg}{Colors.ENDC}")
    elif type == "SUCCESS": logger.info(f"{Colors.OKGREEN}[SUCCESS] {msg}{Colors.ENDC}")
    elif type == "WARN": logger.info(f"{Colors.WARNING}[WARN] {msg}{Colors.ENDC}")
    elif type == "ERROR": logger.info(f"{Colors.FAIL}[ERROR] {msg}{Colors.ENDC}")

def run_git(command, cwd=None):
    try:
        result = subprocess.run(command, cwd=cwd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except Exception as e:
        return "", str(e), 1

def resolve_conflict_smart(file_path):
    """Tenta resolver conflitos priorizando o local para skills e upstream para core."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if "<<<<<<<" not in content:
            return True

        filename = os.path.basename(file_path)
        # Regex para capturar os blocos de conflito do Git
        conflict_pattern = r"<<<<<<<?.*\n(.*?)\n=======\n(.*?)\n>>>>>>>.*\n"
        
        # Estratégia para JSONs de índice: Aceita o Upstream (segundo grupo \2)
        if filename.endswith('.json'):
            log(f"Resolvendo conflito em JSON: {filename} (Priorizando Upstream)", "WARN")
            new_content = re.sub(conflict_pattern, r"\2", content, flags=re.DOTALL)
        
        # Estratégia para Skills: Prioriza LOCAL (primeiro grupo \1)
        # Se estiver em uma pasta 'skills' ou for um arquivo de texto/markdown com nome de skill
        is_skill = "skills" in file_path.lower() or filename.endswith(('.md', '.txt'))
        
        if is_skill and not filename.endswith('.json'):
            log(f"Resolvendo conflito em SKILL: {filename} (Priorizando LOCAL)", "SUCCESS")
            new_content = re.sub(conflict_pattern, r"\1", content, flags=re.DOTALL)
        
        else:
            log(f"Conflito em arquivo de sistema: {filename}. Mantendo Upstream.", "WARN")
            new_content = re.sub(conflict_pattern, r"\2", content, flags=re.DOTALL)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        # Marca como resolvido no Git
        run_git(f"git add \"{file_path}\"", cwd=os.path.dirname(file_path))
        return True
    except Exception as e:
        log(f"Falha ao resolver automaticamente {file_path}: {e}", "ERROR")
        return False

def update_repo(repo_path):
    log(f"--- Processando: {os.path.relpath(repo_path)} ---", "HEADER")
    
    stdout, _, _ = run_git("git remote", cwd=repo_path)
    remotes = stdout.split('\n')
    remote = "upstream" if "upstream" in remotes else "origin"

    # 1. Stash
    status, _, _ = run_git("git status --porcelain", cwd=repo_path)
    stashed = False
    if status:
        log("Skills locais detectadas. Fazendo stash...", "WARN")
        run_git("git stash push -m 'Auto-save'", cwd=repo_path)
        stashed = True

    # 2. Update
    log(f"Buscando atualizações de {remote}...")
    run_git(f"git fetch {remote}", cwd=repo_path)
    
    # Descobre branch principal
    branch_info, _, _ = run_git(f"git remote show {remote}", cwd=repo_path)
    main_branch = "main"
    for line in branch_info.split('\n'):
        if "HEAD branch" in line:
            main_branch = line.split(":")[1].strip()
            break
    
    log(f"Resetando para {remote}/{main_branch}...")
    run_git(f"git reset --hard {remote}/{main_branch}", cwd=repo_path)

    # 3. Restore and Resolve
    if stashed:
        log("Restaurando modificações locais...")
        _, stderr, code = run_git("git stash pop", cwd=repo_path)
        
        if code != 0:
            log("Conflitos detectados! Iniciando auto-resolução...", "WARN")
            for root, _, files in os.walk(repo_path):
                for f in files:
                    fpath = os.path.join(root, f)
                    if any(x in fpath for x in [".git", "node_modules", "__pycache__"]): continue
                    
                    try:
                        with open(fpath, 'r', encoding='utf-8', errors='ignore') as check_f:
                            if "<<<<<<<" in check_f.read():
                                resolve_conflict_smart(fpath)
                    except Exception as e:
                        log(f"Erro ao ler arquivo para conflitos: {e}", "ERROR")
            log("Auto-resolução concluída.", "SUCCESS")
        
        # 4. Re-indexação
        scripts_path = os.path.join(repo_path, "scripts")
        if os.path.exists(scripts_path):
            log("Regenerando índices...", "INFO")
            run_git("python generate_index.py", cwd=scripts_path)

def main():
    root_dir = os.getcwd()
    repos = []
    for root, dirs, _ in os.walk(root_dir):
        if '.git' in dirs and os.path.abspath(root) != os.path.abspath(root_dir):
            repos.append(os.path.abspath(root))
            dirs.remove('.git')
    
    for repo in repos:
        update_repo(repo)
    log("Tudo pronto!", "SUCCESS")

if __name__ == "__main__":
    main()