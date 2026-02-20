import { $ } from "bun";
import { join } from "node:path";
import { existsSync } from "node:fs";

/**
 * Port of update_git.ps1 to Bun/TypeScript.
 * Handles Git synchronization for the .agent submodule.
 */

async function main() {
    const rootDir = process.cwd();
    const submodulePath = join(rootDir, "..", ".agent");
    const upstreamUrl = "https://github.com/google-gemini/skills.git";

    if (!existsSync(submodulePath)) {
        console.error(`\x1b[31m❌ Submódulo .agent não encontrado em: ${submodulePath}\x1b[0m`);
        return;
    }

    console.log(`\x1b[36m🔄 Iniciando Sincronização de Git no Submódulo...\x1b[0m`);

    try {
        // 1. Change to submodule directory
        process.chdir(submodulePath);

        // 2. Garantir que o upstream existe
        const remotes = await $`git remote`.text();
        if (!remotes.includes("upstream")) {
            console.log(`\x1b[90m➕ Adicionando remote upstream...\x1b[0m`);
            await $`git remote add upstream ${upstreamUrl}`;
        }

        // 3. Buscar atualizações do upstream
        console.log(`\x1b[90m📡 Buscando novidades do upstream...\x1b[0m`);
        await $`git fetch upstream`;

        // 4. Atualizar a branch 'main' do Fork
        console.log(`\x1b[90m🌿 Sincronizando branch 'main'...\x1b[0m`);
        await $`git checkout main`;
        await $`git merge upstream/main --no-edit`;
        await $`git push origin main`;

        // 5. Atualizar a branch 'minhas-regras' com o que veio da main
        console.log(`\x1b[90m🌿 Sincronizando branch 'minhas-regras'...\x1b[0m`);
        await $`git checkout minhas-regras`;
        await $`git merge upstream/main --no-edit`;
        await $`git push origin minhas-regras`;

        console.log(`\x1b[32m✅ Submódulo sincronizado com sucesso!\x1b[0m`);
    } catch (err) {
        console.error(`\x1b[31m🚨 Erro na sincronização:\x1b[0m`, err);
    } finally {
        process.chdir(rootDir);
    }
}

main();
