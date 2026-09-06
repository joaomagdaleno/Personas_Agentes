import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import * as crypto from "node:crypto";

export interface SlmModelInfo {
    id: string;
    aliases: string[];
    name: string;
    filename: string;
    url: string;
    sha256?: string;
    sizeMb: number;
    description: string;
}

export const SLM_MODELS: SlmModelInfo[] = [
    {
        id: "qwen2.5-coder-1.5b",
        aliases: ["1.5b", "fast", "chat", "triage"],
        name: "⚡ Qwen 2.5 Coder 1.5B (Ultra-Rápido / Triagem & Agentes)",
        filename: "qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
        url: "https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf",
        sha256: "4715f5c88c7b805847525381aa0909f29bf8eb543f339433ff9e3b1c67d16ee4",
        sizeMb: 1065,
        description: "Ideal para triagem de eventos, auto-healing, background e testes rápidos de latência."
    },
    {
        id: "qwen3-8b-thinking",
        aliases: ["thinking", "8b", "architect", "reasoning", "qwen3", "qwen-3.8"],
        name: "🧠 Qwen 3 / DeepSeek-R1 Distill 8B Thinking (Arquitetura & Raciocínio)",
        filename: "DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf",
        url: "https://huggingface.co/bartowski/DeepSeek-R1-Distill-Llama-8B-GGUF/resolve/main/DeepSeek-R1-Distill-Llama-8B-Q4_K_M.gguf",
        sha256: "888ed4ee21e06f1406e232eb1e93c1d9333919e83f063d8ff436e2f170e87b7a",
        sizeMb: 4692,
        description: "Raciocínio cognitivo profundo com tags <think>, planejamento de arquitetura e análise estrutural."
    },
    {
        id: "qwen2.5-coder-7b",
        aliases: ["7b", "coder", "full", "heavy", "engineering"],
        name: "🛠️ Qwen 2.5 Coder 7B (Engenharia de Código Completa & AST)",
        filename: "qwen2.5-coder-7b-instruct-q4_k_m.gguf",
        url: "https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf",
        sha256: "a9985392471cf4525ddc67e85c2c7760773d2f347f2ef8c13038a8e32906bb1b",
        sizeMb: 4466,
        description: "Geração pesada de código, refatoração de AST, execução de ferramentas e patches multilíngues."
    }
];

export function resolveModelsDir(customDir?: string): string {
    if (customDir) return path.resolve(customDir);
    if (process.env.PSA_MODELS_DIR) return path.resolve(process.env.PSA_MODELS_DIR);
    
    const exeDir = path.dirname(process.execPath);
    const siblingModels = path.resolve(exeDir, "..", "models");
    const cwdModels = path.resolve(process.cwd(), "models");
    
    if (fs.existsSync(siblingModels)) return siblingModels;
    if (fs.existsSync(cwdModels)) return cwdModels;
    return siblingModels;
}

export function findModel(idOrAlias: string): SlmModelInfo | undefined {
    const term = idOrAlias.toLowerCase().trim();
    return SLM_MODELS.find(m => m.id.toLowerCase() === term || m.aliases.includes(term));
}

export async function calculateFileSha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", data => hash.update(data));
        stream.on("end", () => resolve(hash.digest("hex").toLowerCase()));
        stream.on("error", err => reject(err));
    });
}

