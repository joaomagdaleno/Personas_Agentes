"""
🛡️ Instalador de Hooks Soberano.
Configura o Git para validar a integridade do código antes de cada commit.
"""
import os
import sys
from pathlib import Path

def install_pre_commit():
    project_root = Path(__file__).parent.parent
    hook_dir = project_root / ".git" / "hooks"
    hook_path = hook_dir / "pre-commit"
    
    if not (project_root / ".git").exists():
        print("Erro: Repositorio Git nao detectado.")
        return

    # Conteúdo simples e robusto para Windows/Linux
    hook_content = "#!/bin/sh\necho 'Validando integridade...'\npython scripts/fast_diagnostic.py\nif [ $? -ne 0 ]; then\n    echo 'Diagnostico falhou. Commit abortado.'\n    exit 1\nfi\n"
    
    if not hook_dir.exists():
        hook_dir.mkdir(parents=True)
        
    with open(hook_path, "w", encoding="utf-8") as f:
        f.write(hook_content)
        
    print(f"Instalado em: {hook_path}")

if __name__ == "__main__":
    install_pre_commit()
