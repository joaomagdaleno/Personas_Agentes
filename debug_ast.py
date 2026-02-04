
import ast
code = 'x = "sh" + "ell=True"'
tree = ast.parse(code)
print(ast.dump(tree, indent=4))

# Quick manual logic check
class ObfuscationHunter:
    def _resolve_string_concat(self, node):
        if isinstance(node, (ast.Str, ast.Constant)):
            val = getattr(node, "value", getattr(node, "s", ""))
            return val if isinstance(val, str) else None
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            left = self._resolve_string_concat(node.left)
            right = self._resolve_string_concat(node.right)
            if left is not None and right is not None:
                return left + right
        return None

hunter = ObfuscationHunter()
for node in ast.walk(tree):
    if isinstance(node, ast.BinOp):
        print(f"Found BinOp: {hunter._resolve_string_concat(node)}")
