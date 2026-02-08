"""
SISTEMA DE PERSONAS AGENTES - CORE
Módulo: Orquestrador de Tarefas (TaskOrchestrator)
Função: Gerenciar execução paralela e ciclou de vida de tarefas do Orchestrator.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class TaskOrchestrator:
    def __init__(self, orchestrator):
        self.orc = orchestrator

    def run_audit_cycle(self, active_phds, obj, changed_files, context):
        """Executa o ciclo paralelo de auditoria para os PhDs selecionados."""
        def audit_task(agent):
            agent.set_context({"identity": self.orc.context_engine.project_identity, "map": self.orc.context_engine.map})
            res = []
            if changed_files: res.extend(agent.perform_audit())
            res.extend(agent.perform_strategic_audit(obj))
            return res

        return self.orc.executor.run_parallel(audit_task, active_phds)

    def run_targeted_verification(self, audit_map):
        """Surgically verifies specific files using the assigned agents."""
        verified_findings = []
        for file, agents in audit_map.items():
            full_path = self.orc.project_root / file
            if not full_path.exists(): continue
            content = self.orc.context_engine.analyst.read_project_file(full_path)
            if not content: continue
            
            for agent_name in agents:
                agent = next((p for p in self.orc.personas if p.name == agent_name), None)
                if agent:
                    # Inicia auditoria estratégica cirúrgica
                    verified_findings.extend(agent.perform_strategic_audit(file_target=file, content_target=content))
        return verified_findings

    def select_active_phds(self, objective, stacks, personas):
        """Filtra PhDs aptos para a missão baseado no objetivo e stack."""
        from src_local.agents.base import BaseActivePersona
        is_crit = any(k in objective.lower() for k in ["segurança", "crítico", "vulnerabilidade"])
        
        def is_eligible(p):
            if p.stack not in stacks and p.stack != "Universal": return False
            if is_crit and p.__class__._reason_about_objective == BaseActivePersona._reason_about_objective:
                return False
            return True

        return [p for p in personas if is_eligible(p)]
