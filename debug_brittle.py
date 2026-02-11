"""
🛠️ Utilitário de Depuração de Fragilidades.
Este script executa um diagnóstico focado em arquivos marcados como 'brittle' (frágeis)
ou identificados como 'dark matter' (pontos cegos), fornecendo visibilidade total
sobre o status de cura no StabilityLedger.
"""
import sys
import logging
from pathlib import Path

# FBI MODE
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

from src_local.core.orchestrator import Orchestrator
from src_local.utils.logging_config import configure_logging

def main():
    """
    Função principal para execução do diagnóstico de depuração.
    Orquestra a análise de contexto, mobilização de personas e síntese de saúde 360.
    """
    import time
    start_time = time.time()
    configure_logging()
    orchestrator = Orchestrator(current_dir)
    
    # Discovery
    ctx = orchestrator.context_engine.analyze_project()
    
    # Reset and Mobilize
    from src_local.utils.persona_loader import PersonaLoader
    PersonaLoader.mobilize_all(orchestrator.project_root, orchestrator)
    
    findings = orchestrator.run_strategic_audit(ctx, include_history=False)
    findings.extend(orchestrator._run_obfuscation_scan())
    
    from src_local.core.diagnostic_pipeline import DiagnosticPipeline
    dp = DiagnosticPipeline(orchestrator)
    final_findings = dp._deduplicate(findings)
    
    internal_health = orchestrator.core_validator.verify_core_health(orchestrator.project_root)
    
    snapshot = orchestrator.get_system_health_360(ctx, internal_health, final_findings)
    
    print("\n" + "="*50)
    print("SISTEMA DE DIAGNÓSTICO DE DEPURAÇÃO")
    print("="*50)
    print(f"HEALTH SCORE: {snapshot['health_score']}")
    print(f"BRITTLE POINTS ({len(snapshot['brittle_points'])}):")
    for bp in snapshot['brittle_points']:
        print(f"  - {bp}")
        info = ctx["map"].get(bp, {})
        print(f"    - Type: {info.get('component_type')}")
        print(f"    - Brittle flag: {info.get('brittle')}")
        print(f"    - In Ledger: {bp in orchestrator.stability_ledger.ledger}")
        if bp in orchestrator.stability_ledger.ledger:
            print(f"    - Ledger Status: {orchestrator.stability_ledger.ledger[bp].get('status')}")
    
    print(f"BLIND SPOTS ({len(snapshot['dark_matter'])}):")
    for dm in snapshot['dark_matter']:
        print(f"  - {dm}")
        
    from src_local.utils.logging_config import log_performance
    log_performance(logging.getLogger(__name__), start_time, "Telemetry: Debug Brittle execution finished")

    print("="*50)

if __name__ == "__main__":
    main()
