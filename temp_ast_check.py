import ast

code = '''
evidences = {
    "has_telemetry": "time.time()" in content,
}
'''
tree = ast.parse(code)
print(ast.dump(tree, indent=2))
