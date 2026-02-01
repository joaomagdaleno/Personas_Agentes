import json
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StabilityLedger:
    """Memória de Longo Prazo do Workshop: Rastreia o histórico de feridas e curas."""
    
    def __init__(self, project_root):
        storage_path = Path(project_root) / ".gemini" / "stability_ledger.json"
        # Agente de Suporte à Persistência
        from src.agents.Support.memory_persistence import MemoryPersistence
        self.persistence = MemoryPersistence(storage_path)
        self.ledger = self.persistence.load_ledger()

    def reset_active_status(self):
        """Marca todos os arquivos instáveis para verificação, permitindo transição para HEALED."""
        for file in self.ledger:
            if self.ledger[file]['status'] == 'UNSTABLE':
                self.ledger[file]['status'] = 'PENDING_VERIFICATION'

    def update(self, audit_results, context_map=None):
        """Detecta recorrência de falhas e confirmação de curas."""
        current_error_files = set()
        context_map = context_map or {}

        for issue in audit_results:
            file = str(issue.get('file', 'N/A')).replace("\\", "/") if isinstance(issue, dict) else "Strategic/DNA"
            current_error_files.add(file)
            
            # Veto de Intencionalidade: Se for referência, não vira UNSTABLE
            file_info = context_map.get(file, {})
            if file_info.get("is_gold_standard"):
                if file not in self.ledger:
                    self.ledger[file] = {"status": "REFERENCE", "history": ["Identificado como Gold Standard"]}
                continue

            if file not in self.ledger:
                self.ledger[file] = {"occurrences": 0, "history": [], "status": "UNSTABLE"}
            
            self.ledger[file]["occurrences"] += 1
            self.ledger[file]["history"].append(time.strftime('%Y-%m-%d %H:%M:%S'))
            self.ledger[file]["status"] = "UNSTABLE"

        # Detecção de CURA
        for file in list(self.ledger.keys()):
            if file == "Strategic/DNA" or self.ledger[file].get("status") == "REFERENCE":
                continue
                
            if file not in current_error_files:
                if self.ledger[file].get("status") != "HEALED":
                    logger.info(f"✨ [Memória] Cura confirmada: {file}")
                    self.ledger[file]["status"] = "HEALED"
                    self.ledger[file]["occurrences"] = 0
        
        self.persistence.save_ledger(self.ledger)
        return self.ledger

    def get_file_data(self, file_path):
        return self.persistence.get_file_metadata(self.ledger, file_path)
