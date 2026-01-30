import os
import importlib.util
import logging
from logging_config import setup_logging
from orchestrator import ProjectOrchestrator

# Inicializa logging
setup_logging()
logger = logging.getLogger(__name__)

def run_self_healing():
    """Executa o ciclo de auto-diagnóstico e gera o pacote de missão se necessário."""
    project_root = os.getcwd()
    orchestrator = ProjectOrchestrator(project_root)
    
    # Carrega os especialistas Python
    python_path = os.path.join(project_root, "Python")
    if not os.path.exists(python_path):
        logger.error(f"Diretório Python não encontrado em {python_path}")
        return

    logger.info("🐍 Mobilizando especialistas Python para auto-diagnóstico...")
    
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
                logger.error(f"Erro ao carregar persona de {filename}: {e}")

    # Executa o diagnóstico
    issues = orchestrator.run_full_diagnostic()
    
    print("\n" + "="*60)
    print(f"📊 RELATÓRIO DE AUTO-DIAGNÓSTICO: {len(issues)} OCORRÊNCIAS")
    print("="*60)
    
    if not issues:
        print("✅ O projeto está íntegro e segue todos os padrões!")
    else:
        for i, issue in enumerate(issues):
            severity = issue.get('severity', 'MEDIUM').upper()
            file = issue.get('file', 'Global')
            print(f"{i+1}. [{severity}] {file}")
            print(f"   Problema: {issue.get('issue', 'N/A')}")
            print(f"   Contexto: {issue.get('context', 'N/A')}")
            print("-" * 40)

    # Prepara a missão para o Gemini CLI se houver erros
    if issues:
        mission = orchestrator.prepare_mission_package()
        if mission:
            try:
                # Usando .md para melhor visualização
                output_path = "auto_healing_mission.md"
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(mission)
                logger.info(f"🚀 Missão de Auto-Cura gerada em '{output_path}'.")
            except Exception as e:
                logger.error(f"Erro ao salvar arquivo de missão: {e}")

if __name__ == "__main__":
    run_self_healing()
