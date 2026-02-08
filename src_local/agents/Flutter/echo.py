"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO FLUTTER
Módulo: Eco de Observabilidade (Echo)
Função: Auditar rastreabilidade, logs estruturados e tratamento de erros em Dart.
Soberania: ACTIVE-AGENT.
"""
from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: PhD in System Observability & Real-time Telemetry (Flutter) 🗣️
    
    Responsabilidades:
    1. Rastreabilidade: Garante que o fluxo de execução seja logado.
    2. Gestão de Erros: Detecta blocos catch vazios ou print() genéricos.
    3. Telemetria: Assegura que falhas críticas gerem eventos estruturados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Echo", "🗣️", "PhD Observability Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Visibilidade e Rastreabilidade Flutter...")
        
        audit_rules = [
            {'regex': r"print\(", 'issue': 'Aviso: Uso de print() em vez de log() do developer ou logger.', 'severity': 'medium'},
            {'regex': r"catch\s*\(\w+\)\s*\{\s*\}", 'issue': 'Cegueira: Ponto Cego detectado em Dart (except empty).', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Echo agora delega a auditoria de observabilidade para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em telemetria e rastro digital Flutter."
