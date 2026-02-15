import unittest
import sys
import os
from pathlib import Path

sys.path.insert(0, os.getcwd())

def run_debug():
    tests = sorted([str(f) for f in Path("tests").glob("test_*.py")])
    print(f"Buscando culpado entre {len(tests)} testes...")
    
    loader = unittest.TestLoader()
    for i, t in enumerate(tests, 1):
        mod = t.replace(".py", "").replace(os.sep, ".")
        print(f"[{i}/{len(tests)}] {mod}...", end=" ", flush=True)
        try:
            suite = loader.loadTestsFromName(mod)
            unittest.TextTestRunner(stream=open(os.devnull, 'w'), verbosity=0).run(suite)
            print("OK")
        except Exception as e:
            print(f"ERRO: {e}")

if __name__ == "__main__":
    run_debug()
