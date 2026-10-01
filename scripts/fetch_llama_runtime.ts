/**
 * 📦 Baixa o runtime Llama.cpp para `bin/`.
 *
 * Contexto: as suítes de SLM (`WarmPurgeOfflineEngine`, `PsaLLMService`, E2E/Parity)
 * procuram `bin/llama-cli.exe` e `bin/llama-server.exe` mais as DLLs `llama*`/`ggml*`.
 * `bin/` é gitignored e nada mais no repositório produzia esses arquivos: eles vinham
 * de um release pré-compilado obtido manualmente. Sem eles, a suíte cai para timeouts
 * de 15–20s e a execução inteira vai de ~32s para ~205s.
 *
 * Decisão do mantenedor (2026-10-01): automatizar o download. Isto ADICIONA uma
 * dependência de terceiros, o que o AGENTS.md §4.7 exige que seja decidido por humano —
 * e foi.
 *
 * Por que isto é seguro por construção:
 *  - a versão é PINADA (TAG fixa), então o conteúdo não muda sozinho;
 *  - o SHA-256 do asset é conferido ANTES de extrair e o script aborta se divergir;
 *  - o download acontece só quando o runtime está incompleto, então rodar de novo é barato.
 *
 * Uso:
 *   bun run fetch-llama              # baixa se faltar
 *   bun run fetch-llama --force      # baixa mesmo se já existir
 *   bun run fetch-llama --check      # apenas reporta o estado, não baixa
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { $ } from "bun";

/** Versão do release. O release estável (v0.5.0) só publica `nightly-tag.txt`; os binários ficam no nightly. */
const RELEASE_TAG = "b11146";
const ASSET_NAME = `llama-${RELEASE_TAG}-bin-win-cpu-x64.zip`;
/** SHA-256 publicado pela API de releases do GitHub para este asset. */
const ASSET_SHA256 = "14cf1303ca9ac3abd94816850532f9f9a69ac66fbaca3776fc6f9061c2fac1d1";
const DOWNLOAD_URL = `https://github.com/ggml-org/llama.cpp/releases/download/${RELEASE_TAG}/${ASSET_NAME}`;

const projectRoot = process.cwd();
const binDir = path.join(projectRoot, "bin");

/** Arquivos que o código realmente procura; se todos existem, não há o que baixar. */
const REQUIRED = [
    "llama-cli.exe",
    "llama-server.exe",
    "llama.dll",
    "ggml.dll",
    "ggml-base.dll",
];

const args = process.argv.slice(2);
const force = args.includes("--force");
const checkOnly = args.includes("--check");

function present(): string[] {
    return REQUIRED.filter((f) => fs.existsSync(path.join(binDir, f)));
}

function report(): void {
    const found = present();
    const llamaArtifacts = fs.existsSync(binDir)
        ? fs.readdirSync(binDir).filter((f) => f.startsWith("llama") || f.startsWith("ggml")).length
        : 0;
    console.log(`📦 [Llama.cpp] release pinado: ${RELEASE_TAG}`);
    console.log(`   obrigatórios presentes: ${found.length}/${REQUIRED.length}`);
    console.log(`   artefatos llama/ggml em bin/: ${llamaArtifacts}`);
    if (found.length < REQUIRED.length) {
        const missing = REQUIRED.filter((f) => !found.includes(f));
        console.log(`   faltando: ${missing.join(", ")}`);
    }
}

report();

if (checkOnly) {
    process.exit(present().length === REQUIRED.length ? 0 : 1);
}

if (present().length === REQUIRED.length && !force) {
    console.log("✅ [Llama.cpp] Runtime já completo — nada a fazer (use --force para rebaixar).");
    process.exit(0);
}

// Só faz sentido no Windows: o asset é um build win-cpu-x64.
if (process.platform !== "win32") {
    console.warn(`⚠️  [Llama.cpp] Plataforma '${process.platform}' não é win32; o asset pinado é Windows x64.`);
    console.warn("    Nada foi baixado. Ajuste RELEASE_TAG/ASSET_NAME para outra plataforma.");
    process.exit(0);
}

fs.mkdirSync(binDir, { recursive: true });
const zipPath = path.join(binDir, `.${ASSET_NAME}`);

console.log(`⬇️  [Llama.cpp] Baixando ${ASSET_NAME} ...`);
const response = await fetch(DOWNLOAD_URL, { redirect: "follow" });
if (!response.ok) {
    console.error(`❌ [Llama.cpp] Download falhou: HTTP ${response.status} ${response.statusText}`);
    console.error(`    URL: ${DOWNLOAD_URL}`);
    process.exit(1);
}

const bytes = new Uint8Array(await response.arrayBuffer());
fs.writeFileSync(zipPath, bytes);
console.log(`   baixado: ${(bytes.length / 1024 / 1024).toFixed(1)} MB`);

// Integridade ANTES de extrair: nunca descompactamos conteúdo não verificado.
const hasher = new Bun.CryptoHasher("sha256");
hasher.update(bytes);
const actual = hasher.digest("hex").toLowerCase();

if (actual !== ASSET_SHA256) {
    fs.rmSync(zipPath, { force: true });
    console.error("❌ [Llama.cpp] SHA-256 divergente — arquivo descartado.");
    console.error(`    esperado: ${ASSET_SHA256}`);
    console.error(`    obtido  : ${actual}`);
    process.exit(1);
}
console.log("🔐 [Llama.cpp] SHA-256 conferido.");

console.log("📂 [Llama.cpp] Extraindo para bin/ ...");
try {
    if (process.platform === "win32") {
        await $`powershell -NoProfile -NonInteractive -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${binDir}' -Force"`.quiet();
    } else {
        await $`unzip -o ${zipPath} -d ${binDir}`.quiet();
    }
} catch (error: any) {
    fs.rmSync(zipPath, { force: true });
    console.error(`❌ [Llama.cpp] Falha ao extrair: ${error?.message ?? error}`);
    process.exit(1);
}

fs.rmSync(zipPath, { force: true });

const found = present();
report();
if (found.length < REQUIRED.length) {
    console.error("❌ [Llama.cpp] Extração concluída mas arquivos obrigatórios ainda faltam.");
    console.error("    O layout do release pode ter mudado; confira o conteúdo do zip.");
    process.exit(1);
}

console.log("✅ [Llama.cpp] Runtime instalado em bin/.");
