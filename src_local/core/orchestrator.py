import logging
import time
import hashlib
import os
from pathlib import Path
from src_local.agents.director import DirectorPersona
from src_local.utils.context_engine import ContextEngine
from src_local.utils.cache_manager import CacheManager
from src_local.utils.stability_ledger import StabilityLedger
from src_local.utils.persona_loader import PersonaLoader
from src_local.utils.dependency_auditor import DependencyAuditor

logger = logging.getLogger(__name__)

class Orchestrator:
    """Maestro PhD: Coordena a inteligência coletiva via delegação total."""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.director = DirectorPersona(self.project_root)
        self.context_engine = ContextEngine(self.project_root)
        self.cache_manager = CacheManager(self.project_root)
        self.stability_ledger = StabilityLedger(self.project_root)
        self.dependency_auditor = DependencyAuditor(self.project_root)
        
        # Injeção via Assembler
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        tools = InfrastructureAssembler.assemble_orchestrator_tools(self.project_root)
        
        self.synthesizer = tools["synthesizer"]
        self.strategist = tools["strategist"]
        self.executor = tools["executor"]
        self.core_validator = tools["validator"]
        
        self.personas, self.job_queue = [], [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time(), "efficiency": {}}

    def add_persona(self, persona_instance):
        """📋 Adiciona uma nova identidade PhD ao corpo docente do Orquestrador."""
        self.personas.append(persona_instance)

    def run_strategic_audit(self, context, objective: str = None, include_history: bool = True):
        """
        🚀 Mobiliza a elite e executa auditoria paralela delegada.
        Consolida achados técnicos, topológicos e de dependências em um fluxo unificado.
        """
        stacks = context['identity'].get('stacks', {'Python'})
        obj = objective or f"Validar integridade {list(stacks)}"

        active_phds = self._select_active_phds(obj, stacks)
        changed_files = self._detect_changed_files(context.get("map", {}).keys())
        
        def audit_task(agent): 
            """Tarefa atômica de auditoria para processamento paralelo."""
            return self._run_task(agent, obj, changed_files)
        
        findings = self.executor.run_parallel(audit_task, active_phds)

        # Agregação de inteligência periférica
        findings.extend(self.synthesizer.get_topology_issues(context))
        findings.extend(self.dependency_auditor.check_submodule_status())
        
        self.stability_ledger.update(findings, context.get("map"))
        return self._build_audit_report_queue(findings, include_history)

    def generate_full_diagnostic(self):
        """Delegado para DiagnosticPipeline."""
        from src_local.core.diagnostic_pipeline import DiagnosticPipeline
        res = DiagnosticPipeline(self).execute()
        
        # Otimização de RAM: Limpa conteúdos cacheados após o pipeline
        for info in self.context_engine.map.values():
            if "content" in info: del info["content"]
            
        return res

    def get_system_health_360(self, context, internal_health, all_findings=None):
        """Sintetiza a saúde sistêmica via delegação."""
        map_data = context.get("map", {})
        context["parity"] = self.context_engine.analyze_stack_parity(self.personas)
        qa_data = {
            "pyramid": self._get_target_test_pyramid(map_data), 
            "execution": internal_health,
            "matrix": self._get_test_quality_matrix(map_data)
        }
        context["efficiency"] = self.metrics.get("efficiency", {})
        
        # Injeção da verdade consolidada para o sintetizador
        metrics_with_findings = dict(self.metrics)
        if all_findings: metrics_with_findings["all_findings"] = all_findings
        
        return self.synthesizer.synthesize_360(context, metrics_with_findings, self.personas, self.stability_ledger, qa_data)

    def _get_target_test_pyramid(self, map_data):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return testify.analyze_test_pyramid(map_data) if testify else {}

    def _get_test_quality_matrix(self, map_data):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return testify.analyze_test_quality_matrix(map_data) if testify else []

    def _detect_changed_files(self, map_files):
        def check_file(p):
            f_hash = self.cache_manager.get_file_hash(self.project_root / p)
            return (p, f_hash) if self.cache_manager.is_changed(p, f_hash) else None
        changed_list = self.executor.run_parallel(check_file, map_files)
        return {p: h for p, h in (changed_list if changed_list else [])}

    def _run_targeted_verification(self, audit_map):
        verified_findings = []
        for file, agents in audit_map.items():
            full_path = self.project_root / file
            if not full_path.exists(): continue
            content = self.context_engine.analyst.read_project_file(full_path)
            if not content: continue
            for agent_name in agents:
                agent = next((p for p in self.personas if p.name == agent_name), None)
                if agent: verified_findings.extend(agent.perform_strategic_audit(file_target=file, content_target=content))
        return verified_findings

    def _select_active_phds(self, objective, stacks):
        from src_local.agents.base import BaseActivePersona
        is_crit = any(k in objective.lower() for k in ["segurança", "crítico", "vulnerabilidade"])
        return [p for p in self.personas if (p.stack in stacks or p.stack == "Universal") and (not is_crit or p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective)]

    def _build_audit_report_queue(self, current, include_history):
        if not include_history: return current
        final_queue = list(current)
        for file, data in self.stability_ledger.ledger.items():
            if data.get('status') == 'HEALED':
                final_queue.append({"file": file, "issue": "Histórico de Falha Curada", "severity": "HEALED", "context": "Ledger"})
        self.job_queue = final_queue
        return final_queue

    def _run_task(self, agent, objective, changed):
        agent.set_context({"identity": self.context_engine.project_identity, "map": self.context_engine.map})
        res = []
        if changed: res.extend(agent.perform_audit())
        res.extend(agent.perform_strategic_audit(objective))
        return res

    def _run_obfuscation_scan(self, context_map=None):
        """
        🕵️ Executa a varredura do ObfuscationHunter em todo o projeto.
        Utiliza o mapa de contexto para evitar leituras redundantes de disco.
        """
        from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter
        hunter = ObfuscationHunter()
        findings = []
        
        logger.info("🕵️ Iniciando caça por ofuscação de código...")
        
        target_map = context_map or self.context_engine.map
        
        # Varre todos os arquivos Python mapeados
        for rel_path, data in target_map.items():
            if not rel_path.endswith(".py"): continue
            
            # Tenta recuperar conteúdo já mapeado se disponível
            content = data.get("content")
            if not content:
                full_path = self.project_root / rel_path
                content = self.context_engine.analyst.read_project_file(full_path)
            
            if content:
                issues = hunter.scan_file(str(rel_path), content)
                for i in issues:
                    findings.append({
                        "file": rel_path,
                        "line": i["line"],
                        "issue": f"Ofuscação Detectada: '{i['keyword']}' oculto via concatenação.",
                        "severity": "CRITICAL",
                        "context": "ObfuscationHunter",
                        "snippet": f"Reconstrução: {i['reconstruction']}"
                    })
        return findings