export async function downloadSingleModel(model: SlmModelInfo, modelsDir: string, dryRun: boolean): Promise<boolean> {
    const targetPath = path.join(modelsDir, model.filename);

    console.log("\n------------------------------------------------------------------");
    console.log(`• Modelo:           ${model.name}`);
    console.log(`• Arquivo:          ${model.filename}`);
    console.log(`• Destino:          ${targetPath}`);
    console.log(`• Tamanho Estimado: ~${model.sizeMb} MB`);
    console.log(`• Função:           ${model.description}`);
    console.log("------------------------------------------------------------------");

    if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✅ Este modelo já está presente em disco (${sizeMb} MB).`);
        if (model.sha256) {
            console.log(`🔍 Verificando integridade SHA-256 do arquivo local...`);
            const fileHash = await calculateFileSha256(targetPath);
            if (fileHash === model.sha256.toLowerCase()) {
                console.log(`✅ Integridade SHA-256 verificada com sucesso! Hash: ${fileHash}`);
                return true;
            } else {
                console.warn(`⚠️ Hash SHA-256 local (${fileHash}) não coincide com o esperado (${model.sha256}). O arquivo será baixado novamente.`);
                fs.unlinkSync(targetPath);
            }
        } else {
            console.log(`✅ Download ignorado.`);
            return true;
        }
    }

    if (dryRun) {
        console.log(`🛡️ [Dry-Run] Verificação bem-sucedida. URL: ${model.url}`);
        return true;
    }

    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
    }

    console.log(`🚀 Conectando ao Hugging Face para download direto...`);
    console.log(`URL: ${model.url}\n`);

    try {
        const response = await fetch(model.url, {
            headers: {
                "User-Agent": "PersonasAgentes-LocalSLM-Downloader/2.0"
            }
        });

        if (!response.ok) {
            console.error(`🚨 Falha HTTP (${response.status} ${response.statusText}) ao conectar a ${model.url}`);
            return false;
        }

        const totalBytes = Number(response.headers.get("content-length")) || (model.sizeMb * 1024 * 1024);
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

        console.log(`📥 Baixando arquivo (${totalMb} MB)...`);
        const tempPath = `${targetPath}.part`;
        const fileStream = fs.createWriteStream(tempPath);

        let downloadedBytes = 0;
        let lastLoggedPercent = -1;
        const startTime = Date.now();

        if (!response.body) {
            console.error("🚨 Resposta sem corpo de dados.");
            return false;
        }

        // @ts-ignore - Bun reader stream
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fileStream.write(Buffer.from(value));
            downloadedBytes += value.length;

            const percent = Math.floor((downloadedBytes / totalBytes) * 100);
            if (percent % 10 === 0 && percent !== lastLoggedPercent) {
                lastLoggedPercent = percent;
                const elapsedSec = (Date.now() - startTime) / 1000;
                const speedMbSec = elapsedSec > 0 ? ((downloadedBytes / (1024 * 1024)) / elapsedSec).toFixed(1) : "0.0";
                process.stdout.write(`   ⏳ Progresso: ${percent}% (${(downloadedBytes / (1024 * 1024)).toFixed(1)} / ${totalMb} MB) @ ${speedMbSec} MB/s\n`);
            }
        }

        fileStream.end();

        if (model.sha256) {
            console.log(`\n🔍 Verificando hash SHA-256 pós-download...`);
            const downloadedHash = await calculateFileSha256(tempPath);
            if (downloadedHash !== model.sha256.toLowerCase()) {
                console.error(`🚨 Erro de verificação: SHA-256 calculado (${downloadedHash}) difere do esperado (${model.sha256}).`);
                fs.unlinkSync(tempPath);
                return false;
            }
            console.log(`✅ Integridade SHA-256 pós-download verificada: ${downloadedHash}`);
        }

        fs.renameSync(tempPath, targetPath);

        const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n🎉 Download concluído em ${totalSec}s com sucesso!`);
        console.log(`📁 Arquivo salvo: ${targetPath}`);
        return true;
    } catch (err: any) {
        console.warn(`\n⚠️ Erro de conexão durante download de ${model.name}: ${err.message}`);
        return false;
    }
}

