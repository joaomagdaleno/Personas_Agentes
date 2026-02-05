import os
import re

def verify_markdown_compliance(path):
    if not os.path.exists(path):
        return f"File not found: {path}"
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
        
    errors = []
    in_code_block = False
    
    # MD012: Multiple blanks (except in code blocks)
    for i in range(2, len(lines)):
        line = lines[i]
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
        
        if not in_code_block:
            if not lines[i].strip() and not lines[i-1].strip() and not lines[i-2].strip():
                # Note: content.split('\n') on A\n\n\nB gives ['', '', '']
                pass
    
    if not in_code_block and '\n\n\n' in content:
        # Simple check for triple newline. 
        # But we must be careful if it's inside a code block.
        # Let's use the line-by-line check.
        pass

    in_code_block = False
    headings = {}
    for i, line in enumerate(lines):
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            continue
            
        if in_code_block:
            continue
            
        # Real heading: starts with # (max 3 spaces indent)
        if re.match(r'^[ ]{0,3}\#+\s+', line):
            h = line.strip()
            
            # MD026: Trailing punctuation
            if re.search(r'[\.\!\?\:]$', h):
                errors.append(f"MD026 Error at line {i+1}: {h}")
            
            # MD024: Duplicate heading
            if h in headings:
                errors.append(f"MD024 Error: Duplicate heading \"{h}\" at lines {headings[h]+1} and {i+1}")
            headings[h] = i
            
            # MD022: Blanks around headings
            if i > 0 and lines[i-1].strip() != '':
                errors.append(f"MD022 Error (Above) at line {i+1}: {line}")
            if i < len(lines) - 1 and lines[i+1].strip() != '':
                errors.append(f"MD022 Error (Below) at line {i+1}: {line}")

    # MD012: More precise check
    in_code_block = False
    blank_count = 0
    for i, line in enumerate(lines):
        if line.strip().startswith('```'):
            in_code_block = not in_code_block
            blank_count = 0
            continue
        if in_code_block:
            continue
            
        if not line.strip():
            blank_count += 1
            if blank_count > 1:
                errors.append(f"MD012 Error: Multiple blanks at line {i+1}")
        else:
            blank_count = 0

    return errors

if __name__ == "__main__":
    results = verify_markdown_compliance('auto_healing_VERIFIED.md')
    if not results:
        print("VERIFICATION SUCCESS: 100% Markdown Compliance.")
    else:
        print(f"Detected {len(results)} errors:")
        for r in results: print(f" - {r}")
