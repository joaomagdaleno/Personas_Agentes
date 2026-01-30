import unittest
import os
from engine import ConnectionCLI

class TestConnectionCLI(unittest.TestCase):
    def test_init(self):
        cli = ConnectionCLI()
        self.assertIsNotNone(cli.stack)

    def test_decide_agent(self):
        cli = ConnectionCLI()
        self.assertEqual(cli.decide_agent("preciso otimizar performance"), "Bolt")
        self.assertEqual(cli.decide_agent("ajuda com segurança"), "Sentinel")
        self.assertEqual(cli.decide_agent("coisa aleatoria"), "Director")

if __name__ == "__main__":
    unittest.main()
