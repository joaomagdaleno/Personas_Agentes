import sys
import os
import tkinter as tk

# Adiciona o diretório raiz ao path para permitir imports do pacote src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importa a GUI. Note que src.interface.gui precisa ter os imports corrigidos para funcionar.
# Se falhar, é porque os arquivos internos precisam ser atualizados.
try:
    from src.interface.gui import OficinaApp
except ImportError as e:
    logger.info(f"Erro de importação: {e}")
    logger.info("Verifique se as correções nos arquivos internos foram aplicadas.")
    sys.exit(1)

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app = OficinaApp(root)
        root.mainloop()
    except Exception as e:
        logger.info(f"Falha fatal na aplicação: {e}")
