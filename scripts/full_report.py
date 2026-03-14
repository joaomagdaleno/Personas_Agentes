import json

with open('parity_report_full.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

out = []
out.append("=" * 70)
out.append("RELATORIO COMPLETO DE PARIDADE ATOMICA")
out.append("=" * 70)
out.append(f"Timestamp: {d.get('timestamp', 'N/A')}")
out.append(f"Total Agentes: {d.get('totalAgents', 'N/A')}")
out.append(f"Total Instancias: {d.get('totalInstances', 'N/A')}")
out.append(f"Simetricas: {d.get('symmetricCount', 'N/A')}")
out.append(f"Divergentes: {d.get('divergentCount', 'N/A')}")
out.append(f"Paridade Geral: {d.get('overallParity', 'N/A')}%")

out.append("")
out.append("-" * 70)
out.append("POR STACK:")
out.append("-" * 70)
by_stack = d.get('byStack', {})
for stack in sorted(by_stack.keys()):
    info = by_stack[stack]
    out.append(f"  {stack:15s} | Total: {info['total']:3d} | Simetricas: {info['symmetric']:3d} | Paridade: {info['parity']}%")

out.append("")
out.append("-" * 70)
out.append("POR CATEGORIA:")
out.append("-" * 70)
by_cat = d.get('byCategory', {})
for cat in sorted(by_cat.keys()):
    info = by_cat[cat]
    out.append(f"  {cat:15s} | Total: {info['total']:3d} | Simetricas: {info['symmetric']:3d} | Paridade: {info['parity']}%")

out.append("")
out.append("-" * 70)
out.append("COBERTURA POR AGENTE:")
out.append("-" * 70)
coverage = d.get('coverage', [])
for c in sorted(coverage, key=lambda x: x['agent']):
    stacks = sorted(c['stacks'])
    out.append(f"  {c['agent']:15s} -> {', '.join(stacks)} ({len(stacks)} stacks)")

out.append("")
out.append("-" * 70)
out.append("TODAS AS INSTANCIAS (Status Individual):")
out.append("-" * 70)
results = d.get('results', [])
for r in sorted(results, key=lambda x: (x['agent'], x['stack'])):
    agent = r.get('agent', '?')
    stack = r.get('stack', '?')
    status = r.get('status', '?')
    score = r.get('score', '?')
    cat = r.get('category', '?')
    deltas_count = len(r.get('deltas', []))
    marker = 'OK' if status == 'IDENTICAL' else 'DIVERGENT'
    out.append(f"  {agent:15s} | {stack:12s} | {cat:10s} | Score: {score:3d} | {marker} | Deltas: {deltas_count}")

out.append("")
out.append("-" * 70)
if d.get('divergentCount', 0) > 0:
    out.append("DELTAS CRITICOS:")
    out.append("-" * 70)
    for r in results:
        if r['status'] == 'DIVERGENT':
            for delta in r.get('deltas', []):
                out.append(f"  {r['agent']} ({r['stack']}): {delta.get('context', '?')} [{delta.get('dimension', '?')}] - {delta.get('severity', '?')}")
else:
    out.append("ZERO DELTAS CRITICOS - PARIDADE ATOMICA TOTAL!")
    out.append("-" * 70)

out.append("")
out.append("NOTA: Fingerprint executado via LOCAL FALLBACK (Hub gRPC offline).")
out.append("O extrator utilizou regex local do ParserHelpers para determinar")
out.append("assinaturas de metodos e classes sem o hub nativo Go/Rust.")
out.append("=" * 70)

text = "\n".join(out)
with open('parity_full_detailed.txt', 'w', encoding='utf-8') as fout:
    fout.write(text)
print("Relatorio salvo em parity_full_detailed.txt")
print(f"Total: {len(out)} linhas")
