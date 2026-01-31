import unittest
import os
import sys
import shutil
from pathlib import Path

# Adiciona o diretório scripts ao path
sys.path.append(os.path.join(os.getcwd(), 'scripts'))
from update_agent_submodule import resolve_conflict_smart

class TestGitResolution(unittest.TestCase):
    def setUp(self):
        self.test_dir = "temp_test_dir"
        os.makedirs(self.test_dir, exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_resolve_skill_conflict_prioritizes_local(self):
        """Garante que em skills, a versão local (entre <<<<<< e =======) seja mantida."""
        # Cria uma pasta skills fictícia
        skill_dir = os.path.join(self.test_dir, "skills")
        os.makedirs(skill_dir, exist_ok=True)
        file_path = os.path.join(skill_dir, "test_skill.md")
        content = (
            "<<<<<<< HEAD\n"
            "Minha skill customizada local\n"
            "=======\n"
            "Versão do upstream que eu não quero\n"
            ">>>>>>> stash\n"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Simula que é um arquivo de skill pelo path
        resolve_conflict_smart(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            final_content = f.read()
        
        self.assertIn("Minha skill customizada local", final_content)
        self.assertNotIn("Versão do upstream", final_content)
        self.assertNotIn("<<<<<<<", final_content)

    def test_resolve_json_conflict_prioritizes_upstream(self):
        """Garante que em JSONs, o upstream seja aceito para evitar quebra de sintaxe."""
        file_path = os.path.join(self.test_dir, "catalog.json")
        content = (
            "<<<<<<< HEAD\n"
            '{"invalid": "local"}\n'
            "=======\n"
            '{"valid": "upstream"}\n'
            ">>>>>>> stash\n"
        )
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        resolve_conflict_smart(file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            final_content = f.read()
        
        self.assertIn('"valid": "upstream"', final_content)
        self.assertNotIn("<<<<<<<", final_content)

if __name__ == '__main__':
    unittest.main()
