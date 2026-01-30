import os
import importlib.util
import logging
import sys

# Adiciona o diretório raiz ao path para permitir imports de src
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.append(root_path)

from src.utils.logging_config import setup_logging
from src.core.orchestrator import ProjectOrchestrator

# Inicializa logging
setup_logging()
logger = logging.getLogger(__name__)

def run_self_healing():
    """Executa o ciclo de auto-diagnóstico e gera o pacote de missão se necessário."""
    project_root = os.getcwd()
    orchestrator = ProjectOrchestrator(project_root)
    
    # Carrega os especialistas Python
    python_path = os.path.join(project_root, "src", "agents", "Python")
    if not os.path.exists(python_path):
        logger.error(f"Diretório Python não encontrado em {python_path}")
        return

    logger.info("🐍 Mobilizando especialistas Python (Modular) para auto-diagnóstico...")
    
    for filename in os.listdir(python_path):
        if filename.endswith(".py") and "__init__" not in filename:
            f_path = os.path.join(python_path, filename)
            try:
                module_name = filename.replace(".py", "")
                spec = importlib.util.spec_from_file_location(module_name, f_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                for attr in dir(module):
                    if attr.endswith("Persona") and attr not in ["BaseActivePersona", "BasePersona"]:
                        persona_class = getattr(module, attr)
                        orchestrator.add_agent(persona_class(project_root))
            except Exception as e:
                logger.error(f"Erro ao carregar persona de {filename}: {e}")

    # Executa o diagnóstico
    issues = orchestrator.run_diagnostic()
    mission = orchestrator.get_mission_report()
    
    print("\n" + "="*60)
    print(f"📊 RELATÓRIO DE AUTO-DIAGNÓSTICO: {len(issues)} OCORRÊNCIAS")
    print(f"🏥 Health Score Final: {orchestrator.metrics['health_score']}%")
    print("="*60)
    
    if not issues:
        print("✅ O projeto está íntegro e segue todos os padrões!")
    else:
        # Mostra apenas as top 10 para o log não ficar gigante
        for i, issue in enumerate(issues[:15]):
            severity = issue.get('severity', 'MEDIUM').upper()
            file = issue.get('file', 'Global')
            print(f"{i+1}. [{severity}] {file} -> {issue.get('issue', 'N/A')}")
        
        if len(issues) > 15:
            print(f"... e mais {len(issues) - 15} ocorrências.")

    # Salva a missão
    if mission:
        try:
            output_path = "auto_healing_mission.md"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(mission)
            logger.info(f"🚀 Missão de Auto-Cura gerada em '{output_path}'.")
        except Exception as e:
            logger.error(f"Erro ao salvar arquivo de missão: {e}")

if __name__ == "__main__":
    run_self_healing()
