import os
import re

with open('unmerged_files_utf8.txt', 'r', encoding='utf-8') as f:
    files = [line.strip() for line in f if line.strip()]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    # Skip files we already resolved manually if they are in the list
    if 'PatternFinder.ts' in filepath or 'base.ts' in filepath:
        continue

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find the conflict block in personas
    # It looks for <<<<<<< HEAD ... getAuditRules() ... ======= ... performAudit() ... >>>>>>> main
    # We want to keep everything from HEAD and discard from main
    
    conflict_pattern = re.compile(r'<<<<<<< HEAD\s+(.*?)\s+=======\s+(.*?)\s+>>>>>>> main', re.DOTALL)
    
    new_content = content
    matches = list(conflict_pattern.finditer(content))
    
    if matches:
        # We need to process from bottom to top to not break indices
        for match in reversed(matches):
            head_part = match.group(1)
            main_part = match.group(2)
            
            # Heuristic: if HEAD has getAuditRules and main has performAudit, keep HEAD
            if 'getAuditRules' in head_part and 'performAudit' in main_part:
                new_content = new_content[:match.start()] + head_part + new_content[match.end():]
                print(f"Resolved (Persona pattern): {filepath}")
            else:
                print(f"Skipping (Unknown pattern): {filepath}")
    else:
        print(f"No conflict markers found: {filepath}")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
