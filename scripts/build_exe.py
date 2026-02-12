import subprocess
import sys
from pathlib import Path

def build():
    project_root = Path(__file__).parent.parent
    main_script = project_root / "scripts" / "launch_dashboard.py"
    
    print(f"🚀 Iniciando empacotamento PhD para: {main_script}")
    
    # Comando PyInstaller
    # --onefile: um único executável
    # --windowed: sem console terminal
    # --icon: (opcional se houver um .ico)
    # --add-data: incluir assets do customtkinter
    
    import customtkinter
    ctk_path = Path(customtkinter.__file__).parent
    
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--onefile",
        "--windowed",
        f"--add-data={ctk_path};customtkinter/",
        "--name=PersonaAgent_PhD",
        str(main_script)
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("✅ Empacotamento concluído com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Falha no empacotamento: {e}")
    except FileNotFoundError:
        print("❌ PyInstaller não encontrado. Instale com: pip install pyinstaller")

if __name__ == "__main__":
    build()
