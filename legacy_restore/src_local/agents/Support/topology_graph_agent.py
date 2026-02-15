import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class TopologyGraphAgent:
    """Agente especialista em mapear a teia de conexões do projeto."""
    
    def generate_mermaid_graph(self, context_map):
        """Gera um código Mermaid para visualização de fluxo."""
        logger.info("🕸️ [Topology] Mapeando grafo de dependências...")
        
        lines = ["graph TD"]
        for file, data in context_map.items():
            # Apenas arquivos Python core/agent para não poluir
            if not file.endswith('.py'): continue
            
            # Formata nome do nó (remove .py)
            node_id = file.replace('.', '_').replace('/', '_').replace('-', '_')
            node_label = Path(file).name
            
            for dep in data.get("dependencies", []):
                dep_id = str(dep).replace('.', '_').replace('/', '_')
                lines.append(f"    {node_id}[{node_label}] --> {dep_id}")
        
        graph_code = "
".join(lines[:100]) # Limita a 100 conexões para o i5
        logger.info("✅ Grafo gerado.")
        return graph_code
