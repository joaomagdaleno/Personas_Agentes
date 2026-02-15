"""
SISTEMA DE PERSONAS AGENTES - UTILS
Módulo: Motor de Reflexos PhD (ReflexEnginePhD)
Função: Orquestrar reações autônomas a eventos críticos do sistema.
"""
import logging

logger = logging.getLogger(__name__)

class ReflexEnginePhd:
    """⚡ Motor de Reflexos PhD: Automação de Respostas Sistêmicas."""
    
    @staticmethod
    def trigger(health, personas, job_queue, auditor):
        """Coordena respostas baseadas no estado de saúde."""
        if job_queue is None: job_queue = []
        
        # 1. Cura Ativa (Voyager) - Apenas para arquivos de PRODUÇÃO
        production_blind_spots = [f for f in health.get('blind_spots', []) if health['map'].get(f, {}).get('domain') == 'PRODUCTION']
        if production_blind_spots:
            voyager = next((p for p in personas if p.name == "Voyager"), None)
            if voyager and hasattr(voyager, "perform_active_healing"):
                voyager.perform_active_healing(production_blind_spots)
        
        # 2. Sincronia de Dependências
        has_auditor_task = any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in job_queue)
        if has_auditor_task and auditor:
            auditor.sync_submodule()
            
        # 3. Notificações de Fragilidade
        if health.get('brittle_points'):
            logger.warning(f"⚒️ [Forge] Sistema detectou {len(health['brittle_points'])} pontos de fragilidade!")
