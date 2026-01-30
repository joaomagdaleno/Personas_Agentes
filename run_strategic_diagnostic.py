import os
import importlib.util
from orchestrator import ProjectOrchestrator

def run_strategic_self_diagnostic():
    project_root = os.getcwd()
    orchestrator = ProjectOrchestrator(project_root)
    
    # Identifica o estágio antes de carregar
    stage = orchestrator.detect_project_stage()
    print(f"🏛️ DIRETOR: Identificando estágio do projeto...")
    print(f"📊 ESTÁGIO ATUAL: {stage}")
    print(f"🐍 Carregando exército de 26 especialistas Python...")
    
    # Carrega os especialistas Python
    python_path = os.path.join(project_root, "Python")
    for filename in os.listdir(python_path):
        if filename.endswith(".py"):
            f_path = os.path.join(python_path, filename)
            module_name = filename.replace(".py", "")
            spec = importlib.util.spec_from_file_location(module_name, f_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            for attr in dir(module):
                if attr.endswith("Persona") and attr != "BaseActivePersona":
                    persona_class = getattr(module, attr)
                    orchestrator.add_persona(persona_class(project_root))

    # Executa o diagnóstico estratégico
    print(f"🔍 Iniciando varredura estratégica...")
    issues = orchestrator.run_full_diagnostic()
    
    print("\n" + "="*60)
    print(f"📋 RELATÓRIO ESTRATÉGICO: {len(issues)} PONTOS ENCONTRADOS")
    print("="*60)
    
    if not issues:
        print("✅ O sistema avalia que o projeto está em excelente estado para seu estágio.")
    else:
        # Agrupa por gravidade para o relatório
        for severity in ['high', 'medium', 'low']:
            level_issues = [i for i in issues if i['severity'] == severity]
            if level_issues:
                print(f"\n[{severity.upper()} PRIORITY]")
                for issue in level_issues:
                    print(f"  • {issue['file']}: {issue['issue']}")

    mission = orchestrator.prepare_mission_package()
    with open("strategic_mission.txt", "w", encoding="utf-8") as f:
        f.write(mission)
    print(f"\n🚀 Diretriz de evolução gerada em 'strategic_mission.txt'.")

if __name__ == "__main__":
    run_strategic_self_diagnostic()