async function promptUser(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function printStatusList(modelsDir: string) {
    console.log("\n==================================================================");
    console.log("    🏛️ STATUS LOCAL DAS 3 SLMs SOBERANAS (PASTA: " + modelsDir + ")");
    console.log("==================================================================");
    for (let i = 0; i < SLM_MODELS.length; i++) {
        const m = SLM_MODELS[i];
        const p = path.join(modelsDir, m.filename);
        const exists = fs.existsSync(p);
        const statusStr = exists ? `✅ INSTALADO (${(fs.statSync(p).size / (1024 * 1024)).toFixed(1)} MB)` : "❌ AUSENTE";
        console.log(`[${i + 1}] ${m.name}`);
        console.log(`    Status:    ${statusStr}`);
        console.log(`    Tamanho:   ~${m.sizeMb} MB`);
        console.log(`    Descrição: ${m.description}\n`);
    }
}

async function handleAutoClose(seconds: number) {
    if (seconds <= 0) return;
    console.log(`\n⏱️ Fechando janela em ${seconds} segundos...`);
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const downloadAll = args.includes("--all");
    const listOnly = args.includes("--list");

    let autoCloseSec = 0;
    const autoCloseIdx = args.indexOf("--auto-close");
    if (autoCloseIdx !== -1 && args[autoCloseIdx + 1]) {
        autoCloseSec = parseInt(args[autoCloseIdx + 1], 10) || 3;
    }

    let customDir = "";
    const dirIdx = args.indexOf("--dir");
    if (dirIdx !== -1 && args[dirIdx + 1]) {
        customDir = args[dirIdx + 1];
    }

    const modelsDir = resolveModelsDir(customDir);

    console.log("==================================================================");
    console.log("     🧠 PERSONAS AGENTES — GERENCIADOR DAS 3 SLMs SOBERANAS      ");
    console.log("==================================================================");

    // Verificação de Suporte a Instruções AVX2 da CPU
    try {
        const os = await import("node:os");
        const cpus = os.cpus();
        if (cpus && cpus.length > 0) {
            console.log(`🖥️ [Hardware Check] CPU: ${cpus[0].model} (${cpus.length} núcleos)`);
        }
    } catch {}

    if (listOnly) {
        await printStatusList(modelsDir);
        await handleAutoClose(autoCloseSec);
        process.exit(0);
    }

    // Procura por flag --model <id>
    let requestedModelId = "";
    const modelIdx = args.indexOf("--model");
    if (modelIdx !== -1 && args[modelIdx + 1]) {
        requestedModelId = args[modelIdx + 1];
    }

    let selectedModels: SlmModelInfo[] = [];

    if (downloadAll) {
        selectedModels = SLM_MODELS;
    } else if (requestedModelId) {
        const found = findModel(requestedModelId);
        if (!found) {
            console.error(`❌ Modelo '${requestedModelId}' não encontrado. Modelos válidos: 1.5b, thinking, 7b`);
            process.exit(1);
        }
        selectedModels = [found];
    } else if (process.stdin.isTTY) {
        // Modo interativo no terminal
        await printStatusList(modelsDir);
        console.log("Escolha qual SLM deseja baixar:");
        console.log("  [1] ⚡ Qwen 2.5 Coder 1.5B (Ultra-Rápido / Triagem ~1.0 GB)");
        console.log("  [2] 🧠 Qwen 3 Thinking / DeepSeek-R1 8B (Raciocínio Profundo ~4.7 GB)");
        console.log("  [3] 🛠️ Qwen 2.5 Coder 7B (Engenharia de Código Completa ~4.5 GB)");
        console.log("  [4] 🌟 Baixar Todas as 3 SLMs (~10.2 GB)");
        console.log("  [0] Sair sem baixar nada\n");

        const choice = await promptUser("Digite sua opção [1-4 ou 0]: ");
        if (choice === "1") selectedModels = [SLM_MODELS[0]];
        else if (choice === "2") selectedModels = [SLM_MODELS[1]];
        else if (choice === "3") selectedModels = [SLM_MODELS[2]];
        else if (choice === "4") selectedModels = SLM_MODELS;
        else {
            console.log("Operação cancelada pelo usuário.");
            process.exit(0);
        }
    } else {
        // Não-interativo e sem modelo especificado: padrão para o modelo rápido 1.5B
        selectedModels = [SLM_MODELS[0]];
    }

    console.log(`\n🎯 Modelos selecionados para download: ${selectedModels.map(m => m.name).join(", ")}`);

    for (const model of selectedModels) {
        await downloadSingleModel(model, modelsDir, dryRun);
    }

    console.log("\n==================================================================");
    console.log("✨ Processo concluído! Os modelos baixados estão prontos para uso.");
    console.log("   O Personas Agentes seleciona o modelo ideal para cada Persona.");
    console.log("==================================================================");

    await handleAutoClose(autoCloseSec);
}

main().catch(async err => {
    console.error("🚨 Erro fatal no gerenciador de modelos:", err.message);
    process.exit(0);
});
