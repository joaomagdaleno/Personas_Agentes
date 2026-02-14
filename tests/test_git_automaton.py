```python
import unittest
from unittest.mock import MagicMock, patch
from src_local.agents.Support.git_automaton import GitAutomaton

class TestGitAutomaton(unittest.TestCase):
    @patch('src_local.agents.Support.git_automaton.subprocess.run')
    def test_execute_command(self, mock_run):
        automaton = GitAutomaton()
        automaton.execute_command('command')
        mock_run.assert_called_once_with(['command'], capture_output=True, text=True)

if __name__ == '__main__':
    unittest.main(argv=[''], exit=False)
```