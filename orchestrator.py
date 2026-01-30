import os
import json
import logging
import time
from director_persona import DirectorPersona

logger = logging.getLogger(__name__)

class ProjectOrchestrator:
    """Orquestrador central modelo que coordena o ciclo de diagnóstico e reparo."""
    
    def __init__(self, project_root):
        """Inicializa o orquestrador com resiliência e métricas."""
        self.project_root = project_root
        self.director = DirectorPersona(project_root)
        self.personas = [] 
        self.job_queue = [] 
        self.stage = "Desconhecido"
        self.metrics = {
            "start_time": 0,
            "end_time": 0,
            "failed_personas": [],
            "health_score": 100
        }
        logger.debug(f"Orchestrator Modelo inicializado para: {project_root}")

    def detect_project_stage(self):
        """Analisa a maturidade do projeto para definir a estratégia do Diretor."""
        file_count = 0
        test_files = 0
        has_ci = False
        
        logger.info("Analisando estágio de maturidade do projeto...")
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv', '.env']]
            for f in files:
                file_count += 1
                if 'test' in f.lower(): 
                    test_files += 1
            if '.github' in root or '.gitlab-ci' in root: 
                has_ci = True

        if file_count < 20:
            self.stage = "GENESIS (MVP)"
        elif (test_files / (file_count + 1)) < 0.1:
            self.stage = "EVOLUTION (DÍVIDA TÉCNICA)"
        elif has_ci and test_files > 5:
            self.stage = "STABILITY (PRODUÇÃO)"
        else:
            self.stage = "MAINTENANCE (LEGADO)"
        
        logger.info(f"Estágio detectado: {self.stage}")
        return self.stage

    def add_persona(self, persona_instance):
        """Registra uma nova instância de persona."""
        self.personas.append(persona_instance)

    def calculate_health_score(self, issues):
        """Calcula uma pontuação de saúde de 0 a 100 baseada na gravidade dos problemas."""
        deductions = {
            'high': 10,
            'medium': 5,
            'low': 2
        }
        score = 100
        for issue in issues:
            severity = issue.get('severity', 'low').lower()
            score -= deductions.get(severity, 2)
        
        self.metrics['health_score'] = max(0, score)
        return self.metrics['health_score']

    def run_full_diagnostic(self):
        """Aciona os especialistas com isolamento de falhas e foco estratégico."""
        self.metrics['start_time'] = time.time()
        self.detect_project_stage()
        self.job_queue = []
        self.metrics['failed_personas'] = []
        
        priorities = {
            "GENESIS (MVP)": ["Scope", "Scale", "Forge"],
            "EVOLUTION (DÍVIDA TÉCNICA)": ["Testify", "Scribe", "Mantra"],
            "STABILITY (PRODUÇÃO)": ["Bolt", "Sentinel", "Metric"],
            "MAINTENANCE (LEGADO)": ["Voyager", "Warden", "Bridge"]
        }
        
        current_priorities = priorities.get(self.stage, [])
        logger.info(f"Iniciando diagnóstico estratégico. Prioridade: {current_priorities}")

        for persona in self.personas:
            try:
                is_priority = persona.name in current_priorities
                issues = persona.perform_audit()
                if issues:
                    for issue in issues:
                        if is_priority and issue.get('severity') == 'low':
                            issue['severity'] = 'medium'
                        self.job_queue.append(issue)
            except Exception as e:
                logger.error(f"CRÍTICO: Persona {persona.name} falhou catastróficamente: {e}")
                self.metrics['failed_personas'].append(persona.name)
        
        self.calculate_health_score(self.job_queue)
        self.metrics['end_time'] = time.time()
        
        logger.info(f"Diagnóstico finalizado. Health Score: {self.metrics['health_score']}%")
        return self.job_queue

    def prepare_mission_package(self):
        """Prepara o pacote de missão em Markdown, agora com resumo executivo."""
        if not self.job_queue: 
            return None

        duration = round(self.metrics['end_time'] - self.metrics['start_time'], 2)
        
        mission_text = f"# 🏛️ MISSÃO DE REPARO: ESTÁGIO {self.stage}\n"
        mission_text += f"**Health Score Atual:** {self.metrics['health_score']}%\n"
        mission_text += f"**Tempo de Auditoria:** {duration}s\n\n"
        
        if self.metrics['failed_personas']:
            mission_text += f"> ⚠️ **Aviso:** Os especialistas {', '.join(self.metrics['failed_personas'])} não puderam completar a análise.\n\n"

        mission_text += "## 📋 CONTEXTO ESTRATÉGICO\n"
        mission_text += f"- **Estágio:** {self.stage}\n"
        mission_text += f"- **Especialistas Ativos:** {len(self.personas)}\n\n"
        mission_text += "---\n\n"
        
        grouped_jobs = {}
        for job in self.job_queue:
            file = job.get('file', 'Global')
            if file not in grouped_jobs: grouped_jobs[file] = []
            grouped_jobs[file].append(job)

        for file, issues in grouped_jobs.items():
            mission_text += f"## 🎯 ALVO: `{file}`\n"
            mission_text += "### ⚠️ Problemas Detectados:\n"
            for i, issue in enumerate(issues):
                mission_text += f"{i+1}. **[{issue.get('severity', 'medium').upper()}]** {issue.get('issue', 'Alerta técnico.')}\n"
            
            mission_text += f"\n### 🛠️ Instrução de Ação para `{file}`:\n"
            mission_text += "Aplique as correções mantendo a consistência e os padrões do projeto.\n\n"
            mission_text += "---\n\n"
        
        return f"{self.director.get_system_prompt()}\n\n{mission_text}"

    def dispatch_fix(self, mission_prompt):
        """Salva a missão de reparo."""
        target_path = os.path.join(self.project_root, "auto_healing_mission.md")
        try:
            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(mission_prompt)
            logger.info(f"🚀 Missão salva em {target_path}")
        except Exception as e:
            logger.error(f"Erro ao salvar missão: {e}")
