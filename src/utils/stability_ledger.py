"""
SISTEMA DE PERSONAS AGENTES - MEMÓRIA DE ESTABILIDADE
Módulo: Livro de Estabilidade (StabilityLedger)
Função: Rastrear o histórico de falhas e sucessos de auto-cura.
Soberania: CORE-MEMORY.
"""
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StabilityLedger:
    """
    Memória de Longo Prazo do Workshop: Rastreia o histórico de feridas e curas 🏥.
    
    Este componente garante a continuidade da consciência entre sessões,
    identificando recorrências de falhas e validando a eficácia das curas aplicadas.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        storage_path = self.project_root / ".gemini" / "stability_ledger.json"
        
        # Agente de Suporte à Persistência
        from src.agents.Support.memory_persistence import MemoryPersistence
        self.persistence = MemoryPersistence(storage_path)
        self.ledger = self.persistence.load_ledger()

    def update(self, audit_results, context_map=None):
        """
        📈 Atualiza o estado de estabilidade do sistema.
        
        Detecta novos focos de instabilidade e confirma se ações anteriores
        resultaram em cura efetiva.
        """
        current_error_files = set()
        context_map = context_map or {}

        try:
            for issue in audit_results:
                file = str(issue.get('file', 'N/A')).replace("\\", "/") if isinstance(issue, dict) else "Strategic/DNA"
                current_error_files.add(file)
                self._update_file_status(file, context_map)

            # Detecção de CURA: Arquivos que estavam instáveis mas não reportaram erros
            self._detect_healed_files(current_error_files)
            
            self.persistence.save_ledger(self.ledger)
            return self.ledger
        except Exception as e:
            logger.error(f"🚨 Falha ao atualizar livro de estabilidade: {e}", exc_info=True)
            return self.ledger

    def _update_file_status(self, file, context_map):
        """Atualiza metadados de instabilidade para um arquivo específico."""
        # Veto de Intencionalidade: Referências (Gold Standard) são imunes a instabilidade
        if context_map.get(file, {}).get("is_gold_standard"):
            if file not in self.ledger:
                self.ledger[file] = {"status": "REFERENCE", "history": ["Identificado como Gold Standard"]}
            return

        if file not in self.ledger:
            self.ledger[file] = {"occurrences": 0, "history": [], "status": "UNSTABLE"}
        
        self.ledger[file]["occurrences"] += 1
        self.ledger[file]["history"].append(time.strftime('%Y-%m-%d %H:%M:%S'))
        self.ledger[file]["status"] = "UNSTABLE"

    def _detect_healed_files(self, current_errors):
        """Compara o estado atual com a memória para confirmar curas."""
        for file in list(self.ledger.keys()):
            if file == "Strategic/DNA" or self.ledger[file].get("status") == "REFERENCE":
                continue
                
            if file not in current_errors and self.ledger[file].get("status") != "HEALED":
                logger.info(f"✨ [Memória] Cura confirmada: {file}")
                self.ledger[file]["status"] = "HEALED"
                self.ledger[file]["occurrences"] = 0

    def get_file_data(self, file_path):
        """Recupera metadados históricos de um arquivo."""
        # Agente de Suporte à Persistência
        from src.agents.Support.memory_persistence import MemoryPersistence
        storage_path = self.project_root / ".gemini" / "stability_ledger.json"
        persistence = MemoryPersistence(storage_path)
        return persistence.get_file_metadata(self.ledger, file_path)
