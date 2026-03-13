import json

try:
    with open('parity_report_full.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    out = ["Divergent Cases:"]
    for r in d.get('results', []):
        if r['status'] == 'DIVERGENT':
            agent = r.get('agent')
            stack = r.get('stack')
            deltas = r.get('deltas', [])
            reason = deltas[0]['context'] if deltas else "Unknown reason"
            dim = deltas[0]['dimension'] if deltas else "Unknown"
            out.append(f"- {agent} in {stack}: {reason} ({dim})")
    with open('inspection_output_utf8.txt', 'w', encoding='utf-8') as fout:
        fout.write("\n".join(out))
    print("DONE! Wrote to inspection_output_utf8.txt")
except Exception as e:
    print(f"Error: {e}")
