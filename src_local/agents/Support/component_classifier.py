"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Classificador de Componentes (ComponentClassifier)
Função: Identificar semanticamente o papel de um arquivo no projeto.
"""
class ComponentClassifier:
    """Assistente Técnico: Especialista em Topologia de Arquivos 🗂️"""

    def map_type(self, rel_path: str) -> str:
        """Mapeamento semântico universal."""
        p = rel_path.lower()
        if "test" in p: return "TEST"
        if "core" in p or "domain" in p: return "CORE"
        if "agent" in p: return "AGENT"
        if "util" in p or "helper" in p: return "UTIL"
        if "ui" in p or "screen" in p or "layout" in p: return "INTERFACE"
        if "data" in p or "repository" in p: return "DATA"
        return "LOGIC"
