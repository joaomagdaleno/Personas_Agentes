import time
import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src_local.utils.parallel_test_executor import ParallelTestExecutor

def measure():
    project_root = os.getcwd()
    test_files = [str(f) for f in list(Path("tests").glob("test_*.py"))]
    
    print(f"🚀 Rodando suíte COMPLETA ({len(test_files)} testes) em lotes controlados...")
    start = time.time()
    
    executor = ParallelTestExecutor()
    results = executor.run_parallel(project_root, test_files)
    
    duration = time.time() - start
    success = len([r for r in results if r.get("success")])
    print(f"\n✅ RESULTADO FINAL:")
    print(f"⏱️ TEMPO: {duration:.2f}s")
    print(f"📊 SUCESSO: {success}/{len(results)}")

if __name__ == "__main__":
    measure()
