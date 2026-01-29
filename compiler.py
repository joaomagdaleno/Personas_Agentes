import os
import json
import re

def compile_agents():
    base_path = os.path.dirname(os.path.abspath(__file__))
    registry_path = os.path.join(base_path, "agents_registry.json")
    registry = {"Flutter": {}, "Kotlin": {}, "Director": ""}
    
    # Check modification times
    last_compiled = os.path.getmtime(registry_path) if os.path.exists(registry_path) else 0
    needs_update = False

    # 1. Carrega o Diretor
    director_path = os.path.join(base_path, "Director - Project Orchestrator.txt")
    if os.path.exists(director_path):
        if os.path.getmtime(director_path) > last_compiled: needs_update = True
        with open(director_path, 'r', encoding='utf-8') as f:
            registry["Director"] = f.read()

    # 2. Carrega os especialistas
    for stack in ["Flutter", "Kotlin"]:
        stack_path = os.path.join(base_path, stack)
        if not os.path.exists(stack_path): continue
        
        for filename in os.listdir(stack_path):
            if filename.endswith(".txt") and "todos_agentes" not in filename:
                f_path = os.path.join(stack_path, filename)
                if os.path.getmtime(f_path) > last_compiled: needs_update = True
                with open(f_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    match = re.search(r'You are "(.*?)"', content)
                    key = match.group(1) if match else filename.split(' ')[0]
                    registry[stack][key] = content

    if needs_update or not os.path.exists(registry_path):
        with open(registry_path, 'w', encoding='utf-8') as f:
            json.dump(registry, f, indent=4, ensure_ascii=False)
        print(f"💎 Ferramenta Compilada! {len(registry['Flutter']) + len(registry['Kotlin'])} especialistas atualizados.")
    else:
        print("⚡ Registro já está atualizado.")

if __name__ == "__main__":
    compile_agents()
