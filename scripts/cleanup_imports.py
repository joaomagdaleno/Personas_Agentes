import os
import re

AGENT_DIR = r"c:\Users\João Magdaleno\Documents\GitHub\Personas_Agentes\src_local\agents\TypeScript"

def cleanup_duplicates(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    seen_imports = set()
    
    # Simple duplicate line remover for specific keywords
    for line in lines:
        if "ProjectContext" in line and "import" in line:
            if "base.ts" in line:
                # Keep the base.ts one if it also has BaseActivePersona
                if "BaseActivePersona" in line:
                    new_lines.append(line)
                    seen_imports.add("ProjectContext")
                else:
                    # If it's just ProjectContext from base.ts, check if we already have it
                    if "ProjectContext" not in seen_imports:
                        new_lines.append(line)
                        seen_imports.add("ProjectContext")
            elif "core/types.ts" in line:
                # If we have it from base.ts, don't keep the types.ts one
                if "ProjectContext" not in seen_imports:
                    new_lines.append(line)
                    seen_imports.add("ProjectContext")
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)

    if len(lines) != len(new_lines):
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    return False

count = 0
for root, dirs, files in os.walk(AGENT_DIR):
    for file in files:
        if file.endswith(".ts"):
            if cleanup_duplicates(os.path.join(root, file)):
                count += 1

print(f"Cleaned up {count} files.")
