import os
import importlib.util
from orchestrator import ProjectOrchestrator

def run_self_healing():
    """Executa funcionalidade da persona."""
    project_root = os.getcwd()
    orchestrator = ProjectOrchestrator(project_root)
    
    # Carrega os especialistas Python
    python_path = os.path.join(project_root, "Python")
    print(f"🐍 Carregando exército Python para auto-diagnóstico...")
    
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

    # Executa o diagnóstico
    issues = orchestrator.run_full_diagnostic()
    
    print("\n" + "="*50)
    print(f"📊 RELATÓRIO DE AUTO-DIAGNÓSTICO: {len(issues)} OCORRÊNCIAS")
    print("="*50)
    
    if not issues:
        print("✅ O projeto está íntegro e segue todos os padrões!")
    else:
        for i, issue in enumerate(issues):
            print(f"{i+1}. [{issue['severity'].upper()}] {issue['file']}")
            print(f"   Problema: {issue['issue']}")
            print(f"   Contexto: {issue['context']}")
            print("-" * 30)

    # Prepara a missão para o Gemini CLI se houver erros
    if issues:
        mission = orchestrator.prepare_mission_package()
        with open("auto_healing_mission.txt", "w", encoding="utf-8") as f:
            f.write(mission)
        print(f"\n🚀 Missão de Auto-Cura gerada em 'auto_healing_mission.txt'.")

if __name__ == "__main__":
    run_self_healing()
