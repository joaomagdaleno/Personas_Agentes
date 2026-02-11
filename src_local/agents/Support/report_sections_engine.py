"""
SISTEMA DE PERSONAS AGENTES - SUPORTE TÉCNICO
Módulo: Motor de Seções de Relatório (ReportSectionsEngine)
Função: Renderizar seções MD densas (Roadmap, Vitais, Entropia).
"""
import logging

logger = logging.getLogger(__name__)

class ReportSectionsEngine:
    def format_vitals_table(self, health_data, infra_label, infra_status):
        blind_count = len(health_data.get('dark_matter', []))
        brittle_count = len(health_data.get('brittle_points', []))
        
        return (f"| Métrica | Status | Impacto |\n| :--- | :--- | :--- |\n"
                f"| **Pontos Cegos** | {blind_count} Arquivos | {'Seguro' if blind_count == 0 else ('Alerta' if blind_count < 10 else 'CRÍTICO')} |\n"
                f"| **Fragilidades** | {brittle_count} Pontos | {'Seguro' if brittle_count == 0 else 'Risco de Colapso'} |\n"
                f"| {infra_label} | {infra_status} | Nível de Maturidade |\n")

    def format_roadmap(self, health_data):
        import time
        start_time = time.time()
        
        breakdown = health_data.get("health_breakdown", {})
        points = []
        
        self._add_purity_points(breakdown, points)
        self._add_stability_points(breakdown, health_data, points)
        self._add_obs_points(breakdown, points)
        self._add_excellence_points(breakdown, points)

        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: Roadmap generation")

        if not points:
            return "> 💎 **Sistema em estado de soberania técnica.** Requisitos de 100% atingidos."
            
        return "### 🗺️ ROADMAP PARA 100% (REQUISITOS)\n\n" + "\n".join(points) + "\n"

    def _add_purity_points(self, b, p):
        drain = 20 - b.get("Purity (Complexity)", 20)
        if drain > 0.05:
            p.append(f"- [ ] **Reduzir Complexidade**: Média atual drena {round(drain, 1)} pts. Simplificar módulos > 15.")

    def _add_stability_points(self, b, data, p):
        drain = 40 - b.get("Stability (Coverage)", 40)
        if drain > 0.05:
            blinds = len(data.get('dark_matter', []))
            brittle = len([f for f in data.get('brittle_points', []) if f not in data.get('dark_matter', [])])
            p.append(f"- [ ] **Expandir Cobertura**: {blinds} ativos sem teste e {brittle} ativos frágeis drenam {round(drain, 1)} pts.")

    def _add_obs_points(self, b, p):
        if b.get("Observability (Telemetry)", 15) < 15:
            p.append(f"- [ ] **Injetar Telemetria**: Universalizar `log_performance` em utilitários e scripts.")

    def _add_excellence_points(self, b, p):
        if b.get("Excellence (Documentation)", 10) < 10:
            p.append(f"- [ ] **Completar Documentação**: Módulos com propósito UNKNOWN detectados.")
