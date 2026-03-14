import os
import re

AGENT_DIR = r"c:\Users\João Magdaleno\Documents\GitHub\Personas_Agentes\src_local\agents\TypeScript"

def verify_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    
    # 1. ProjectContext checking
    if "ProjectContext" not in content and "extends BaseActivePersona" in content:
        # Check if it overrides methods that need ProjectContext
        if "execute(" in content:
             errors.append("Overrides execute but missing ProjectContext import")
    
    # 2. Duplicate ProjectContext imports (Check multiple import lines)
    import_lines = [line for line in content.split('\n') if "ProjectContext" in line and "import" in line]
    if len(import_lines) > 1:
        # Check if it's actually duplicates or just complex imports
        unique_imports = set(import_lines)
        if len(unique_imports) > 1:
             errors.append(f"Potential duplicate/conflicting imports: {len(unique_imports)}")

    # 3. Signature verification for OVERRIDDEN methods
    # Pattern: execute(context: any)
    if re.search(r'execute\s*\(\s*context\s*:\s*any\s*\)', content):
        errors.append("STILL HAS execute(context: any)")
    
    # 4. reasonAboutObjective signature
    if re.search(r'reasonAboutObjective\s*\(\s*[^)]*c\s*:\s*any\s*\)', content):
        errors.append("STILL HAS reasonAboutObjective with 'c: any'")

    # 5. Logic preservation (check for common keywords that should be there)
    if "class" in content and "extends" in content:
        if "constructor" not in content and "BaseActivePersona" not in content:
             errors.append("Class structure might be corrupted")

    # 6. Syntax: Balance of braces
    if content.count('{') != content.count('}'):
        errors.append(f"Syntax error: Braces mismatch ({content.count('{')} vs {content.count('}')})")

    return errors

results = {}
total_files = 0
for root, dirs, files in os.walk(AGENT_DIR):
    for file in files:
        if file.endswith(".ts") and not file.endswith(".test.ts"):
            total_files += 1
            path = os.path.join(root, file)
            errs = verify_file(path)
            if errs:
                results[os.path.relpath(path, AGENT_DIR)] = errs

if not results:
    print(f"VERIFICATION SUCCESS: All {total_files} agents passed the integrity audit.")
else:
    print(f"ISSUES DETECTED IN {len(results)} OF {total_files} FILES:")
    for f, e in results.items():
        print(f"-> {f}: {'; '.join(e)}")
