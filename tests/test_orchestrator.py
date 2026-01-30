import unittest
import os
import shutil
import tempfile
from orchestrator import ProjectOrchestrator
from director_persona import DirectorPersona

class TestProjectOrchestrator(unittest.TestCase):
    def setUp(self):
        # Cria um diretório temporário para simular um projeto
        self.test_dir = tempfile.mkdtemp()
        
    def tearDown(self):
        # Remove o diretório temporário
        shutil.rmtree(self.test_dir)

    def test_detect_project_stage_genesis(self):
        # Genesis: < 20 arquivos
        orchestrator = ProjectOrchestrator(self.test_dir)
        stage = orchestrator.detect_project_stage()
        self.assertEqual(stage, "GENESIS (MVP)")

    def test_detect_project_stage_evolution(self):
        # Evolution: > 20 arquivos e < 10% testes
        for i in range(25):
            with open(os.path.join(self.test_dir, f"file_{i}.py"), 'w') as f:
                f.write("# dummy file")
        
        orchestrator = ProjectOrchestrator(self.test_dir)
        stage = orchestrator.detect_project_stage()
        self.assertEqual(stage, "EVOLUTION (DÍVIDA TÉCNICA)")

    def test_prepare_mission_package(self):
        orchestrator = ProjectOrchestrator(self.test_dir)
        orchestrator.job_queue = [
            {'file': 'test.py', 'issue': 'Bug found', 'severity': 'high'}
        ]
        mission = orchestrator.prepare_mission_package()
        self.assertIsNotNone(mission)
        self.assertIn("MISSÃO DE REPARO", mission)
        self.assertIn("test.py", mission)
        self.assertIn("Bug found", mission)

if __name__ == "__main__":
    unittest.main()
