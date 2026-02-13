"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Avaliador de Maturidade (MaturityEvaluator)
Função: Especialista em identificar evidências de engenharia PhD no código.
"""
class MaturityEvaluator:
    """
    Assistente Técnico: Especialista em Maturidade Técnica 🎓
    Extraído do StructuralAnalyst para reduzir entropia.
    """
    def __init__(self, structural_analyst=None):
        self.structural_analyst = structural_analyst

    def evaluate_persona(self, project_root, stack, name):
        """Calcula a maturidade da persona identificada."""
        from pathlib import Path
        
        # Busca recursiva no subdiretório da stack
        base_path = Path(project_root) / "src_local" / "agents" / stack
        filename = f"{name.lower()}.py"
        content = None
        
        for f in base_path.rglob(filename):
            try:
                content = f.read_text(encoding='utf-8', errors='ignore')
                if content: break
            except: continue
            
        if not content: return {"score": 0}

        # Se tiver structural_analyst, usa ele, senão usa lógica fallback simples
        if self.structural_analyst:
            return self.structural_analyst.calculate_maturity(content, stack)
        
        return self.calculate_maturity(content, stack)

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
