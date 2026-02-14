```python
import unittest
from unittest.mock import patch, Mock
from src_local.core.ontology import SystemOntology

class TestSystemOntology(unittest.TestCase):
    @patch('src_local.core.ontology.SomeDependency')
    def test_function(self, MockDependency):
        # Simulando a criação de um objeto de dependência
        mock_dependency = MockDependency.return_value
        
        # Criando uma instância de SystemOntology
        system_ontology = SystemOntology()
        
        # Executando o método que vai ser testado
        result = system_ontology.some_function(mock_dependency)
        
        # Verificando se o método chamou a função correta da dependência
        mock_dependency.some_function.assert_called_once_with(mock_dependency)

if __name__ == '__main__':
    unittest.main()
```