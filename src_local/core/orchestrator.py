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
        """Protocolo Soberano de Verdade Única: Reset -> Discovery -> Targeted Verification."""
        import hashlib
        
        # RESET ABSOLUTO: Limpa o estado de execuções anteriores para evitar inflação
        self.job_queue = []
        self.metrics["all_findings"] = []
        
        if not self.personas: PersonaLoader.mobilize_all(self.project_root, self)
        
        context_v1 = self.context_engine.analyze_project()
        initial_findings = self.run_strategic_audit(context_v1, include_history=False)
        
        # 🕵️ Análise de Ofuscação (Novo Agente)
        obfuscation_findings = self._run_obfuscation_scan()
        initial_findings.extend(obfuscation_findings)
        
        audit_map = self.strategist.plan_targeted_verification(initial_findings)
        internal_health = self.core_validator.verify_core_health(self.project_root)
        
        # Phase 2: Verificação Alvo
        post_findings = self._run_targeted_verification(audit_map) if initial_findings else []
        
        # DEDUPLICAÇÃO POR COORDENADA ABSOLUTA (FBI MODE - NÍVEL 10)
        # Força o uso apenas do NOME do arquivo para evitar duplicatas por caminhos diferentes
        all_raw = initial_findings + post_findings
        all_findings = []
        severity_rank = {"CRITICAL": 5, "HIGH": 4, "MEDIUM": 3, "LOW": 2, "STRATEGIC": 1, "HEALED": 0}
        
        # Mapa de Coordenada: (nome_arquivo, linha) -> melhor_achado
        coordinate_map = {}
        
        for f in all_raw:
            if not isinstance(f, dict):
                # Hash para alertas de texto puro
                f_hash = hashlib.md5(str(f).encode('utf-8')).hexdigest()
                if f_hash not in coordinate_map:
                    coordinate_map[f_hash] = f
                continue
            
            # Normalização Forense de Caminho
            raw_path = f.get('file', 'global')
            # FBI MODE: Usa o caminho relativo completo para evitar colisões entre __init__.py de pastas diferentes
            try:
                clean_path = str(Path(raw_path).as_posix()).replace("\\", "/")
            except:
                clean_path = raw_path
            
            f_line = f.get('line', 0)
            f_sev = f.get('severity', 'MEDIUM').upper()
            
            coord = (clean_path, f_line, f.get('issue')) # Inclui o issue na coordenada para permitir múltiplos problemas no mesmo local
            
            if coord not in coordinate_map:
                coordinate_map[coord] = f
            else:
                existing = coordinate_map[coord]
                if isinstance(existing, dict):
                    existing_sev = existing.get('severity', 'MEDIUM').upper()
                    if severity_rank.get(f_sev, 3) > severity_rank.get(existing_sev, 3):
                        coordinate_map[coord] = f
        
        all_findings = list(coordinate_map.values())
        
        # Sincronização Final
        health_snapshot = self.get_system_health_360(context_v1, internal_health, all_findings)
        self.synthesizer.trigger_reflexes(
            health_snapshot,
            self.personas, all_findings, self.dependency_auditor
        )
        
        self.cache_manager.save()
        report = self.director.format_360_report(health_snapshot, all_findings)
        
        # FBI MODE: Novo nome para evitar cache de arquivo do Windows
        report_file = self.project_root / "auto_healing_VERIFIED.md"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(report)
            f.flush()
            os.fsync(f.fileno()) # Força escrita física no disco
            
        return report_file

    def get_system_health_360(self, context, internal_health, all_findings=None):
        """Sintetiza a saúde sistêmica via delegação."""
        map_data = context.get("map", {})
        context["parity"] = self.context_engine.analyze_stack_parity(self.personas)
        qa_data = {"pyramid": self._get_target_test_pyramid(map_data), "execution": internal_health}
        context["efficiency"] = self.metrics.get("efficiency", {})
        
        # Injeção da verdade consolidada para o sintetizador
        metrics_with_findings = dict(self.metrics)
        if all_findings: metrics_with_findings["all_findings"] = all_findings
        
        return self.synthesizer.synthesize_360(context, metrics_with_findings, self.personas, self.stability_ledger, qa_data)

    def _get_target_test_pyramid(self, map_data):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return testify.analyze_test_pyramid(map_data) if testify else {}

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

    def _run_obfuscation_scan(self):
        """
        🕵️ Executa a varredura do ObfuscationHunter em todo o projeto.
        """
        from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter
        hunter = ObfuscationHunter()
        findings = []
        
        logger.info("🕵️ Iniciando caça por ofuscação de código...")
        
        # Varre todos os arquivos Python mapeados
        for rel_path, data in self.context_engine.map.items():
            if not rel_path.endswith(".py"): continue
            
            full_path = self.project_root / rel_path
            content = self.context_engine.analyst.read_project_file(full_path)
            
            if content:
                issues = hunter.scan_file(str(full_path), content)
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
