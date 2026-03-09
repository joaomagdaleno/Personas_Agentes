import os
import re

with open('unmerged_files_utf8.txt', 'r', encoding='utf-8') as f:
    files = [line.strip() for line in f if line.strip()]

# Match any branch name after >>>>>>> (usually main, but let's be safe)
conflict_pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> .*\n', re.DOTALL)

for filepath in files:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
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
        for match in reversed(matches):
            head_part = match.group(1)
            main_part = match.group(2)
            
            if 'getAuditRules' in head_part and 'performAudit' in main_part:
                # Add a newline back if it was stripped by group selection
                new_content = new_content[:match.start()] + head_part + "\n" + new_content[match.end():]
                print(f"  Resolved")
            else:
                print(f"  Gap: Pattern not matched in parts")
    else:
        print(f"  No markers found by regex")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  Saved")
    else:
        print(f"  No changes made")
