import hashlib
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class FindingDeduplicator:
    """
    🔬 Assistente de Deduplicação Forense.
    Centraliza a lógica complexa de normalização e filtragem de achados diagnosticados.
    """
    
    def __init__(self):
        self.severity_rank = {
            "CRITICAL": 5, "HIGH": 4, "MEDIUM": 3, 
            "LOW": 2, "STRATEGIC": 1, "HEALED": 0
        }

    def deduplicate(self, all_raw_findings):
        """Deduplica achados baseado em coordenada absoluta (arquivo, linha, issue)."""
        coordinate_map = {}
        
        for f in all_raw_findings:
            if not isinstance(f, dict):
                self._handle_raw_text(f, coordinate_map)
                continue
            
            self._handle_finding_dict(f, coordinate_map)
            
        return list(coordinate_map.values())

    def _handle_raw_text(self, f, coordinate_map):
        """Gera hash para alertas de texto puro e armazena se for novo."""
        f_hash = hashlib.md5(str(f).encode('utf-8')).hexdigest()
        if f_hash not in coordinate_map:
            coordinate_map[f_hash] = f

    def _handle_finding_dict(self, f, coordinate_map):
        """Normaliza achados em dicionário e resolve conflitos por severidade."""
        clean_path = self._normalize_path(f.get('file', 'global'))
        f_line = f.get('line', 0)
        f_issue = f.get('issue', 'Unknown Issue')
        f_sev = f.get('severity', 'MEDIUM').upper()
        
        coord = (clean_path, f_line, f_issue)
        
        if coord not in coordinate_map:
            coordinate_map[coord] = f
        else:
            self._resolve_severity_conflict(coord, f, coordinate_map)

    def _normalize_path(self, raw_path):
        """Normaliza o caminho para formato POSIX."""
        try:
            return str(Path(raw_path).as_posix()).replace("\\", "/")
        except:
            return raw_path

    def _resolve_severity_conflict(self, coord, new_finding, coordinate_map):
        """Mantém apenas o achado com maior severidade para a mesma coordenada."""
        existing = coordinate_map[coord]
        if not isinstance(existing, dict): return
        
        new_sev = new_finding.get('severity', 'MEDIUM').upper()
        existing_sev = existing.get('severity', 'MEDIUM').upper()
        
        if self.severity_rank.get(new_sev, 3) > self.severity_rank.get(existing_sev, 3):
            coordinate_map[coord] = new_finding
