import os
import json
import importlib.util
import sys

def load_persona_from_file(file_path):
    """Carrega dinamicamente a classe de persona de um arquivo .py"""
    module_name = os.path.basename(file_path).replace(".py", "")
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    # Procura por classes que terminam com 'Persona'
    for attr in dir(module):
        if attr.endswith("Persona") and attr != "BasePersona":
            persona_class = getattr(module, attr)
            return persona_class()
    return None

def compile_agents():
    """Executa funcionalidade da persona."""
    base_path = os.path.dirname(os.path.abspath(__file__))
    registry_path = os.path.join(base_path, "agents_registry.json")
    registry = {"Flutter": {}, "Kotlin": {}, "Director": ""}
    
    # 1. Carrega o Diretor
    from director_persona import DirectorPersona
    director = DirectorPersona()
    registry["Director"] = director.get_system_prompt()

    # 2. Carrega os especialistas das pastas
    for stack in ["Flutter", "Kotlin"]:
        stack_path = os.path.join(base_path, stack)
        if not os.path.exists(stack_path): continue
        
        for filename in os.listdir(stack_path):
            if filename.endswith(".py") and "__init__" not in filename:
                f_path = os.path.join(stack_path, filename)
                try:
                    persona = load_persona_from_file(f_path)
                    if persona:
                        registry[stack][persona.name] = persona.get_system_prompt()
                except Exception as e:
                    print(f"Erro ao carregar {filename}: {e}")

    with open(registry_path, 'w', encoding='utf-8') as f:
        json.dump(registry, f, indent=4, ensure_ascii=False)
    
    print(f"💎 Ferramenta Compilada! {len(registry['Flutter']) + len(registry['Kotlin'])} especialistas em Python registrados.")

if __name__ == "__main__":
    compile_agents()

if __name__ == "__main__":
    compile_agents()
