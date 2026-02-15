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
        
        # Rigor PhD: Redução de complexidade via despacho de regras.
        if p.endswith("__init__.py"): return "PACKAGE_MARKER"
        if "test" in p: return "TEST"
        
        rules = [
            (self._is_doc, "DOC"),
            (self._is_config, "CONFIG"),
            (self._is_core, "CORE"),
            (self._is_agent, "AGENT"),
            (self._is_util, "UTIL"),
            (self._is_interface, "INTERFACE"),
            (self._is_data, "DATA")
        ]
        
        for condition, result in rules:
            if condition(p): return result
        return "LOGIC"

    def _is_doc(self, p): return any(x in p for x in ["audit", "forensics", "report", "diagnostic", "restore", "temp", "debug", "fix_"])
    def _is_config(self, p): return any(x in p for x in ["settings", "config", "manifest", ".json", ".yaml", ".yml"])
    def _is_core(self, p): return "core" in p or "domain" in p
    def _is_agent(self, p): return "agent/" in p or p.startswith("agent_") or (p.endswith(".py") and "agent" in p and "personas" not in p)
    def _is_util(self, p): return "util" in p or "helper" in p
    def _is_interface(self, p): return any(x in p for x in ["ui", "screen", "layout", "gui", "view"])
    def _is_data(self, p): return "data" in p or "repository" in p
