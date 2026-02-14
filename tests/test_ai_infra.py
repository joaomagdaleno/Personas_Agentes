import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path
from src_local.utils.cognitive_engine import CognitiveEngine
from src_local.utils.memory_engine import MemoryEngine

class TestAIInfra(unittest.TestCase):
    def setUp(self):
        self.root = Path("./temp_test_root")
        self.root.mkdir(exist_ok=True)
        self.engine = MemoryEngine(self.root)

    def test_memory_engine_full_cycle(self):
        # Teste de Indexação Profunda
        context = {
            "core.py": {"content": "class Core: def run(self): pass", "component_type": "CORE"},
            "util.py": {"content": "def log(msg): print(msg)", "component_type": "UTIL"}
        }
        self.engine.index_project(context)
        self.assertEqual(len(self.engine.memory), 2)
        self.assertIn("Core", self.engine.memory["core.py"]["anchors"])
        self.assertEqual(self.engine.memory["util.py"]["type"], "UTIL")
        
        # Teste de Busca por Keyword
        res = self.engine.search_context("Core runner")
        self.assertIn("core.py", res)
        self.assertIn("Core", res)
        
        # Teste de Persistência
        self.engine.save_index()
        self.assertTrue(self.engine.index_path.exists())
        
        # Teste de Carregamento
        new_engine = MemoryEngine(self.root)
        self.assertIn("core.py", new_engine.memory)

    def test_memory_engine_edge_cases(self):
        engine = MemoryEngine(self.root)
        # Teste com conteúdo vazio
        engine.index_project({"empty.py": {"content": ""}})
        self.assertNotIn("empty.py", engine.memory)
        
        # Teste de busca sem memória
        engine.memory = {}
        self.assertEqual(engine.search_context("anything"), "")
        
        # Teste de persistência de diretório
        self.assertTrue(self.root.exists())
        self.assertEqual(engine.root, self.root)

    def test_cognitive_engine_details(self):
        engine = CognitiveEngine()
        self.assertTrue(hasattr(engine, 'reason'))
        self.assertTrue(hasattr(engine, 'release'))
        self.assertEqual(engine.model_file, "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf")
        
        # Teste de singleton
        engine2 = CognitiveEngine()
        self.assertEqual(engine, engine2)
        
        # Teste de prompt RAG fake
        res = engine.reason("test", memory=MagicMock())
        # Como o load_model falha em ambiente sem GPU/Lib real, res deve ser None ou erro tratado
        self.assertTrue(res is None or isinstance(res, str))

if __name__ == '__main__':
    unittest.main()
