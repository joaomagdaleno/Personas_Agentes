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
        FBI MODE: Cache desativado para garantir verdade técnica.
        """
        logger.info("🕵️‍♂️ [FBI_VERIFIED_RUN] Montando junta de suporte core (FRESH)...")
        return {
            "analyst": StructuralAnalyst(),
            "guardian": IntegrityGuardian(),
            "mapper": ConnectivityMapper(),
            "parity": ParityAnalyst(),
            "audit_engine": AuditEngine(),
            "line_veto": LineVeto()
        }

    @staticmethod
    def assemble_orchestrator_tools(project_root):
        """
        🎼 Mobiliza as ferramentas soberanas do Maestro.
        FBI MODE: Cache desativado para garantir verdade técnica.
        """
        root_str = str(project_root)
        logger.info(f"🎼 [Assembler] Mobilizando ferramentas do maestro para: {root_str} (FRESH)")
        
        return {
            "synthesizer": HealthSynthesizer(),
            "strategist": DiagnosticStrategist(),
            "executor": TaskExecutor(),
            "validator": CoreValidator()
        }
