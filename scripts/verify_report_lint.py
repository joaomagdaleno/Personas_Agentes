import os, re, logging

# ✍️ Auditor de Markdown PhD
logger = logging.getLogger(__name__)

def verify_markdown_compliance(path):
    """Garante que o relatório auto_healing segue as normas PhD para Markdown."""
    if not os.path.exists(path): 
        logger.error(f"Arquivo não encontrado: {path}")
        return [f"File not found: {path}"]
    
    with open(path, 'r', encoding='utf-8') as f: 
        lines = f.read().split('\n')
    
    errors, headings, in_cb = [], {}, False
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('```'):
            in_cb = not in_cb
            continue
        
        if in_cb: continue
        
        # Regra MD012: Linhas em branco consecutivas
        if _is_consecutive_blank(lines, i):
            errors.append(f"MD012 at {i+1}")
            
        # Regras de Headings
        if stripped.startswith('#'):
            errors.extend(_check_heading_rules(lines, i, stripped, headings))
            headings[stripped] = i
            
    return errors

def _is_consecutive_blank(lines, i):
    """Checa se há mais de uma linha em branco seguida."""
    if i == 0: return False
    return not lines[i].strip() and not lines[i-1].strip()

def _check_heading_rules(lines, i, text, headings):
    """Agrupa validações MD022, MD024 e MD026 para headings."""
    errs = []
    # MD022: Espaçamento ao redor de headings
    if i > 0 and lines[i-1].strip(): 
        errs.append(f"MD022 Above at {i+1}")
    if i < len(lines)-1 and lines[i+1].strip(): 
        errs.append(f"MD022 Below at {i+1}")
    
    # MD026: Pontuação proibida no final
    if re.search(r'[\.\!\?\:]$', text): 
        errs.append(f"MD026 at {i+1}")
        
    # MD024: Heading duplicado no mesmo nível
    if text in headings: 
        errs.append(f"MD024 Duplicate \"{text}\"")
        
    return errs

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