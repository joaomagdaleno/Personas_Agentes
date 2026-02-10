import unittest
import logging
from unittest.mock import patch
from src_local.agents.Support.quality_analyst import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestQualityAnalyst")

class TestQualityanalyst(unittest.TestCase):
    def test_calculate_confidence_matrix(self):
        """Valida a geração da matriz de confiança e status de testes."""
        logger.info("⚡ Testando cálculo da matriz de confiança...")
        qa = QualityAnalyst()
        
        # 1. Módulo com Teste Profundo
        # Precisamos de 19 / 5 = 4 asserções. Vamos simular um teste com 5 asserções.
        map_data = {
            'src_local/agents/Support/veto_rules.py': {
                'complexity': 19, 'component_type': 'CORE'
            },
            'tests/test_veto_rules.py': {
                'component_type': 'TEST', 
                'test_depth': {'assertion_count': 5}
            }
        }
        
        # Simula o conteúdo do arquivo de teste
        test_content = "self.assertTrue(True)\n" * 5
        
        with patch('pathlib.Path.read_text', return_value=test_content):
            matrix = qa.calculate_confidence_matrix(map_data)
            
            self.assertEqual(len(matrix), 1)
            self.assertEqual(matrix[0]['test_status'], 'DEEP')
            self.assertEqual(matrix[0]['assertions'], 5)
            
        # 2. Módulo com Teste Raso
        map_data_shallow = {
            'src_local/agents/Support/veto_rules.py': {
                'complexity': 19, 'component_type': 'CORE'
            },
            'tests/test_veto_rules.py': {
                'component_type': 'TEST', 
                'test_depth': {'assertion_count': 1}
            }
        }
        with patch('pathlib.Path.read_text', return_value="self.assertTrue(True)"):
            matrix = qa.calculate_confidence_matrix(map_data_shallow)
            self.assertEqual(matrix[0]['test_status'], 'SHALLOW')
            
        logger.info("✅ Matriz de confiança validada.")

if __name__ == "__main__":
    unittest.main()
