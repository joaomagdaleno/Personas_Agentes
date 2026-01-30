import os
import json
import sys
import logging
from datetime import datetime

class ConnectionCLI:
    """Representa um especialista em engenharia de software."""
    def __init__(self):
        """Executa funcionalidade da persona."""
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(self.base_dir)
        self.registry_path = os.path.join(self.base_dir, "agents_registry.json")
        self.registry = self._load_registry()
        self.stack = self._detect_stack()

    def _load_registry(self):
        """Executa funcionalidade da persona."""
        if not os.path.exists(self.registry_path):
            return None
        with open(self.registry_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _detect_stack(self) -> str:
        if os.path.exists(os.path.join(self.project_root, "pubspec.yaml")): return "Flutter"
        if os.path.exists(os.path.join(self.project_root, "build.gradle.kts")): return "Kotlin"
        return "Unknown"

    def decide_agent(self, goal: str) -> str:
        goal_lower = goal.lower()
        mapping = {
            "Bolt": ["performance", "lento", "fast", "fps", "speed"],
            "Sentinel": ["segurança", "auth", "security", "login", "crypt"],
            "Cache": ["banco", "cache", "database", "offline", "storage"],
            "Nexus": ["api", "network", "connect", "http"],
            "Palette": ["ui", "ux", "design", "cor", "acessibilidade"],
            "Probe": ["bug", "erro", "crash", "diagnostico", "fix"],
            "Warden": ["legal", "gdpr", "lgpd", "compliance"],
            "Nebula": ["cloud", "serverless", "firebase", "supabase"]
        }
        for agent, keywords in mapping.items():
            if any(kw in goal_lower for kw in keywords):
                return agent
        return "Director"

    def get_prompt(self, goal: str):
        """Executa funcionalidade da persona."""
        if not self.registry:
            return "ERROR: Registry not found. Run compiler.py"
        
        agent_name = self.decide_agent(goal)
        agent_content = self.registry.get(self.stack, {}).get(agent_name)
        
        # Fallback para o Diretor se o agente específico não existir na stack
        if not agent_content or agent_name == "Director":
            agent_content = self.registry.get("Director", "Orchestrate the task.")
            mode = "MASTER ORCHESTRATOR"
        else:
            mode = f"AGENT: {agent_name}"

        return f"""
[SYSTEM: CONNECTION CLI V3]
[MODE: {mode}] [STACK: {self.stack}] [TIME: {datetime.now().isoformat()}]

{agent_content}

GOAL: {goal}

CORE PROTOCOLS:
1. AUDIT: Use 'ls -R' or 'tree' to map the project.
2. SKILLS: Use 'activate_skill' if needed.
3. PROACTIVE: Implement fixes immediately using 'write_file' or 'replace'.
4. VALIDATE: Run build/lint after changes.

BEGIN.
"""

if __name__ == "__main__":
    cli = ConnectionCLI()
    if len(sys.argv) > 1:
        print(cli.get_prompt(" ".join(sys.argv[1:])))
