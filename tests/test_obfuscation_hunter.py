
import unittest
from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter

class TestObfuscationHunter(unittest.TestCase):
    def test_concatenation_detection(self):
        hunter = ObfuscationHunter()
        
        # Test Case 1: Simple Concatenation
        code1 = 'x = "sh" + "ell=True"'
        findings1 = hunter.scan_file("test1.py", code1)
        self.assertEqual(len(findings1), 1)
        self.assertIn("shell=True", findings1[0]["reconstruction"])

        # Test Case 2: Multi-step Concatenation
        code2 = 'x = "e" + "v" + "al"'
        findings2 = hunter.scan_file("test2.py", code2)
        self.assertEqual(len(findings2), 1)
        self.assertIn("eval", findings2[0]["reconstruction"])

        # Test Case 3: Harmless Concatenation
        code3 = 'msg = "Hello " + "World"'
        findings3 = hunter.scan_file("test3.py", code3)
        self.assertEqual(len(findings3), 0)

        # Test Case 4: Broken Keyword (Should not be detected if parts have it? No, if hidden)
        # "shell" + "=True" -> "shell=True". "shell" is risky? Yes.
        # Logic: if keyword in left OR right, it's NOT hidden.
        code4 = 'x = "shell=" + "True"' 
        # Here "shell" is not strictly in DANGEROUS_KEYWORDS? "shell=True" is.
        # "shell" is not in {eval, exec, shell=True...}
        # So "shell=" doesn't trigger. Combined "shell=True" triggers. 
        # Hidden? Yes.
        findings4 = hunter.scan_file("test4.py", code4)
        self.assertEqual(len(findings4), 1)

if __name__ == '__main__':
    unittest.main()
