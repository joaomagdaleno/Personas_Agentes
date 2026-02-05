import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(os.getcwd())

from src_local.utils.context_engine import ContextEngine
from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler

def diagnose():
    project_root = Path(os.getcwd())
    support = InfrastructureAssembler.assemble_core_support()
    context_engine = ContextEngine(project_root, support)
    
    print("Analyzing project...")
    context = context_engine.analyze_project()
    
    map_data = context.get("map", {})
    
    blind_spots = [f for f, i in map_data.items() if i.get("silent_error")]
    
    dark_matter = []
    for f, i in map_data.items():
        c_type = i.get("component_type", "UNKNOWN")
        if c_type in ["AGENT", "CORE", "LOGIC", "UTIL"]:
            if not i.get("has_test"):
                dark_matter.append(f)

    print(f"\nBLIND SPOTS (silent_error): {len(blind_spots)}")
    for b in sorted(blind_spots): print(f"  - {b}")
    
    print(f"\nDARK MATTER (no tests): {len(dark_matter)}")
    for d in sorted(dark_matter): print(f"  - {d}")

if __name__ == "__main__":
    diagnose()
