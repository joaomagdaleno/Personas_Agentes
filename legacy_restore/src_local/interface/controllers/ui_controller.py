"""
🎮 Controlador de Interface PhD.
Isola a lógica de negócio da GUI para permitir testes unitários reais e alta cobertura.
"""
import logging

logger = logging.getLogger(__name__)

class UIController:
    """Controlador puramente lógico para orquestração da interface."""
    
    @staticmethod
    def format_finding_text(finding: dict) -> str:
        """Normaliza o texto de um achado para exibição."""
        sev = finding.get("severity", "INFO")
        file = finding.get("file", "Global")
        issue = finding.get("issue", "Problema desconhecido")
        return f"[{sev}] {file}: {issue}"

    @staticmethod
    def get_severity_color(severity: str) -> str:
        """Mapeia severidade para cores hexadecimais."""
        mapping = {
            "CRITICAL": "#cf6679",
            "HIGH": "#cf6679",
            "MEDIUM": "#ffcc00",
            "LOW": "#03dac6"
        }
        return mapping.get(severity, "#ffffff")

    @staticmethod
    def calculate_gauge_extent(health_score: float) -> float:
        """Calcula o arco do gauge (0 a 270 graus)."""
        return (max(0, min(100, health_score)) / 100) * 270
