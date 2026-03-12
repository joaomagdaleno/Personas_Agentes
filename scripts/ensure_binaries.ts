import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const projectRoot = process.cwd();

function checkVersion(cmd: string, args: string[], regex: RegExp, minVersion: string): boolean {
    try {
        const output = execSync(`${cmd} ${args.join(" ")}`, { stdio: "pipe" }).toString();
        const match = output.match(regex);
        if (match && match[1]) {
            const version = match[1];
            console.log(`✅ [Env] ${cmd} versão detectada: ${version}`);
            
            const vParts = version.split(".").map(Number);
            const minParts = minVersion.split(".").map(Number);
            
            for (let i = 0; i < 2; i++) {
                if ((vParts[i] || 0) > (minParts[i] || 0)) return true;
                if ((vParts[i] || 0) < (minParts[i] || 0)) return false;
            }
            return (vParts[2] || 0) >= (minParts[2] || 0);
        }
    } catch (e) {
        console.warn(`⚠️ [Env] ${cmd} não encontrado.`);
    }
    return false;
}

function verifyEnvironment() {
    console.log("📡 Verificando ambiente de desenvolvimento...");
    
    const goOk = checkVersion("go", ["version"], /go version go(\d+\.\d+\.\d+)/, "1.22.0");
    const rustOk = checkVersion("rustc", ["--version"], /rustc (\d+\.\d+\.\d+)/, "1.75.0");
    const bunOk = checkVersion("bun", ["--version"], /(\d+\.\d+\.\d+)/, "1.1.0");

    if (!goOk || !rustOk || !bunOk) {
        console.error("\n❌ AMBIENTE INCOMPLETO PARA COMPILAÇÃO NATIVA");
        if (!goOk) console.error("   - Go (1.22+) é necessário para o Hub e Scanner.");
        if (!rustOk) console.error("   - Rust/Cargo é necessário para o Analyzer.");
        if (!bunOk) console.error("   - Bun é o runtime recomendado para o Orquestrador.");
        
        console.error("\n💡 Dica: Instale as linguagens e tente novamente.");
        // We don't exit here because some binaries might already be present,
        // but we return false to indicate we can't build new ones.
        return false;
    }
    return true;
}

const envReady = verifyEnvironment();

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
        buildCmd: "go build -o go-scanner.exe scanner/main.go" // Adjusted based on previous findings
    }
];

console.log("🔍 Verificando integridade dos binários nativos...");

let allPresent = true;

for (const bin of binaries) {
    const fullPath = path.resolve(projectRoot, bin.path);
    if (!fs.existsSync(fullPath)) {
        if (!envReady) {
            console.warn(`⚠️ [MÍSSIL] Binário ausente e ambiente incompleto: ${bin.name}. Pulando compilação.`);
            allPresent = false;
            continue;
        }

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
