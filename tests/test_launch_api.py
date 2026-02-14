```python
import unittest
from unittest.mock import Mock
from scripts.launch_api import get_status, chat

class TestLaunchApi(unittest.TestCase):
    def test_get_status(self):
        # Mocking the dependency
        mock_dependency = Mock()
        mock_dependency.return_value = "test_status"
        
        # Calling the function with the mocked dependency
        result = get_status(mock_dependency)
        
        # Asserting the result
        self.assertEqual(result, "test_status")
        self.assertEqual(mock_dependency.call_count, 1)

    def test_chat(self):
        # Mocking the dependencies
        mock_dependency = Mock()
        mock_dependency.return_value = "test_chat"
        
        # Calling the function with the mocked dependency
        result = chat(mock_dependency)
        
        # Asserting the result
        self.assertEqual(result, "test_chat")
        self.assertEqual(mock_dependency.call_count, 1)

if __name__ == '__main__':
    unittest.main()
```