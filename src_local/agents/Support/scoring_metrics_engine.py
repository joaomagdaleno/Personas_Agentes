
import logging

logger = logging.getLogger(__name__)

class ScoringMetricsEngine:
    """Motor Auxiliar para Cálculo de Métricas (Redução de Entropia)."""
    
    def calc_stability(self, map_data):
        # Alinhamento PhD: Componentes CORE, AGENT, LOGIC, UTIL exigem testes.
        # PACKAGE_MARKER e CONFIG são inerentemente estáveis se integrados.
        core_types = ["AGENT", "CORE", "LOGIC", "UTIL"]
        # Soberania de Produto: Ativos funcionais (Core types ou qualquer arquivo com lógica que não seja apenas ferramenta/doc).
        relevant = [i for f, i in map_data.items() if i.get("component_type") in core_types or (i.get("complexity", 1) > 1 and i.get("component_type") not in ["DOC", "INTERFACE", "TEST"])]
        # PACKAGE_MARKER e CONFIG puro permanecem como âncoras soberanas.
        package_markers = [i for f, i in map_data.items() if i.get("component_type") in ["PACKAGE_MARKER", "CONFIG"] and i.get("complexity", 1) <= 1]
        
        covered = [i for i in relevant if i.get("has_test")]
        
        # Stability = (Testados + Marcadores) / (Exigidos + Marcadores)
        # Isso garante que __init__.py contribua para a saúde sem precisar de teste unitário.
        score = ((len(covered) + len(package_markers)) / max(1, len(relevant) + len(package_markers))) * 40
        return score, len(covered) + len(package_markers), len(relevant) + len(package_markers)

    def calc_purity(self, map_data, total):
        avg = sum(i.get("complexity", 1) for i in map_data.values()) / total
        score = max(0, 20 - (max(0, avg - 5) * 1.5))
        return score, avg

    def calc_observability(self, map_data):
        # CONFIG e PACKAGE_MARKER sem lógica (>1) não exigem telemetria ativa.
        # Se houver lógica (>1), a observabilidade é REQUISITO de soberania.
        excluded = ["TEST", "PACKAGE_MARKER", "CONFIG"]
        relevant = [i for f, i in map_data.items() if i.get("component_type") not in excluded or i.get("complexity", 1) > 1]
        tel = [i for i in relevant if i.get("telemetry") or "telemetry" in str(i)]
        score = (len(tel) / max(1, len(relevant))) * 15
        return score, len(tel), len(relevant)

    def calc_security(self, alerts):
        high = [r for r in alerts if isinstance(r, dict) and r.get('severity') in ['critical', 'high']]
        return max(0, 15 - (len(high) * 5)), len(high)

    def calc_excellence(self, map_data, total):
        # Marcadores e Configurações têm propósito inerente pela sua nomenclatura.
        kdoc = sum(1 for f, i in map_data.items() if i.get("purpose") != "UNKNOWN" or i.get("component_type") in ["PACKAGE_MARKER", "CONFIG"])
        score = (kdoc / max(1, total)) * 10
        return score, kdoc
