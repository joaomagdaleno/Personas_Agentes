"""Testes para MetricsAssembler"""
import unittest
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_metrics_assembler")

class TestMetricsAssembler(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.metrics_assembler import MetricsAssembler
        self.assembler = MetricsAssembler()

    def test_gather_qa_data(self):
        result = self.assembler.gather_qa_data({}, {}, [])
        self.assertEqual(result["pyramid"], {})

if __name__ == '__main__': unittest.main()
