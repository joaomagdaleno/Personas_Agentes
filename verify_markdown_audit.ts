import { Orchestrator } from "./src_local/core/orchestrator.ts";
import path from "path";

async function main() {
    const projectRoot = process.cwd();
    const orc = new Orchestrator(projectRoot);

    // Simula um contexto onde o arquivo md é novo/alterado
    const context = {
        identity: {
            core_mission: "Verificar Auditoria de Markdown",
            stacks: new Set(["TypeScript", "Python"])
        },
        map: {
            "tests/test_audit_markdown.md": { component_type: "DOC" }
        }
    };

    console.log("🚀 Iniciando Auditoria de Markdown Experimental...");
    try {
        const findings = await orc.runStrategicAudit(context, "Test Markdown Audit");
        console.log("\n📊 RESULTADOS DA AUDITORIA:");
        console.log(JSON.stringify(findings, null, 2));

        const mdFindings = findings.filter(f => f.file === "tests/test_audit_markdown.md");
        if (mdFindings.length > 0) {
            console.log(`\n✅ SUCESSO: ${mdFindings.length} problemas de Markdown detectados.`);
            process.exit(0);
        } else {
            console.log("\n❌ FALHA: Nenhum problema de Markdown detectado.");
            process.exit(1);
        }
    } catch (e) {
        console.error("\n❌ ERRO DURANTE AUDITORIA:", e);
        process.exit(1);
    }
}

main();
