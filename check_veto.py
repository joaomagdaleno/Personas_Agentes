from src_local.agents.Support.integrity_guardian import IntegrityGuardian
from pathlib import Path

content = Path('src_local/agents/Flutter/echo.py').read_text(encoding='utf-8')
g = IntegrityGuardian()
print(f"Content length: {len(content)}")
print(f"Persona in content? {'persona' in content.lower()}")
print(f"Veto result: {g.detect_vulnerabilities(content, 'AGENT')}")
