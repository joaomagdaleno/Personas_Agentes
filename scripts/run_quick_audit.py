import os
import sys
import logging

# Garante que o diretório raiz está no path
sys.path.append(os.getcwd())

from src.core.orchestrator import ProjectOrchestrator
from src.agents.Python.hermes import HermesPersona
from src.agents.Python.probe import ProbePersona

def run_audit():
    logger.info("🏛️  INICIANDO AUDITORIA TÉCNICA (PERSONAS AGENTES)\n")
    
    orch = ProjectOrchestrator(os.getcwd())
    orch.add_agent(HermesPersona(os.getcwd()))
    orch.add_agent(ProbePersona(os.getcwd()))
    
    issues = orch.run_diagnostic()
    
    logger.info("\n--- RELATÓRIO DO DIRETOR ---")
    logger.info(f"Health Score: {orch.metrics['health_score']}%")
    logger.info(f"Problemas Detectados: {len(issues)}")
    logger.info("-" * 30)
    
    for i in issues:
        status = "🛡️ PROTEGIDO" if i.get('is_protected') else "🛠️ REPARÁVEL"
        logger.info(f"[{i['severity'].upper()}] {status} em {i['file']}: {i['issue']}")

if __name__ == "__main__":
    run_audit()