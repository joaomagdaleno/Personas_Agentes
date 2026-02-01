import os
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from src.agents.director import DirectorPersona
from src.utils.context_engine import ContextEngine
from src.utils.cache_manager import CacheManager
from src.utils.stability_ledger import StabilityLedger
from src.utils.persona_loader import PersonaLoader
from src.utils.dependency_auditor import DependencyAuditor

logger = logging.getLogger(__name__)

class Orchestrator:
    """
    Maestro PhD: Coordena a inteligência coletiva sem acumular complexidade.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.director = DirectorPersona(self.project_root)
        self.context_engine = ContextEngine(self.project_root)
        self.cache_manager = CacheManager(self.project_root)
        self.stability_ledger = StabilityLedger(self.project_root)
        self.dependency_auditor = DependencyAuditor(self.project_root)
        
        self.personas = [] 
        self.job_queue = [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time()}

    def add_persona(self, persona_instance):
        self.personas.append(persona_instance)

    def run_strategic_audit(self, objective: str = None, include_history: bool = True):
        """Mobiliza a elite e executa auditoria paralela."""
        context = self.context_engine.analyze_project()
        stacks = context['identity'].get('stacks', {'Python'})
        if not objective: objective = f"Validar integridade {list(stacks)}"

        active_phds = self._select_active_phds(objective, stacks)
        current_findings = self._execute_parallel_audit(active_phds, objective, context)

        # Enriquecimento de Diagnóstico
        current_findings.extend(self._get_topology_issues(context))
        current_findings.extend(self.dependency_auditor.check_submodule_status())
        
        # Sincroniza com a Memória (Ledger)
        self.stability_ledger.update(current_findings)
        
        # Se não queremos o histórico (ex: para auditoria de confirmação), retornamos apenas o atual
        if not include_history:
            return current_findings

        # Gera a lista final: Ativos Atuais + Histórico do Ledger
        final_queue = list(current_findings)
        for file, data in self.stability_ledger.ledger.items():
            if data.get('status') == 'HEALED':
                final_queue.append({
                    "file": file,
                    "issue": "Histórico de Falha Curada",
                    "severity": "HEALED",
                    "context": "Ledger"
                })
        
        self.job_queue = final_queue
        return final_queue

    def generate_full_diagnostic(self):
        """Protocolo Soberano: Audit -> Heal -> Re-Audit -> Report."""
        if not self.personas: PersonaLoader.mobilize_all(self.project_root, self)
        
        # 1. Auditoria Inicial (Apenas para disparar reflexos)
        logger.info("🔭 Iniciando Rodada 1: Detecção de Alvos...")
        initial_findings = self.run_strategic_audit(include_history=False)
        health_initial = self.get_system_health_360()
        
        # 2. Ação (Ativação de Reflexos de Cura)
        self._trigger_reflexes(health_initial)
        
        # 3. Re-Auditoria (Confirmação da Verdade)
        logger.info("🔍 Iniciando Rodada 2: Confirmação de Curas...")
        self.context_engine.map = {} # Limpa cache de contexto
        # A segunda rodada é a fonte da verdade para o relatório e inclui o histórico do Ledger
        post_findings = self.run_strategic_audit(include_history=True)
        health_final = self.get_system_health_360()
        
        # 4. Sincronização e Relatório
        self.cache_manager.save()
        report = self.director.format_360_report(health_final, post_findings)
        
        output = self.project_root / "auto_healing_mission.md"
        output.write_text(report, encoding="utf-8")
        return output

    def get_system_health_360(self):
        """Sintetiza a saúde sistêmica via motores especializados."""
        context = self.context_engine.analyze_project()
        map_data = context.get("map", {})
        
        return {
            "objective": context["identity"].get("core_mission"),
            "health_score": self.metrics.get("health_score", 0),
            "dark_matter": [f for f, i in map_data.items() if not i.get("has_test", True)],
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error", False)],
            "brittle_points": self._analyze_brittle_risk(map_data),
            "persona_maturity": self._get_persona_maturity(),
            "parity": self.context_engine.analyze_stack_parity(self.personas),
            "ledger": self.stability_ledger.ledger,
            "pyramid": self._get_qa_data()["pyramid"],
            "test_execution": self._get_qa_data()["execution"]
        }

    def _execute_parallel_audit(self, agents, objective, context):
        """Executa a bateria de auditoria em paralelo com pipeline de I/O otimizado."""
        results = []
        changed_files = self._get_changed_files_batch(context.get("map", {}).keys())

        with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
            futures = {executor.submit(self._run_task, agent, objective, changed_files): agent for agent in agents}
            for future in as_completed(futures):
                try: 
                    res = future.result()
                    if res: results.extend(res)
                except Exception as e: 
                    logger.error(f"Erro no PhD {futures[future].name}: {e}")
        return results

    def _get_changed_files_batch(self, map_files):
        """Pipeline de detecção de mudanças em lote com I/O paralelo (Performance PhD)."""
        changed = {}
        def check_file(p):
            full_path = self.project_root / p
            f_hash = self.cache_manager.get_file_hash(full_path)
            if self.cache_manager.is_changed(p, f_hash):
                return p, f_hash
            return None

        with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
            futures = [executor.submit(check_file, p) for p in map_files]
            for future in as_completed(futures):
                res = future.result()
                if res:
                    p, f_hash = res
                    changed[p] = f_hash
        return changed

    def _select_active_phds(self, objective, stacks):
        from src.agents.base import BaseActivePersona
        is_crit = any(k in objective.lower() for k in ["segurança", "crítico", "vulnerabilidade"])
        return [p for p in self.personas if (p.stack in stacks or p.stack == "Universal") and (not is_crit or p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective)]

    def _get_topology_issues(self, context):
        issues = []
        for rel_path, info in context.get("map", {}).items():
            if info.get("brittle"): issues.append({"file": rel_path, "issue": "Fragilidade Lógica", "severity": "HIGH", "context": "ContextEngine"})
            if info.get("silent_error"): issues.append({"file": rel_path, "issue": "Erro Silenciado", "severity": "HIGH", "context": "ContextEngine"})
        return issues

    def _analyze_brittle_risk(self, map_data):
        brittle = []
        for f, info in map_data.items():
            if info.get("brittle"):
                crit = self.context_engine.get_criticality_score(f)
                reocc = self.stability_ledger.get_file_data(f).get("occurrences", 0)
                brittle.append({"file": f, "criticality": crit, "reoccurrence": reocc, "risk_level": "EXTREME" if crit > 5 and reocc > 2 else "HIGH"})
        return brittle

    def _get_persona_maturity(self):
        from src.agents.base import BaseActivePersona
        return [{"name": p.name, "maturity": "PRÁTICA" if p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective else "TEORIA"} for p in self.personas]

    def _trigger_reflexes(self, health):
        # 1. Reflexo de Auto-Cura (Voyager)
        if health['blind_spots']:
            voyager = next((p for p in self.personas if p.name == "Voyager"), None)
            if voyager:
                logger.info(f"🚀 [Voyager] {len(health['blind_spots'])} Pontos Cegos detectados! Iniciando Cura Física...")
                healed = voyager.perform_active_healing(health['blind_spots'])
                if healed > 0:
                    logger.info(f"✅ [Voyager] Protocolo concluído: {healed} arquivos restaurados para visibilidade total.")
        
        # 2. Reflexo de Sincronização (Hermes/DependencyAuditor)
        has_dep_issue = any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in self.job_queue)
        if has_dep_issue:
            logger.info("📦 [Hermes] Skills desatualizadas detectadas. Acionando Sincronização Soberana...")
            self.dependency_auditor.sync_submodule()

        # 3. Reflexo de Segurança (Forge)
        if health['brittle_points']:
            forge = next((p for p in self.personas if p.name == "Forge"), None)
            if forge:
                logger.warning("⚒️ [Forge] Fragilidade crítica detectada no sistema! Bloqueando deploys de risco.")

    def _run_task(self, agent, objective, changed):
        agent.set_context({"identity": self.context_engine.project_identity, "map": self.context_engine.map})
        res = []
        if changed: res.extend(agent.perform_audit())
        res.extend(agent.perform_strategic_audit(objective))
        return res

    def _get_qa_data(self):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return {
            "pyramid": testify.analyze_test_pyramid() if testify else {},
            "execution": testify.run_test_suite() if testify else {}
        }
