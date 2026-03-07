import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const projectRoot = process.cwd();

const binaries = [
    {
        name: "Rust Analyzer",
        path: "src_native/analyzer/target/release/analyzer.exe",
        buildDir: "src_native/analyzer",
        buildCmd: "cargo build --release"
    },
    {
        name: "Go Hub",
        path: "src_native/hub/hub.exe",
        buildDir: "src_native/hub",
        buildCmd: "go build -o hub.exe main.go"
    },
    {
        name: "Go Scanner",
        path: "src_native/go-scanner.exe",
        buildDir: "src_native",
        buildCmd: "go build -o go-scanner.exe src_native/main.go" // Adjusted based on previous findings
    }
];

console.log("🔍 Verificando integridade dos binários nativos...");

let allPresent = true;

for (const bin of binaries) {
    const fullPath = path.resolve(projectRoot, bin.path);
    if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️ [MÍSSIL] Binário ausente: ${bin.name} (${bin.path})`);

        try {
            console.log(`🛠️ Tentando compilar ${bin.name}...`);
            execSync(bin.buildCmd, {
                cwd: path.resolve(projectRoot, bin.buildDir),
                stdio: "inherit"
            });
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${bin.name} compilado com sucesso.`);
            } else {
                throw new Error("Binário não encontrado após build.");
            }
        } catch (err) {
            console.error(`❌ Falha ao compilar ${bin.name}.`);
            allPresent = false;
        }
    } else {
        console.log(`✅ ${bin.name} presente.`);
    }
}

if (!allPresent) {
    console.error("\n🚨 ERRO CRÍTICO: Alguns binários nativos obrigatórios não puderam ser verificados ou compilados.");
    console.error("Certifique-se de ter Rust (cargo) e Go instalados para compilar os componentes nativos.");
    process.exit(1);
}

console.log("\n🚀 Todos os binários nativos estão prontos para uso.");
