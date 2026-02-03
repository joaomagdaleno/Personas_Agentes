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
    🏥 Livro de Estabilidade PhD.
    A memória de longo prazo do Orquestrador, responsável por catalogar recorrências
    de falhas, validar sucessos de auto-cura e manter a persistência da consciência sistêmica.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        storage_path = self.project_root / ".gemini" / "stability_ledger.json"
        
        # Agente de Suporte à Persistência
        from src_local.agents.Support.memory_persistence import MemoryPersistence
        self.persistence = MemoryPersistence(storage_path)
        self.ledger = self.persistence.load_ledger()

    def update(self, audit_results, context_map=None):
        """
        📈 Sincroniza os achados da auditoria com a memória persistente.
        Identifica novas feridas e confirma a cicatrização de falhas anteriores.
        """
        current_error_files = set()
        context_map = context_map or {}
        is_internal = "Personas_Agentes" in str(self.project_root)

        try:
            # Limpeza preventiva para projetos externos
            if not is_internal and ".agent/skills" in self.ledger:
                del self.ledger[".agent/skills"]

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
        """
        🧬 Atualiza os metadados de instabilidade de um componente.
        Garante que Gold Standards sejam preservados e arquivos instáveis sejam marcados.
        """
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
        """
        ✨ Compara o estado atual com a memória para confirmar curas atômicas.
        Reseta o contador de ocorrências ao validar a integridade restaurada.
        """
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
        from src_local.agents.Support.memory_persistence import MemoryPersistence
        storage_path = self.project_root / ".gemini" / "stability_ledger.json"
        persistence = MemoryPersistence(storage_path)
        return persistence.get_file_metadata(self.ledger, file_path)
