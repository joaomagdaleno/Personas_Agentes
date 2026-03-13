def insert_method(filepath, method_str):
    try:
        with open(filepath, 'r', encoding='utf-8') as f: lines = f.readlines()
        insert_idx = -1
        for i in range(len(lines)-1, -1, -1):
            if lines[i].strip() == '}':
                insert_idx = i
                break
        if insert_idx != -1:
            lines.insert(insert_idx, f'    {method_str}\n')
            with open(filepath, 'w', encoding='utf-8') as f: f.writelines(lines)
            print(f'Patched {filepath}')
    except Exception as e:
        print(f'Failed {filepath}: {e}')

testify_paths = ['src_local/agents/Go/Audit/testify.ts', 'src_local/agents/Kotlin/Audit/testify.ts', 'src_local/agents/Python/Audit/testify.ts', 'src_local/agents/Rust/Audit/testify.ts']
for p in testify_paths: insert_method(p, 'public getTestedModules(): string[] { return []; }')

insert_method('src_local/agents/Rust/Strategic/director.ts', 'public getHotspots(): any[] { return []; }')
insert_method('src_local/agents/Bun/Strategic/warden.ts', 'public override selfDiagnostic(): any { return {}; }')
