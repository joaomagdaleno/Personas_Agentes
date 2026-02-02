"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Avaliador de Maturidade (MaturityEvaluator)
Função: Especialista em identificar evidências de engenharia PhD no código.
"""
import logging

logger = logging.getLogger(__name__)

class MaturityEvaluator:
    """
    Assistente Técnico: Especialista em Maturidade Técnica 🎓
    Extraído do StructuralAnalyst para reduzir entropia.
    """
    
    def calculate_maturity(self, content: str, stack: str) -> dict:
        """Reporta a evolução técnica usando detecção por presença de padrões core."""
        evidences = {
            "has_telemetry": "time.time()" in content or "_log_performance" in content,
            "has_reasoning": "_reason_about_objective" in content,
            "has_pathlib": "Path(" in content or "pathlib" in content,
            "is_linear_syntax": "rules =" in content.lower() or "patterns =" in content.lower()
        }
        
        score = sum(evidences.values())
        return {
            "score": score,
            "level": "PROFUNDO" if score >= 3 else ("ESTÁVEL" if score >= 2 else "FRÁGIL"),
            **evidences
        }
