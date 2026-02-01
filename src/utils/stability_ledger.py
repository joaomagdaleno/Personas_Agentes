import json
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StabilityLedger:
    """Memória de Longo Prazo do Workshop: Rastreia o histórico de feridas e curas."""
    
    def __init__(self, project_root):
        self.path = Path(project_root) / ".gemini" / "stability_ledger.json"
        self.ledger = self._load()

    def _load(self):
        if self.path.exists():
            try:
                return json.loads(self.path.read_text(encoding='utf-8'))
            except:
                return {}
        return {}

    def reset_active_status(self):
        """Marca todos os arquivos instáveis para verificação, permitindo transição para HEALED."""
        for file in self.ledger:
            if self.ledger[file]['status'] == 'UNSTABLE':
                self.ledger[file]['status'] = 'PENDING_VERIFICATION'

    def update(self, audit_results):
        """Detecta recorrência de falhas e confirmação de curas."""
        current_error_files = set()
        for issue in audit_results:
            file = str(issue.get('file', 'N/A')).replace("\\", "/") if isinstance(issue, dict) else "Strategic/DNA"
            current_error_files.add(file)
            
            if file not in self.ledger:
                self.ledger[file] = {"occurrences": 0, "history": [], "status": "UNSTABLE"}
            
            self.ledger[file]["occurrences"] += 1
            self.ledger[file]["history"].append(time.strftime('%Y-%m-%d %H:%M:%S'))
            self.ledger[file]["status"] = "UNSTABLE"

        # Detecção de CURA
        for file in list(self.ledger.keys()):
            if file != "Strategic/DNA" and file not in current_error_files:
                if self.ledger[file].get("status") != "HEALED":
                    logger.info(f"✨ [Memória] Cura confirmada: {file}")
                    self.ledger[file]["status"] = "HEALED"
                    self.ledger[file]["occurrences"] = 0
        
        self._save()
        return self.ledger

    def _save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.ledger, indent=2), encoding='utf-8')

    def get_file_data(self, file_path):
        return self.ledger.get(str(file_path), {})
