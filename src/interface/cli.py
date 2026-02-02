"""
SISTEMA DE PERSONAS AGENTES - INTERFACE CLI
Módulo: Ponto de Entrada de Comando (CLI)
Função: Fornecer acesso de terminal às capacidades PhD de auditoria e cura.
Soberania: INTERFACE-CLI.
"""
import sys
import logging
from pathlib import Path
from src.core.orchestrator import Orchestrator
from src.utils.logging_config import configure_logging

configure_logging()
logger = logging.getLogger(__name__)

def main():
    """
    🏗️ Interface CLI PhD: Orquestração via Terminal.
    
    Permite acionar diagnósticos absolutos e protocolos de cura atômica 
    diretamente via linha de comando.
    """
    project_root = Path.cwd()
    logger.info(f"🛰️ Workshop PhD acionado sobre: {project_root}")
    
    try:
        orchestrator = Orchestrator(project_root)
        
        if len(sys.argv) > 1:
            cmd = sys.argv[1].lower()
            if cmd == "audit":
                logger.info("🔍 Executando Auditoria Estratégica Soberana...")
                report_path = orchestrator.generate_full_diagnostic()
                logger.info(f"✅ Diagnóstico absoluto consolidado em: {report_path.name}")
            elif cmd == "heal":
                logger.info("✨ Iniciando Protocolo de Auto-Cura Sistêmica...")
                # Delegação de cura delegada ao orquestrador (em expansão)
                logger.warning("⚠️ Protocolo de Cura em ambiente de validação. Verifique auto_healing_mission.md.")
            else:
                logger.error(f"❌ Comando desconhecido: {cmd}")
                logger.info("Disponíveis: audit, heal")
        else:
            logger.info("🏛️ Workshop PhD CLI: Operacional")
            logger.info("Disponíveis: audit (Diagnóstico 360), heal (Cura Estratégica)")
            
    except Exception as e:
        logger.error(f"🚨 Falha fatal na interface CLI: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()