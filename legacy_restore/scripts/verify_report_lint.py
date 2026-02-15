import os, logging, sys
from pathlib import Path

# FBI MODE: Força o Python a ler os arquivos da raiz
current_dir = Path(__file__).parent.parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from scripts.lint_rule_engine import LintRuleEngine

# ✍️ Auditor de Markdown PhD
logger = logging.getLogger(__name__)

def verify_markdown_compliance(path):
    """Garante que o relatório auto_healing segue as normas PhD para Markdown."""
    if not os.path.exists(path): 
        logger.error(f"Arquivo não encontrado: {path}")
        return [f"File not found: {path}"]
    
    with open(path, 'r', encoding='utf-8') as f: 
        lines = f.read().split('\n')
    
    return LintRuleEngine().verify_rules(lines)


def main():
    logging.basicConfig(level=logging.INFO)
    res = verify_markdown_compliance('auto_healing_VERIFIED.md')
    if not res:
        logger.info("SUCCESS: Relatório em conformidade com as normas PhD.")
        return 0
    else:
        logger.warning(f"ERRORS Detetados: {len(res)}")
        for r in res: 
            logger.error(r)
        return 1

if __name__ == "__main__":
    exit(main())