from src_local.core.orchestrator import Orchestrator
from pathlib import Path

orc = Orchestrator(Path('.'))
ctx = orc.context_engine.analyze_project()
targets = [
    'scripts/analyze_external.py', 
    'scripts/persona_manager.py', 
    'scripts/run_diagnostic.py', 
    'src_local/agents/base.py', 
    'src_local/core/compiler.py', 
    'src_local/agents/Flutter/echo.py', 
    'src_local/agents/Flutter/metric.py', 
    'src_local/agents/Flutter/scale.py', 
    'src_local/agents/Python/bridge.py', 
    'src_local/agents/Python/hermes.py'
]

print("File | Brittle Flag | Ledger Status | Comp Type")
for t in targets:
    info = ctx['map'].get(t, {})
    led = orc.stability_ledger.ledger.get(t, {})
    print(f"{t} | {info.get('brittle')} | {led.get('status')} | {info.get('component_type')}")
