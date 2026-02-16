from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class DirectorPersona(BaseActivePersona):
    """
    Core: PhD in Systemic Orchestration & AI Governance 🏛️
    O Diretor Soberano, responsável por coordenar a inteligência coletiva dos agentes e garantir a integridade do Plano de Batalha.
    """
    
    def __init__(self, project_root=None):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Director", "🏛️", "Master Orchestrator", "Python"
        self.mission = "Drive specialized agents to project excellence via PhD systemic governance."
        
        # Agentes de Suporte (Lazy loading)
        try:
            from src_local.agents.Support.report_formatter import ReportFormatter
            from src_local.agents.Support.markdown_sanitizer import MarkdownSanitizer
            self.formatter = ReportFormatter()
            self.sanitizer = MarkdownSanitizer()
        except ImportError:
            logger.warning("🏛️ [Director] Agentes de suporte não disponíveis. Operação em modo reduzido.")

    def perform_audit(self) -> list:
        """Auditoria de Intenção Estratégica Soberana."""
        start_time = time.time()
        logger.info(f"[{self.name}] Orquestrando Auditoria Estratégica (Legacy Stack)...")
        
        findings = []
        # Foca em arquivos críticos (Core e Security)
        critical_files = [
            f for f in self.context_data.keys() 
            if f.endswith(".py") and ("core" in f or "security" in f or "agent" in f)
            and f not in self.ignored_files
        ]
        
        # Amostragem Estratégica PhD
        import random
        target_sample = random.sample(critical_files, min(len(critical_files), 5)) 
        
        for file in target_sample:
            content = self.read_project_file(file)
            if content:
                res = self.structural_analyst.analyze_intent(content, file, self.cognitive)
                if res: findings.append(res)
        
        self._log_performance(start_time, len(findings))
        return findings

    def _reason_about_objective(self, objective, file, content):
        """O Diretor sintetiza a visão macro, delegando o raciocínio atômico aos especialistas."""
        return f"PhD Governance: Supervisionando o objetivo '{objective}' em '{file}'. Garantindo alinhamento com a Missão Soberana."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Diretor PhD 🏛️, mestre da orquestração sistêmica. Sua missão é: {self.mission}"
