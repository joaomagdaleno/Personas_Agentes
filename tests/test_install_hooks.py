```python
import unittest
from unittest.mock import patch, Mock, call
from scripts.install_hooks import install_pre_commit

class TestInstallPreCommit(unittest.TestCase):
    @patch('subprocess.check_call')
    @patch('os.path.exists')
    def test_install_pre_commit(self, mock_exists, mock_check_call):
        mock_exists.return_value = True
        mock_check_call.return_value = None
        
        install_pre_commit()
        
        # Verifica que o subprocess.check_call foi chamado com o comando correto
        mock_check_call.assert_called_once_with(['pre-commit', 'install'])
        
        # Verifica que os diretórios 'hooks' e 'pre-commit' foram criados
        mock_exists.assert_has_calls([call('hooks'), call('pre-commit')])

if __name__ == '__main__':
    unittest.main()
```