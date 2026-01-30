from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class DirectorPersona(BaseActivePersona):
    """
    Model: O Diretor.
    Responsável pela estratégia e formatação da comunicação com o Gemini.
    """
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name = "Director"
        self.emoji = "🏛️"
        self.role = "Master Orchestrator"
        self.mission = "Drive specialized agents to project excellence."

    def perform_audit(self):
        return []

    def format_mission(self, issues, stage, metrics):
        """Formata o pacote de missão em Markdown (SRP)."""
        duration = round(metrics['end_time'] - metrics['start_time'], 2)
        report = f"# 🏛️ MISSÃO DE REPARO: {stage}\n"
        report += f"**Health Score:** {metrics['health_score']}% | **Audit Time:** {duration}s\n\n"
        
        if not issues:
            return report + "✅ Projeto em conformidade total."

        grouped = {}
        for iss in issues:
            file = iss.get('file', 'Global')
            if file not in grouped: grouped[file] = []
            grouped[file].append(iss)

        for file, file_issues in grouped.items():
            report += f"## 🎯 ALVO: `{file}`\n"
            for i, iss in enumerate(file_issues):
                report += f"{i+1}. **[{iss['severity'].upper()}]** {iss['issue']}\n"
            report += f"\n### 🛠️ Ação: Corrigir mantendo os padrões do projeto.\n\n---\n"
        
        return report

    def get_system_prompt(self):
        return f"You are the Director 🏛️. Your mission is: {self.mission}"
