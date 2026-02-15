import logging
import time

logger = logging.getLogger(__name__)

class DiagnosticStrategist:
    """
    🧠 Estrategista de Diagnóstico PhD.
    O cérebro tático do Orquestrador, responsável por planejar verificações 
    alvo e otimizar a eficiência de I/O durante auditorias de larga escala.
    """
    
    def plan_targeted_verification(self, initial_findings: list) -> dict:
        """
        🎯 Mapeia incidências para evitar redundância na Rodada de Verificação.
        Cria um plano de batalha otimizado focando apenas em componentes suspeitos.
        """
        start_plan = time.time()
        audit_map = {}
        for f in initial_findings:
            if not isinstance(f, dict): continue
            file, agent_name = f.get('file'), f.get('context')
            if file and agent_name:
                if file not in audit_map: audit_map[file] = set()
                audit_map[file].add(agent_name)
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_plan, "⏱️ [Strategist] Plano alvo gerado")
        return audit_map

    def calculate_efficiency(self, total_files: int, targeted_files: int) -> dict:
        """Calcula o ganho de performance da orquestração cirúrgica."""
        if total_files == 0: return {"saved_io": 0, "reduction_ratio": 0}
        
        reduction = ((total_files - targeted_files) / total_files) * 100
        return {
            "total_scope": total_files,
            "targeted_scope": targeted_files,
            "saved_io": round(reduction, 2),
            "efficiency_label": "ALTA" if reduction > 70 else "MODERADA"
        }
