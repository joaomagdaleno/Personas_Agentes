import { parseArgs } from "node:util";
import { Orchestrator } from "../src_local/core/orchestrator.ts";
import { configureLogging } from "../src_local/utils/logging_config.ts";

async function main() {
    const args = parseArgs({
        args: Bun.argv.slice(2),
        options: {
            help: { type: "boolean", short: "h" },
            version: { type: "boolean", short: "v" },
            "auto-heal": { type: "boolean", short: "a" },
            staged: { type: "boolean", short: "s" },
        },
        allowPositionals: true
    });

    if (args.values.help || args.positionals.length === 0) {
        printHelp();
        return;
    }

    const command = args.positionals[0];
    const root = process.cwd();

    configureLogging("info");
    const orchestrator = new Orchestrator(root);
    await orchestrator.ready;

    switch (command) {
        case "diagnostic":
        case "diag":
            console.log("🚀 Iniciando Diagnóstico Completo...");
            await orchestrator.generateFullDiagnostic({
                autoHeal: !!args.values["auto-heal"],
                dryRun: false
            });
            break;
        case "audit":
            console.log("⚖️ Iniciando Auditoria Staged...");
            await orchestrator.runStagedAudit({ dryRun: false });
            break;
        case "maintenance":
            console.log("🔧 Iniciando Manutenção...");
            await orchestrator.runMaintenance();
            break;
        case "parity":
            console.log("📊 Relatório de Paridade:");
            const { ParityAnalyst } = await import("../src_local/agents/Support/Analysis/parity_analyst.ts");
            const analyst = new ParityAnalyst();
            const report = await analyst.analyzeAtomicParity();
            console.log(analyst.getVitalStatus(report));
            console.log("Use --auto-heal para tentar corrigir divergências (experimental).");
            break;
        default:
            console.error(`❌ Comando desconhecido: ${command}`);
            printHelp();
            process.exit(1);
    }

    process.exit(0);
}

function printHelp() {
    console.log(`
🌟 Persona CLI - O Orquestrador Soberano

Uso: bun persona <comando> [opções]

Comandos:
  diagnostic (diag)    Executa o pipeline de diagnóstico completo
  audit               Executa auditoria de arquivos modificados (staged)
  maintenance         Executa tarefas de limpeza e manutenção
  parity              Gera relatório de consistência entre stacks

Opções:
  -h, --help          Mostra esta mensagem
  -a, --auto-heal     Tenta corrigir problemas detectados automaticamente
  -s, --staged        Foca apenas em arquivos no stage do Git (para audit)
`);
}

main();
