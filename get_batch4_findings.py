
import json

from typing import List, Dict, Any

with open('parity_report_full.json', 'r') as f:
    data: Dict[str, Any] = json.load(f)

# Collect all divergent results
results: List[Dict[str, Any]] = data.get('results', [])
divergent: List[Dict[str, Any]] = [r for r in results if r.get('status') == 'DIVERGENT']

# Sort by score (ascending) and then by number of deltas (descending)
divergent.sort(key=lambda x: (float(x.get('score', 0)), -len(x.get('deltas', []))))

# Get next 10
batch_size = 10
findings: List[Dict[str, Any]] = []

count = 0
for r in divergent:
    if count >= batch_size:
        break
    findings.append({
        "agent": r.get('agent'),
        "stack": r.get('stack'),
        "score": r.get('score'),
        "deltas": r.get('deltas')
    })
    count += 1

with open('next_10_batch4.json', 'w', encoding='utf-8') as f:
    json.dump(findings, f, indent=2, ensure_ascii=False)

print(f"Generated next_10_batch4.json with {len(findings)} findings.")
