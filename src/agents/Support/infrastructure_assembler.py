import logging
from pathlib import Path
from src.agents.Support.structural_analyst import StructuralAnalyst
from src.agents.Support.integrity_guardian import IntegrityGuardian
from src.agents.Support.connectivity_mapper import ConnectivityMapper
from src.agents.Support.parity_analyst import ParityAnalyst
from src.agents.Support.audit_engine import AuditEngine
from src.agents.Support.line_veto import LineVeto
from src.agents.Support.health_synthesizer import HealthSynthesizer
from src.agents.Support.diagnostic_strategist import DiagnosticStrategist
from src.agents.Support.task_executor import TaskExecutor
from src.core.validator import SystemValidator

logger = logging.getLogger(__name__)

class InfrastructureAssembler:
    """Assistente Técnico: Responsável pela montagem e injeção de dependências 🏗️"""
    
    @staticmethod
    def assemble_core_support():
        """Instancia a junta de suporte padrão."""
        logger.info("🏗️ [Assembler] Montando junta de suporte core...")
        
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
        """Instancia as ferramentas do maestro."""
        logger.info("🎼 [Assembler] Mobilizando ferramentas do maestro...")
        
        return {
            "synthesizer": HealthSynthesizer(),
            "strategist": DiagnosticStrategist(),
            "executor": TaskExecutor(),
            "validator": SystemValidator()
        }
