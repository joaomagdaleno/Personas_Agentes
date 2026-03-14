import os
import re

AGENT_DIR = r"c:\Users\João Magdaleno\Documents\GitHub\Personas_Agentes\src_local\agents\TypeScript"

def verify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # 1. Check for ProjectContext in imports
    if "ProjectContext" not in content:
        errors.append("Missing ProjectContext")
        
    # 2. Check for multiple ProjectContext imports
    import_count = len(re.findall(r'import\s*\{[^}]*ProjectContext[^}]*\}', content))
    if import_count > 1:
        errors.append(f"Duplicate ProjectContext imports ({import_count})")
        
    # 3. Check for execute(context: ProjectContext)
    if "execute(context: ProjectContext)" not in content:
        errors.append("execute signature not updated correctly")
        
    # 4. Check for logic markers (performAudit or reasonAboutObjective)
    if not (re.search(r'this\.performAudit\(', content) or re.search(r'reasonAboutObjective', content)):
        errors.append("Potential logic corruption: performAudit/reasonAboutObjective missing")

    # 5. Check for basic syntax (braces balance)
    if content.count('{') != content.count('}'):
        errors.append(f"Syntax error: Braces mismatch ({content.count('{')} vs {content.count('}')})")

    return errors

results = {}
for root, dirs, files in os.walk(AGENT_DIR):
    for file in files:
        if file.endswith(".ts"):
            path = os.path.join(root, file)
            errs = verify_file(path)
            if errs:
                results[os.path.relpath(path, AGENT_DIR)] = errs

if not results:
    print("ALL CLEAR: No corruption detected in any agent.")
else:
    print(f"ISSUES DETECTED IN {len(results)} FILES:")
    for f, e in results.items():
        print(f": {', '.join(e)}")
