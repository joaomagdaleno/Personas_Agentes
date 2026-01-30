import os
import time
import logging
from src.agents.director import DirectorPersona

logger = logging.getLogger(__name__)

class ProjectOrchestrator:
    """
    Controller: Orquestrador de Projeto.
    Coordena o ciclo de vida do diagnóstico e as métricas de saúde.
    """
    
    def __init__(self, project_root):
        self.project_root = project_root
        self.director = DirectorPersona(project_root)
        self.personas = [] 
        self.job_queue = [] 
        self.stage = "Desconhecido"
        self.metrics = {
            "start_time": 0,
            "end_time": 0,
            "failed_agents": [],
            "health_score": 100
        }

    def detect_stage(self):
        """Lógica de negócio para identificar maturidade do projeto."""
        file_count = 0
        test_files = 0
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__']]
            for f in files:
                file_count += 1
                if 'test' in f.lower(): test_files += 1
        
        if file_count < 20: self.stage = "GENESIS"
        elif (test_files / (file_count + 1)) < 0.1: self.stage = "EVOLUTION"
        else: self.stage = "STABILITY"
        
        return self.stage

    def add_agent(self, agent_instance):
        """Injeção de dependência de agentes especialistas."""
        self.personas.append(agent_instance)

    def run_diagnostic(self):
        """Executa a auditoria em todos os agentes com resiliência total."""
        self.metrics['start_time'] = time.time()
        self.detect_stage()
        self.job_queue = []
        
        logger.info(f"🚀 Iniciando Diagnóstico em estágio {self.stage}")

        for agent in self.personas:
            try:
                issues = agent.perform_audit()
                if issues:
                    self.job_queue.extend(issues)
                    logger.info(f"✅ Agent {agent.name} finalizou com {len(issues)} alertas.")
            except Exception as e:
                logger.error(f"❌ Falha no Agente {agent.name}: {e}")
                self.metrics['failed_agents'].append(agent.name)
        
        self._calculate_health()
        self.metrics['end_time'] = time.time()
        return self.job_queue

    def _calculate_health(self):
        """Cálculo interno de Score."""
        score = 100 - (len(self.job_queue) * 2)
        self.metrics['health_score'] = max(0, score)

    def get_mission_report(self):
        """Gera o relatório final formatado."""
        return self.director.format_mission(self.job_queue, self.stage, self.metrics)