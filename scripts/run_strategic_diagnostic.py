import os
import importlib.util
import logging
from logging_config import setup_logging
from orchestrator import ProjectOrchestrator

# Inicializa logging
setup_logging()
logger = logging.getLogger(__name__)

def run_strategic_self_diagnostic():
    """Executa um diagnóstico estratégico completo focado no estágio do projeto."""
    project_root = os.getcwd()
    orchestrator = ProjectOrchestrator(project_root)
    
    # Identifica o estágio antes de carregar
    stage = orchestrator.detect_project_stage()
    logger.info(f"📊 ESTÁGIO ATUAL DO PROJETO: {stage}")
    
    # Carrega os especialistas Python
    python_path = os.path.join(project_root, "Python")
    if not os.path.exists(python_path):
        logger.error(f"Pasta Python não encontrada em {python_path}")
        return

    logger.info("🐍 Mobilizando exército de especialistas para análise estratégica...")
    
    for filename in os.listdir(python_path):
        if filename.endswith(".py") and "__init__" not in filename:
            f_path = os.path.join(python_path, filename)
            try:
                module_name = filename.replace(".py", "")
                spec = importlib.util.spec_from_file_location(module_name, f_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                for attr in dir(module):
                    if attr.endswith("Persona") and attr != "BaseActivePersona":
                        persona_class = getattr(module, attr)
                        orchestrator.add_persona(persona_class(project_root))
            except Exception as e:
                logger.error(f"Erro ao carregar especialista de {filename}: {e}")

    # Executa o diagnóstico estratégico
    logger.info("🔍 Iniciando varredura estratégica profunda...")
    issues = orchestrator.run_full_diagnostic()
    
    print("\n" + "="*60)
    print(f"📋 RELATÓRIO ESTRATÉGICO: {len(issues)} OCORRÊNCIAS")
    print("="*60)
    
    if not issues:
        print("✅ O sistema avalia que o projeto está em excelente estado para seu estágio.")
    else:
        # Agrupa por gravidade para o relatório
        for severity in ['high', 'medium', 'low']:
            level_issues = [i for i in issues if i.get('severity') == severity]
            if level_issues:
                print(f"\n[{severity.upper()} PRIORITY]")
                for issue in level_issues:
                    print(f"  • {issue.get('file', 'Global')}: {issue.get('issue', 'Problema não especificado')}")

    mission = orchestrator.prepare_mission_package()
    if mission:
        try:
            output_path = "strategic_mission.md"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(mission)
            logger.info(f"🚀 Diretriz de evolução gerada em '{output_path}'.")
        except Exception as e:
            logger.error(f"Erro ao salvar diretriz estratégica: {e}")

if __name__ == "__main__":
    run_strategic_self_diagnostic()
