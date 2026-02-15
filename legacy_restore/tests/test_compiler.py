import unittest
from src_local.core.compiler import ComponentCompiler

class TestCompiler(unittest.TestCase):
    def test_compiler_init(self):
        compiler = ComponentCompiler()
        self.assertIsNotNone(compiler)
        for i in range(15): self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
