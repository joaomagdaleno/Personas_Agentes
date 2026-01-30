import os
import json
from director_persona import DirectorPersona

class ProjectOrchestrator:
    """Especialista técnico do ecossistema Personas Agentes."""
    def __init__(self, project_root):
        """Executa funcionalidade da persona."""
        self.project_root = project_root
        self.director = DirectorPersona(project_root)
        self.personas = [] 
        self.job_queue = [] 
        self.stage = "Desconhecido"

    def detect_project_stage(self):
        """Analisa a maturidade do projeto para definir a estratégia do Diretor."""
        file_count = 0
        test_files = 0
        has_ci = False
        
        for root, dirs, files in os.walk(self.project_root):
            if '.git' in root or 'build' in root: continue
            for f in files:
                file_count += 1
                if 'test' in f.lower(): test_files += 1
            if '.github' in root or '.gitlab-ci' in root: has_ci = True

        if file_count < 20:
            self.stage = "GENESIS (MVP)"
        elif test_files / (file_count + 1) < 0.1:
            self.stage = "EVOLUTION (DÍVIDA TÉCNICA)"
        elif has_ci and test_files > 5:
            self.stage = "STABILITY (PRODUÇÃO)"
        else:
            self.stage = "MAINTENANCE (LEGADO)"
        
        return self.stage

    def add_persona(self, persona_instance):
        """Executa funcionalidade da persona."""
        self.personas.append(persona_instance)

    def run_full_diagnostic(self):
        """Aciona os especialistas com foco estratégico no estágio do projeto."""
        self.detect_project_stage()
        print(f"🏛️ Diretor: Projeto em estágio {self.stage}")
        self.job_queue = []
        
        # Define prioridades baseadas no estágio
        priorities = {
            "GENESIS (MVP)": ["Scope", "Scale", "Forge"],
            "EVOLUTION (DÍVIDA TÉCNICA)": ["Testify", "Scribe", "Mantra"],
            "STABILITY (PRODUÇÃO)": ["Bolt", "Sentinel", "Metric"],
            "MAINTENANCE (LEGADO)": ["Voyager", "Warden", "Bridge"]
        }
        
        current_priorities = priorities.get(self.stage, [])

        for persona in self.personas:
            # Especialistas prioritários rodam com 'raio-x' total
            is_priority = persona.name in current_priorities
            issues = persona.perform_audit()
            if issues:
                for issue in issues:
                    # Eleva a gravidade se a persona for prioritária para o estágio
                    if is_priority and issue['severity'] == 'low':
                        issue['severity'] = 'medium'
                    self.job_queue.append(issue)
        
        return self.job_queue

    def prepare_mission_package(self):
        """Prepara a missão em formato Markdown otimizado para o Gemini CLI."""
        if not self.job_queue: return None

        mission_text = f"# 🏛️ MISSÃO DE REPARO: ESTÁGIO {self.stage}\n"
        mission_text += "VOCÊ É O EXECUTOR. FOCO EM EVOLUIR O PROJETO PARA O PRÓXIMO NÍVEL.\n\n"
        mission_text += "## 📋 CONTEXTO ESTRATÉGICO\n"
        mission_text += f"- **Estágio:** {self.stage}\n"
        mission_text += f"- **Especialistas Ativos:** {len(self.personas)}\n\n"
        mission_text += "---\n\n"
        
        grouped_jobs = {}
        for job in self.job_queue:
            file = job['file']
            if file not in grouped_jobs: grouped_jobs[file] = []
            grouped_jobs[file].append(job)

        for file, issues in grouped_jobs.items():
            mission_text += f"## 🎯 ALVO: `{file}`\n"
            mission_text += "### ⚠️ Problemas Detectados:\n"
            for i, issue in enumerate(issues):
                mission_text += f"{i+1}. **[{issue['severity'].upper()}]** {issue['issue']}\n"
            
            mission_text += "\n### 🛠️ Instrução de Ação:\n"
            mission_text += f"Analise o arquivo `{file}` e aplique as correções para os problemas listados acima, mantendo a consistência do código.\n\n"
            mission_text += "---\n\n"
        
        full_prompt = f"{self.director.get_system_prompt()}\n\n{mission_text}"
        return full_prompt

    def dispatch_fix(self, mission_prompt):
        """Salva a missão de reparo na raiz do projeto."""
        target_path = os.path.join(self.project_root, "auto_healing_mission.md")
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(mission_prompt)
        print(f"🚀 Missão preparada em {target_path}. Pronto para execução.")
