from pathlib import Path

class TestMapper:
    """
    🧠 Mapeador Heurístico de Testes.
    Vincula arquivos de produção a suas suítes de teste correspondentes.
    """
    def map_files_to_tests(self, project_root: str, changed_files: list) -> list:
        root = Path(project_root)
        test_dir = root / "tests"
        selected_tests = set()

        for f in changed_files:
            p = Path(f)
            basename = p.stem
            
            # Heurística 1: test_<basename>.py
            direct_match = test_dir / f"test_{basename}.py"
            if direct_match.exists():
                selected_tests.add(direct_match)
                continue
            
            # Heurística 2: <basename>_persona.py -> test_<basename>_persona.py
            persona_match = test_dir / f"test_{basename}_persona.py"
            if persona_match.exists():
                selected_tests.add(persona_match)
                continue

            # Heurística 3: Mapeamento de sistema (se mudar o core, roda testes core)
            if "src_local/core" in str(f):
                selected_tests.add(test_dir / "test_orchestrator.py")
                selected_tests.add(test_dir / "test_validator.py")
        
        return list(selected_tests)
