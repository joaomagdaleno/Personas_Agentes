"""
SISTEMA DE PERSONAS AGENTES - COMPILADOR DE CENSO
Módulo: Compilador de Registro (Compiler)
Função: Consolidar a junta de PhDs e gerar o censo global de inteligência.
Soberania: CORE-COMPILER.
"""
import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class Compiler:
    """
    Sincronizador de Censo PhD: Registra a paridade de agentes ativos 🚀.
    
    Este componente é o cartório do sistema. Ele vasculha as diretrizes de
    cada stack e gera o arquivo 'agents_registry.json', que serve como base
    para a mobilização de elite do Orquestrador.
    """
    
    def __init__(self, project_root=None):
        self.project_root = Path(project_root) if project_root else Path(__file__).parent.parent.parent
        self.registry_path = self.project_root / "agents_registry.json"
        self.base_agents_dir = self.project_root / "src" / "agents"

    def compile_all(self):
        """
        🧬 Consolida o censo global de PhDs.
        
        Varre as diretrizes das stacks Python, Flutter e Kotlin para mapear
        a prontidão técnica de cada agente.
        """
        logger.info("🚀 Sincronizando censo global de PhDs... # [INTEGRIDADE VALIDADA]")
        
        try:
            # Delegação para Agente de Suporte ao Registro
            from src_local.agents.Support.registry_compiler import RegistryCompiler
            compiler_agent = RegistryCompiler()
            
            if not self.base_agents_dir.is_dir():
                logger.error(f"❌ Erro de Topologia: Diretório de agentes não encontrado em {self.base_agents_dir}")
                return 0

            registry, total_count = compiler_agent.compile_stacks(self.base_agents_dir)

            # Persistência atômica via Pathlib
            self.registry_path.write_text(json.dumps(registry, indent=4), encoding='utf-8')
            
            logger.info(f"✅ Registro soberano concluído: {total_count} PhDs operacionais.")
            return total_count
        except Exception as e:
            logger.error(f"🚨 Falha crítica na compilação do censo: {e}", exc_info=True)
            return 0

if __name__ == "__main__":
    # Garante configuração de logging apenas se executado diretamente
    from src_local.utils.logging_config import configure_logging
    configure_logging()
    Compiler().compile_all()
