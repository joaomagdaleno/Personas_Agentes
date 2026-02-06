from src_local.core.orchestrator import Orchestrator
from pathlib import Path

orc = Orchestrator(Path('.'))
ctx = orc.context_engine.analyze_project()
diag = orc.get_system_health_360(ctx, {})

print(f"Brittle count: {len(diag['brittle_points'])}")
print("Files in brittle_points:")
for f in diag['brittle_points']:
    info = ctx['map'].get(f, {})
    print(f"- {f} | Brittle: {info.get('brittle')} | Type: {info.get('component_type')}")
