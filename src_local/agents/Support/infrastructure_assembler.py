import logging
from pathlib import Path
from src_local.agents.Support.structural_analyst import StructuralAnalyst
from src_local.agents.Support.integrity_guardian import IntegrityGuardian
from src_local.agents.Support.connectivity_mapper import ConnectivityMapper
from src_local.agents.Support.parity_analyst import ParityAnalyst
from src_local.agents.Support.audit_engine import AuditEngine
from src_local.agents.Support.line_veto import LineVeto
from src_local.agents.Support.health_synthesizer import HealthSynthesizer
from src_local.agents.Support.diagnostic_strategist import DiagnosticStrategist
from src_local.agents.Support.task_executor import TaskExecutor
from src_local.core.validator import CoreValidator
from src_local.agents.Support.test_refiner import TestRefiner
from src_local.agents.Support.healer import HealerPersona

logger = logging.getLogger(__name__)

class InfrastructureAssembler:
    """
    🏗️ Montador de Infraestrutura PhD.
    O Arquiteto de Dependências que garante a injeção correta de inteligência em cada Agente.
    """
    
    _core_cache = None
    _tools_cache = {}

    @staticmethod
    def assemble_core_support():
        """
        🛡️ Instancia a junta de suporte padrão.
        Utiliza cache soberano para otimização de performance.
        """
        if InfrastructureAssembler._core_cache:
            return InfrastructureAssembler._core_cache

        logger.info("🛡️ [Assembler] Mobilizando junta de suporte core...")
        InfrastructureAssembler._core_cache = {
            "analyst": StructuralAnalyst(),
            "guardian": IntegrityGuardian(),
            "mapper": ConnectivityMapper(),
            "parity": ParityAnalyst(),
            "audit_engine": AuditEngine(),
            "line_veto": LineVeto()
        }
        return InfrastructureAssembler._core_cache

    @staticmethod
    def assemble_orchestrator_tools(project_root):
        """🎼 Mobiliza as ferramentas do Maestro incluindo os novos Agentes de IA."""
        root_str = str(project_root)
        if root_str in InfrastructureAssembler._tools_cache:
            return InfrastructureAssembler._tools_cache[root_str]

        from src_local.utils.cognitive_engine import CognitiveEngine
        from src_local.agents.Support.test_architect_agent import TestArchitectAgent
        from src_local.agents.Support.doc_gen_agent import DocGenAgent
        
        brain = CognitiveEngine()
        tools = {
            "synthesizer": HealthSynthesizer(),
            "strategist": DiagnosticStrategist(),
            "executor": TaskExecutor(),
            "validator": CoreValidator(),
            "refiner": TestRefiner(project_root),
            "healer": HealerPersona(project_root),
            "architect": TestArchitectAgent(brain),
            "doc_gen": DocGenAgent(brain)
        }
        InfrastructureAssembler._tools_cache[root_str] = tools
        return tools
