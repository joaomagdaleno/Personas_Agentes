import os
import re

# Read the file and strip the UTF-8 BOM if present
with open('unmerged_files_utf8.txt', 'r', encoding='utf-8-sig') as f:
    files = [line.strip() for line in f if line.strip()]

# Match conflict markers more flexibly
# This regex looks for <<<<<<< HEAD ... ======= ... >>>>>>> [branch]
# with support for both \n and \r\n
conflict_pattern = re.compile(r'<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n(.*?)\r?\n>>>>>>> .*\r?\n', re.DOTALL)

for filepath in files:
    if not os.path.exists(filepath):
        print(f"File not found: '{filepath}'")
        continue
    
    if 'PatternFinder.ts' in filepath or 'base.ts' in filepath:
        continue

    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    matches = list(conflict_pattern.finditer(content))
    
    if matches:
        print(f"  Found {len(matches)} conflicts")
        # Process from bottom to top
        for match in reversed(matches):
            head_part = match.group(1)
            main_part = match.group(2)
            
            # If HEAD has getAuditRules, we keep it. 
            # Sub-personas should only have getAuditRules now.
            if 'getAuditRules' in head_part:
                new_content = new_content[:match.start()] + head_part + "\n" + new_content[match.end():]
                print(f"  Resolved")
            else:
                print(f"  Gap: Pattern 'getAuditRules' not found in HEAD part")
    else:
        print(f"  No markers found by regex")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  Saved")
    else:
        print(f"  No changes made")
