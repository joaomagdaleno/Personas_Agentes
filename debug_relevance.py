from src_local.agents.Support.integrity_guardian import IntegrityGuardian

guardian = IntegrityGuardian()

files = [
    "src_local/agents/Flutter/echo.py",
    "src_local/agents/Flutter/metric.py",
    "forensic_env_24840/upstream_repo/core.py",
    "lib/main.dart",
    "pubspec.yaml"
]

stacks = ["Flutter", "Python", "Universal"]

print("--- Relevance Check ---")
for stack in stacks:
    print(f"Stack: {stack}")
    for f in files:
        rel = guardian.is_relevant_file(f, stack)
        print(f"  {f}: {rel}")
