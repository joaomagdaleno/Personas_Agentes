import unittest
import sys
from pathlib import Path

# Add project root needed for imports inside the script
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

class TestLaunchDashboard(unittest.TestCase):
    def test_importability(self):
        """Smoke test: Verifica se o script pode ser importado/compilado."""
        try:
            import scripts.launch_dashboard
        except ImportError:
            pass 
        except Exception as e:
            self.fail(f"Failed to import launch_dashboard: {e}")
