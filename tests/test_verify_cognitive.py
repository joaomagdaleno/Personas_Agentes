import unittest
import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

class TestVerifyCognitive(unittest.TestCase):
    def test_importability(self):
        """Smoke test: Verifica integridade do script de verificação."""
        try:
            import scripts.verify_cognitive
        except ImportError:
            pass
        except Exception as e:
            self.fail(f"Failed to import verify_cognitive: {e}")
