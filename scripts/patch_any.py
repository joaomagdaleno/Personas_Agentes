import os
import re

AGENT_DIR = r"c:\Users\João Magdaleno\Documents\GitHub\Personas_Agentes\src_local\agents\TypeScript"

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update execute signature
    # Pattern: execute(context: any)
    new_content = re.sub(r'execute\s*\(\s*context\s*:\s*any\s*\)', 'execute(context: ProjectContext)', content)
    
    # 2. Update reasonAboutObjective (some agents override it)
    # Pattern: reasonAboutObjective(obj: string, f: string, c: any)
    new_content = re.sub(r'reasonAboutObjective\s*\(\s*obj\s*:\s*string\s*,\s*f\s*:\s*string\s*,\s*c\s*:\s*any\s*\)', 
                         'reasonAboutObjective(obj: string, f: string, c: string | Promise<string | null>)', new_content)

    # 3. Add ProjectContext to imports if not present
    # Pattern: import { ..., BaseActivePersona, ... } from "../../base.ts";
    # OR: import { ..., BaseActivePersona, ... } from "../base.ts";
    
    import_match = re.search(r'import\s*\{([^}]+)\}\s*from\s*["\']([^"\']*base\.ts)["\']', new_content)
    if import_match:
        imports = import_match.group(1).split(',')
        imports = [i.strip() for i in imports]
        if 'ProjectContext' not in imports:
            imports.append('ProjectContext')
            new_imports = "import { " + ", ".join(imports) + " } from \"" + import_match.group(2) + "\""
            new_content = new_content.replace(import_match.group(0), new_imports)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for root, dirs, files in os.walk(AGENT_DIR):
    for file in files:
        if file.endswith(".ts"):
            if patch_file(os.path.join(root, file)):
                count += 1

print(f"Patched {count} files.")
