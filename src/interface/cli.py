import os
import json
import sys
import logging
from datetime import datetime
from dotenv import load_dotenv
from logging_config import setup_logging

# Inicializa variáveis de ambiente e logging
load_dotenv()
setup_logging()
logger = logging.getLogger(__name__)

class ConnectionCLI:
    """Motor de orquestração modelo para conectar metas do usuário aos agentes.
    Serve como interface de comando para o ecossistema Personas Agentes.
    """
    
    def __init__(self):
        """Inicializa o motor e carrega as configurações."""
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(self.base_dir)
        self.registry_path = os.path.join(self.base_dir, "agents_registry.json")
        
        # Carregamento seguro de configurações de nuvem
        self.cloud_provider = os.getenv("CLOUD_PROVIDER", "None")
        self.api_key_status = "✅ Ativa" if os.getenv("PERSONAS_API_KEY") else "❌ Ausente"
        
        self.registry = self._load_registry()
        self.stack = self._detect_stack()

    def _load_registry(self):
        """Carrega o registro compilado com tratamento de erro."""
        if not os.path.exists(self.registry_path):
            logger.error(f"Registro não encontrado. Execute 'python compiler.py'.")
            return None
        try:
            with open(self.registry_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Falha ao processar agents_registry.json: {e}")
            return None

    def _detect_stack(self) -> str:
        """Detecta a tecnologia predominante usando assinaturas de arquivos."""
        signatures = {
            "Flutter": ["pubspec.yaml", "lib/main.dart"],
            "Kotlin": ["build.gradle.kts", "build.gradle", "src/main/kotlin"],
            "Python": ["requirements.txt", "pyproject.toml", "setup.py"]
        }
        for stack, files in signatures.items():
            if any(os.path.exists(os.path.join(self.project_root, f)) for f in files):
                return stack
        return "Universal"

    def decide_agent(self, goal: str) -> str:
        """Decide o agente especialista via mapeamento de intenção."""
        goal_lower = goal.lower()
        intent_map = {
            "Bolt": ["performance", "lento", "fast", "fps", "speed", "otimizar"],
            "Sentinel": ["segurança", "auth", "security", "login", "crypt", "vazamento"],
            "Cache": ["banco", "cache", "database", "offline", "storage", "sql"],
            "Nexus": ["api", "network", "connect", "http", "rest", "endpoint"],
            "Palette": ["ui", "ux", "design", "cor", "acessibilidade", "tela"],
            "Probe": ["bug", "erro", "crash", "diagnostico", "fix", "ajuste"],
            "Warden": ["legal", "gdpr", "lgpd", "compliance", "licença"],
            "Nebula": ["cloud", "serverless", "firebase", "supabase", "nuvem"]
        }
        for agent, keywords in intent_map.items():
            if any(kw in goal_lower for kw in keywords):
                return agent
        return "Director"

    def print_banner(self, mode, timestamp):
        """Imprime um banner visualmente rico no terminal."""
        logger.info("\033[94m" + "=" * 60 + "\033[0m")
        logger.info(f"\033[92m🏛️  PERSONAS AGENTES - CLI V3\033[0m")
        logger.info(f"Mode:  {mode}")
        logger.info(f"Stack: {self.stack}")
        logger.info(f"Time:  {timestamp}")
        logger.info(f"Cloud: {self.cloud_provider} | API: {self.api_key_status}")
        logger.info("\033[94m" + "=" * 60 + "\033[0m")

    def get_prompt(self, goal: str):
        """Gera o prompt final otimizado para o LLM."""
        if not self.registry:
            return "ERROR: Registry not found."
        
        agent_name = self.decide_agent(goal)
        agent_content = self.registry.get(self.stack, {}).get(agent_name)
        
        if not agent_content or agent_name == "Director":
            agent_content = self.registry.get("Director", "Orchestrate technical tasks.")
            mode = "MASTER ORCHESTRATOR"
        else:
            mode = f"SPECIALIST AGENT: {agent_name}"

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.print_banner(mode, timestamp)
        
        return f"""
[SYSTEM CONTEXT]
AGENT_ROLE: {agent_name}
PROJECT_STACK: {self.stack}
PROJECT_ROOT: {self.project_root}

[MISSION]
{agent_content}

[USER_GOAL]
{goal}

[EXECUTION PROTOCOLS]
1. AUDIT: Deep-scan the project structure.
2. ANALYZE: Use tools to read and understand code patterns.
3. ACT: Implement permanent fixes via 'write_file' or 'replace'.
4. VERIFY: Always run build/tests after modifications.

PROCEED WITH ACTION.
"""

if __name__ == "__main__":
    engine = ConnectionCLI()
    if len(sys.argv) > 1:
        prompt = engine.get_prompt(" ".join(sys.argv[1:]))
        logger.info(prompt)
    else:
        logger.info("Uso: python engine.py 'sua meta técnica'")
