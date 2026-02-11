"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Classificador de Componentes (ComponentClassifier)
Função: Identificar semanticamente o papel de um arquivo no projeto.
"""
import logging

logger = logging.getLogger(__name__)

class ComponentClassifier:
    """Assistente Técnico: Especialista em Topologia de Arquivos 🗂️"""

    def map_type(self, rel_path: str) -> str:
        """Mapeamento semântico universal."""
        logger.debug(f"Classifying component: {rel_path}")
        p = rel_path.lower()
        if p.endswith("__init__.py"): return "PACKAGE_MARKER"
        if "test" in p: return "TEST"
        if any(x in p for x in ["audit", "forensics", "report", "diagnostic", "restore", "temp", "debug", "fix_"]): return "DOC"
        if any(x in p for x in ["settings", "config", "manifest", ".json", ".yaml", ".yml"]): return "CONFIG"
        if "core" in p or "domain" in p: return "CORE"
        if "agent/" in p or p.startswith("agent_") or (p.endswith(".py") and "agent" in p and "personas" not in p): return "AGENT"
        if "util" in p or "helper" in p: return "UTIL"
        if any(x in p for x in ["ui", "screen", "layout", "gui", "view"]): return "INTERFACE"
        if "data" in p or "repository" in p: return "DATA"
        return "LOGIC"
