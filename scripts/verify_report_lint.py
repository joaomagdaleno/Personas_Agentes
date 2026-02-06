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
        
        # MD012 (Blanks)
        if not stripped and i > 0 and not lines[i-1].strip():
            errors.append(f"MD012 at {i+1}")
            
        # Headings (MD022, 024, 026)
        if stripped.startswith('#'):
            # Padding
            if i > 0 and lines[i-1].strip(): 
                errors.append(f"MD022 Above at {i+1}")
            if i < len(lines)-1 and lines[i+1].strip(): 
                errors.append(f"MD022 Below at {i+1}")
            # Punctuation
            if re.search(r'[\.\!\?\:]$', stripped): 
                errors.append(f"MD026 at {i+1}")
            # Duplicate
            if stripped in headings: 
                errors.append(f"MD024 Duplicate \"{stripped}\"")
            headings[stripped] = i
            
    return errors

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = verify_markdown_compliance('auto_healing_VERIFIED.md')
    if not res:
        logger.info("SUCCESS: Relatório em conformidade com as normas PhD.")
    else:
        logger.warning(f"ERRORS Detetados: {len(res)}")
        for r in res: 
            logger.error(r)
