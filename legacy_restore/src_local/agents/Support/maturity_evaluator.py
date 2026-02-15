"""
🎓 Avaliador de Maturidade Técnica.
Especialista em identificar evidências de engenharia de software de alta qualidade.
"""
import logging

logger = logging.getLogger(__name__)

class MaturityEvaluator:
    """Assistente Técnico: Especialista em Maturidade Técnica PhD."""
    def __init__(self, structural_analyst=None):
        self.structural_analyst = structural_analyst
        logger.debug("🎓 [Maturity] Inicializando avaliador de competência técnica.")

    def evaluate_persona(self, project_root, stack, name):
        """Calcula a maturidade da persona identificada."""
        from pathlib import Path
        logger.info(f"🎓 [Maturity] Analisando DNA da persona: {name} ({stack})")
        
        base_path = Path(project_root) / "src_local" / "agents" / stack
        filename = f"{name.lower()}.py"
        content = None
        
        for f in base_path.rglob(filename):
            try:
                content = f.read_text(encoding='utf-8', errors='ignore')
                if content: break
            except: continue
            
        if not content: return {"score": 0}
        
        if self.structural_analyst:
            return self.structural_analyst.calculate_maturity(content, stack)
        
        return self.calculate_maturity(content, stack)

    def calculate_maturity(self, content: str, stack: str) -> dict:
        """Reporta a evolução técnica usando detecção por presença de padrões core."""
        evidences = {
            "has_telemetry": any(kw in content for kw in ["time.time()", "_log_performance", "logging.getLogger"]),
            "has_reasoning": "_reason_about_objective" in content or "brain.reason" in content,
            "has_pathlib": "Path(" in content or "pathlib" in content,
            "is_linear_syntax": any(kw in content.lower() for kw in ["rules =", "patterns =", "mapping ="])
        }
        
        score = sum(evidences.values())
        logger.debug(f"🎓 [Maturity] Score calculado: {score}/4 para {stack}")
        return {
            "score": score,
            "level": "PROFUNDO" if score >= 3 else ("ESTÁVEL" if score >= 2 else "FRÁGIL"),
            **evidences
        }
