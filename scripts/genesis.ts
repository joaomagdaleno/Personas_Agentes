import * as fs from "fs";
import * as path from "path";

/**
 * GENESIS: O Motor de Sincronização de DNA (Identity Propagation)
 * Este script garante que a IDENTIDADE dos agentes esteja sincronizada com os blueprints,
 * mas PROTEGE a implementação técnica profunda de cada stack.
 */

const BLUEPRINTS_DIR = "blueprints";

async function synchronizeAll() {
    const blueprints = fs.readdirSync(BLUEPRINTS_DIR).filter(f => f.endsWith(".json"));

    for (const bpFile of blueprints) {
        const bpPath = path.join(BLUEPRINTS_DIR, bpFile);
        const dna = JSON.parse(fs.readFileSync(bpPath, "utf-8"));

        console.log(`🧬 Processando DNA: ${dna.name} (${bpFile})...`);

        for (const [stack, config] of Object.entries(dna.stacks)) {
            const targetPath = (config as any).path;
            if (fs.existsSync(targetPath)) {
                syncIdentity(targetPath, dna, stack);
            } else {
                console.warn(`  ⚠️ Alvo não encontrado para stack ${stack}: ${targetPath}`);
            }
        }
    }
}

function syncIdentity(filePath: string, dna: any, stack: string) {
    console.log(`  🔍 Sincronizando ${stack} em: ${filePath}`);
    let content = fs.readFileSync(filePath, "utf-8");

    // Injeção de Identidade (Constructor)
    const identityMap: any = {
        name: dna.name,
        emoji: dna.emoji,
        role: dna.role,
        phd_identity: dna.phd_identity
    };

    let updated = false;

    // Sincronizar campos básicos no construtor
    for (const [key, val] of Object.entries(identityMap)) {
        const regex = new RegExp(`this\\.${key}\\s*=\\s*["'][^"']*["']`, "g");
        const newVal = `this.${key} = "${val}"`;
        
        if (content.match(regex)) {
             const oldContent = content;
             content = content.replace(regex, newVal);
             if (content !== oldContent) updated = true;
        }
    }

    // Sincronizar System Prompt
    const promptRegex = /getSystemPrompt\(\): string \{[\s\S]*?return `([^`]*)`/g;
    if (promptRegex.test(content)) {
        // console.log(`  🔍 Prompt detectado em ${stack}`);
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ [${stack}] DNA "${dna.name}" injetado com sucesso.`);
    } else {
        console.log(`  💤 [${stack}] Identidade já está em conformidade com o DNA.`);
    }
}

synchronizeAll().catch(console.error);
