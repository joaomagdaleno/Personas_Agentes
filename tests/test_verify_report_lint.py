import unittest
from scripts.verify_report_lint import main

class TestVerifyReportLint(unittest.TestCase):
    def test_main_exists(self):
        self.assertTrue(callable(main))

if __name__ == '__main__':
    unittest.main()
