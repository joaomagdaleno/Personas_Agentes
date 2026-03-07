import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

function analyze(filePath: string) {
    const projectRoot = process.cwd();
    const binaryPath = path.resolve(projectRoot, "src_native/analyzer/target/release/analyzer.exe");

    if (!fs.existsSync(binaryPath)) {
        console.error(`❌ [ERROR] Binário nativo não encontrado em: ${binaryPath}`);
        console.error(`🛠️  Execute 'cargo build --release' em 'src_native/analyzer' primeiro.`);
        process.exit(1);
    }

    try {
        // Quoting path for Windows compatibility (spaces in username)
        const output = cp.execSync(`"${binaryPath}" analyze "${filePath}"`, { encoding: "utf8" });
        const result = JSON.parse(output);

        console.log(`\nComplexity breakdown for ${filePath} (Native Rust Analyzer):`);

        if (result.functions && result.functions.length > 0) {
            result.functions.sort((a: any, b: any) => b.score - a.score).forEach((r: any) => {
                console.log(`  Line ${r.line}: ${r.name} - Score: ${r.score}, Nesting: ${r.nesting}`);
            });
        } else {
            console.log("  No functions detected or file is purely linear.");
        }

        console.log(`\nSummary:`);
        console.log(`  Total Complexity: ${result.total_complexity}`);
        console.log(`  LOC: ${result.loc} | SLOC: ${result.sloc} | Comments: ${result.comments}`);

    } catch (err: any) {
        console.error(`❌ [FATAL] Erro na análise nativa: ${err.message}`);
        process.exit(1);
    }
}

const file = process.argv[2];
if (file) {
    analyze(file);
} else {
    console.log("Usage: bun run scripts/find_complex_funcs.ts <file>");
}
