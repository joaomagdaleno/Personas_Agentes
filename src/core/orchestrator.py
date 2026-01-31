import os
import time
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.agents.director import DirectorPersona
from src.utils.context_engine import ContextEngine
from src.utils.cache_manager import CacheManager

logger = logging.getLogger(__name__)

class ProjectOrchestrator:
    """
    O NOVO ORQUESTRADOR EVOLUÍDO 🏛️
    - Execução Paralela (Multi-threading)
    - Cache de Integridade (Hashing)
    - Triagem de Contexto (Smart Routing)
    """
    
    def __init__(self, project_root):
        self.project_root = project_root
        self.director = DirectorPersona(project_root)
        self.context_engine = ContextEngine(project_root)
        self.cache_manager = CacheManager(project_root)
        self.project_context = {}
        self.personas = [] 
        self.job_queue = [] 
        self.stage = "Desconhecido"
        self.metrics = {
            "start_time": 0,
            "end_time": 0,
            "files_scanned": 0,
            "files_skipped": 0,
            "health_score": 100
        }

    def add_agent(self, agent_instance):
        self.personas.append(agent_instance)

    def add_persona(self, persona_instance):
        self.add_agent(persona_instance)

    def run_diagnostic(self):
        """Execução ultra-rápida com paralelismo, cache e soberania."""
        self.metrics['start_time'] = time.time()
        
        logger.info("🧠 Mapeando contexto e verificando cache...")
        try:
            self.project_context = self.context_engine.analyze_project()
        except Exception as e:
            logger.error(f"Erro ao mapear contexto: {e}")
            self.project_context = {}
        
        # Filtra arquivos que realmente mudaram
        files_to_audit = {}
        for rel_path in self.project_context.keys():
            abs_path = os.path.join(self.project_root, rel_path)
            f_hash = self.cache_manager.get_file_hash(abs_path)
            
            if self.cache_manager.is_changed(rel_path, f_hash):
                files_to_audit[rel_path] = f_hash
                self.metrics['files_scanned'] += 1
            else:
                self.metrics['files_skipped'] += 1

        self.detect_stage()
        self.job_queue = []
        
        logger.info(f"🚀 Iniciando Auditoria Paralela ({len(self.personas)} agentes)...")

        # EXECUÇÃO PARALELA
        with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
            futures = {executor.submit(self._run_agent_task, agent, files_to_audit): agent for agent in self.personas}
            
            for future in as_completed(futures):
                agent = futures[future]
                try:
                    issues = future.result()
                    if issues:
                        self.job_queue.extend(issues)
                        logger.info(f"✅ Agente {agent.name} reportou {len(issues)} alertas.")
                except Exception as e:
                    logger.error(f"❌ Erro crítico no Agente {agent.name}: {e}")

        # Atualiza o cache
        for rel_path, f_hash in files_to_audit.items():
            self.cache_manager.update(rel_path, f_hash)
        
        self.cache_manager.save()
        self._calculate_health()
        self.metrics['end_time'] = time.time()
        
        return self.job_queue

    def run_full_diagnostic(self):
        """Alias para manter compatibilidade, forçando limpeza de cache."""
        self.cache_manager.current_cache = {}
        return self.run_diagnostic()

    def _run_agent_task(self, agent, files_to_audit):
        """Tarefa individual de cada agente rodando em paralelo."""
        agent.set_context(self.project_context)
        
        # 1. Auditoria Geral (Padrões do projeto)
        raw_issues = agent.perform_audit()
        
        # 2. Auditoria Lógica apenas nos arquivos alterados
        for rel_path in files_to_audit.keys():
            abs_path = os.path.join(self.project_root, rel_path)
            logic_issues = agent.analyze_logic(abs_path)
            if logic_issues:
                raw_issues.extend(logic_issues)
        
        # 3. TAG de Soberania: Marca o que é local e o que é externo
        processed_issues = []
        for issue in raw_issues:
            file_path = issue.get('file', '')
            # Se o arquivo estiver em .agent, ele é PROTEGIDO
            issue['is_protected'] = '.agent' in file_path or 'submodules' in file_path
            processed_issues.append(issue)
                
        return processed_issues

    def prepare_mission_package(self):
        """Gera o pacote de missão APENAS com arquivos soberanos (locais)."""
        sovereign_issues = [i for i in self.job_queue if not i.get('is_protected', False)]
        
        if not sovereign_issues:
            return None
            
        return self.director.format_mission(sovereign_issues, self.stage, self.metrics)

    def get_full_report(self):
        """Gera o relatório visual completo para a GUI (incluindo externos)."""
        return self.job_queue

    def detect_stage(self):
        file_count = len(self.project_context)
        test_files = sum(1 for f in self.project_context.keys() if 'test' in f.lower())
        
        if file_count < 20: self.stage = "GENESIS"
        elif (test_files / (file_count + 1)) < 0.1: self.stage = "EVOLUTION"
        else: self.stage = "STABILITY"
        return self.stage

    def _calculate_health(self):
        score = 100 - (len(self.job_queue) * 2)
        self.metrics['health_score'] = max(0, score)

    def run_auto_healing(self):
        """Executa o ciclo de auto-cura apenas em arquivos locais (soberanos)."""
        logger.info("⚡ INICIANDO CICLO DE AUTO-CURA...")
        
        # 1. Roda o diagnóstico para ter a lista atualizada
        issues = self.run_diagnostic()
        
        fixed_count = 0
        for issue in issues:
            # Trava de Segurança: Apenas arquivos Soberanos (locais) são reparados.
            # Agora os AGENTES também podem ser curados se tiverem erros REAIS.
            if issue.get('is_protected'):
                continue
            
            rel_path = issue.get('file')
            abs_path = os.path.join(self.project_root, rel_path)
            
            # Busca o agente que reportou para aplicar a cura
            agent_name = issue.get('context', 'Base')
            agent = next((p for p in self.personas if p.name == agent_name), self.personas[0])
            
            if agent.apply_auto_fix(abs_path, issue.get('issue')):
                fixed_count += 1
                logger.info(f"✨ Auto-Cura aplicada: {rel_path}")

        # Limpa o cache para forçar re-auditoria após correções
        self.cache_manager.current_cache = {}
        self.cache_manager.save()
        
        return fixed_count

    def get_mission_report(self):
        return self.director.format_mission(self.job_queue, self.stage, self.metrics)