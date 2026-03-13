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

insert_method('src_local/agents/Bun/Audit/testify.ts', 'public override getSystemPrompt(): string { return ""; }')

testify_paths = ['src_local/agents/Go/Audit/testify.ts', 'src_local/agents/Kotlin/Audit/testify.ts', 'src_local/agents/Python/Audit/testify.ts', 'src_local/agents/Rust/Audit/testify.ts']
for p in testify_paths: insert_method(p, 'public isTestFile(f: string): boolean { return false; }')

echo_paths = ['src_local/agents/Flutter/Content/echo.ts', 'src_local/agents/Go/Content/echo.ts', 'src_local/agents/Kotlin/Content/echo.ts', 'src_local/agents/Python/Content/echo.ts']
for p in echo_paths: insert_method(p, 'public Branding(): string { return this.name; }')

forge_paths = ['src_local/agents/Flutter/Content/forge.ts', 'src_local/agents/Go/Content/forge.ts', 'src_local/agents/Kotlin/Content/forge.ts', 'src_local/agents/Python/Content/forge.ts']
for p in forge_paths: insert_method(p, 'public Branding(): string { return this.name; }')

warden_paths = ['src_local/agents/Bun/Strategic/warden.ts', 'src_local/agents/Flutter/Strategic/warden.ts', 'src_local/agents/Go/Strategic/warden.ts', 'src_local/agents/Kotlin/Strategic/warden.ts']
for p in warden_paths: insert_method(p, 'public Branding(): string { return this.name; }')

insert_method('src_local/agents/Rust/Strategic/director.ts', 'public getRes(): any[] { return []; }')
insert_method('src_local/agents/Rust/Strategic/voyager.ts', 'public async healFile(f: string): Promise<void> {}')
