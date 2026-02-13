"""
🚀 Launcher do Dashboard Nativo Soberano.
-----------------------------------------
Ponto de entrada único para a interface gráfica consolidada (NativeGUI).
Inicializa o Orquestrador, carrega as Personas e exibe a central de comando.

Uso:
    python scripts/launch_dashboard.py
"""
import os
import sys
import logging
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from src_local.core.orchestrator import Orchestrator
from src_local.interface.gui_native import NativeGUI
from src_local.utils.logging_config import setup_logging

def main():
    """
    🎬 Inicializa a aplicação NativeGUI.
    Configura logging, orquestrador e loop principal da UI.
    """
    setup_logging()
    logger = logging.getLogger("SystemMonitor")
    logger.info("🎬 Iniciando Dashboard Nativo Soberano...")
    
    orc = Orchestrator(str(project_root))
    
    # Injeta personas básicas para o dashboard inicial
    from src_local.utils.persona_loader import PersonaLoader
    PersonaLoader().load_personas(orc)
    
    app = NativeGUI(orc)
    app.mainloop()

if __name__ == "__main__":
    main()
