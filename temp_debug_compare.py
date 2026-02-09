import ast
from src_local.agents.Support.logic_auditor import LogicAuditor
from src_local.agents.Support.semantic_context_analyst import SemanticContextAnalyst

code = '''
evidences = {
    "has_telemetry": "time.time()" in content or "_log_performance" in content,
}
'''
tree = ast.parse(code)
for node in ast.walk(tree):
    if hasattr(node, 'lineno'):
        print(f"Line {node.lineno}: {type(node).__name__}")
        if isinstance(node, ast.Compare):
            print(f"  -> Compare found! Left: {ast.dump(node.left)}")

# Now test the actual auditor
auditor = LogicAuditor()
res, reason = auditor.is_interaction_safe(code, 3, "strategic")
print(f"\nResult: {res}, Reason: {reason}")
