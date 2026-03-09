import os

# Read the file and strip the UTF-8 BOM if present
with open('unmerged_files_utf8.txt', 'r', encoding='utf-8-sig') as f:
    files = [line.strip() for line in f if line.strip()]

def resolve_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: '{filepath}'")
        return
    
    if 'PatternFinder.ts' in filepath or 'base.ts' in filepath:
        return

    print(f"Processing: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    in_conflict = False
    in_head = False
    head_buffer = []
    main_buffer = []
    
    resolved_any = False

    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            in_head = True
            head_buffer = []
            main_buffer = []
            continue
        elif line.startswith('======='):
            in_head = False
            continue
        elif line.startswith('>>>>>>>'):
            in_conflict = False
            
            # Resolution logic: if head has getAuditRules, keep it
            head_content = "".join(head_buffer)
            if 'getAuditRules' in head_content:
                new_lines.extend(head_buffer)
                resolved_any = True
                print(f"  Resolved conflict block")
            else:
                # If we don't recognize the pattern, keep both for manual review (or markers)
                # But here we want to resolve. To be safe, if we don't know, we keep HEAD.
                new_lines.extend(head_buffer)
                print(f"  Warning: Pattern not matched, kept HEAD as fallback")
            continue
        
        if in_conflict:
            if in_head:
                head_buffer.append(line)
            else:
                main_buffer.append(line)
        else:
            new_lines.append(line)

    if resolved_any:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"  Saved")
    else:
        print(f"  No resolveable conflicts found")

for filepath in files:
    resolve_file(filepath)
