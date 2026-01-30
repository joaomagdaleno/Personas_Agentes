import os
import json
import importlib.util
import sys
import logging
from logging_config import setup_logging

# Configura o logging centralizado
setup_logging()
logger = logging.getLogger(__name__)

class RegistryCompiler:
    """Motor de compilação de registro de agentes. 
    Serve de modelo para registrar especialistas de qualquer stack.
    """
    
    def __init__(self):
        """Inicializa os caminhos base e a estrutura do dicionário de registro."""
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.agents_root = os.path.join(self.base_path, "agents")
        self.registry_path = os.path.join(self.base_path, "agents_registry.json")
        self.registry = {"Flutter": {}, "Kotlin": {}, "Director": ""}

    def compile(self):
        """Executa o ciclo completo de compilação do registro."""
        logger.info("🛠️ Iniciando compilação do registro mestre de agentes...")
        
        # 1. Carrega o Diretor (Obrigatório)
        try:
            from src.agents.director import DirectorPersona
            director = DirectorPersona(".")
            self.registry["Director"] = director.get_system_prompt()
            logger.debug("Diretor mestre registrado.")
        except Exception as e:
            logger.critical(f"Falha ao carregar Diretor: {e}")
            self.registry["Director"] = "You are the Director. Orchestrate the tasks."

        # 2. Varre as stacks suportadas
        total_agents = 0
        for stack in ["Flutter", "Kotlin"]:
            stack_dir = os.path.join(self.agents_root, stack)
            if not os.path.exists(stack_dir):
                logger.warning(f"Stack {stack} não encontrada no diretório {stack_dir}")
                continue
            
            logger.info(f"Processando stack: {stack}...")
            for filename in os.listdir(stack_dir):
                if filename.endswith(".py") and "__init__" not in filename:
                    f_path = os.path.join(stack_dir, filename)
                    persona = self.load_persona_from_file(f_path)
                    if persona:
                        self.registry[stack][persona.name] = persona.get_system_prompt()
                        total_agents += 1
                        logger.debug(f"Agente [{stack}] {persona.name} registrado.")

        # 3. Persistência
        try:
            with open(self.registry_path, 'w', encoding='utf-8') as f:
                json.dump(self.registry, f, indent=4, ensure_ascii=False)
            logger.info(f"✅ Registro finalizado: {total_agents} especialistas em {self.registry_path}")
        except Exception as e:
            logger.error(f"Erro ao salvar registro: {e}")

if __name__ == "__main__":
    compiler = RegistryCompiler()
    compiler.compile()
