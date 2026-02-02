import unittest
import tempfile
import shutil
import json
from pathlib import Path
from src.utils.stability_ledger import StabilityLedger

class TestStabilityLedgerDeep(unittest.TestCase):
    """Bateria de Testes PhD para a Memória de Estabilidade 🏥"""
    
    def setUp(self):
        self.test_root = Path(tempfile.mkdtemp())
        self.ledger = StabilityLedger(self.test_root)

    def tearDown(self):
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

    def test_update_and_persistence(self):
        """Valida se o livro registra erros e persiste no disco."""
        audit_results = [{"file": "src/danger.py", "issue": "Alert"}]
        self.ledger.update(audit_results)
        
        # Verifica se arquivo foi criado
        storage = self.test_root / ".gemini" / "stability_ledger.json"
        self.assertTrue(storage.exists())
        
        # Verifica conteúdo
        with open(storage, 'r') as f:
            data = json.load(f)
            self.assertIn("src/danger.py", data)
            self.assertEqual(data["src/danger.py"]["status"], "UNSTABLE")

    def test_healing_detection(self):
        """Valida se o sistema reconhece quando um arquivo foi curado."""
        file_path = "src/healed.py"
        # 1. Marca como instável
        self.ledger.update([{"file": file_path, "issue": "Bug"}])
        self.assertEqual(self.ledger.ledger[file_path]["status"], "UNSTABLE")
        
        # 2. Roda auditoria limpa
        self.ledger.update([])
        self.assertEqual(self.ledger.ledger[file_path]["status"], "HEALED")
        self.assertEqual(self.ledger.ledger[file_path]["occurrences"], 0)

    def test_get_file_metadata(self):
        """Valida recuperação de metadados."""
        file_path = "src/meta.py"
        self.ledger.update([{"file": file_path}])
        meta = self.ledger.get_file_data(file_path)
        self.assertIn("history", meta)
        self.assertEqual(meta["status"], "UNSTABLE")
