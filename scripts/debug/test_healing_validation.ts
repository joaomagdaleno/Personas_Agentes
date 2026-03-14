import { StrictPersona } from "../../src_local/agents/TypeScript/Audit/strict";
import { HubManagerGRPC } from "../../src_local/core/hub_manager_grpc";
import { BaseHelpers } from "../../src_local/agents/BaseHelpers";
import * as winston from "winston";
import * as path from "node:path";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()]
});

async function testHealingValidation() {
    logger.info("🚀 Iniciando teste de Healing Validation Loop...");
    
    const root = path.resolve(process.cwd());
    const hub = new HubManagerGRPC();
    
    // Using a persona that supports auditAndHeal
    const agent = new StrictPersona(root);
    
    // Manually initialize tools (since we're running in isolation)
    BaseHelpers.initializeTools(agent, root);
    
    // Configurar o agente com regras que detectem o problema se possível,
    // ou apenas forçar o healing no arquivo alvo.
    logger.info("🛠️ Executando Auditoria e Cura em 'src_local/debug_target.ts'...");
    
    // Simulando findings críticos para forçar o healing
    // Nota: Em um cenário real, o agent.performAudit() detectaria via regex.
    // Aqui vamos interceptar ou simplesmente rodar o ciclo.
    
    // Adicionamos o arquivo ao contexto para o agente saber o que ler
    agent.setContext({
        hub,
        map: {
            "src_local/debug_target.ts": { 
                content: await agent.readProjectFile("src_local/debug_target.ts") || ""
            }
        }
    });

    const result = await agent.auditAndHeal();

    logger.info(`📊 Resultados do Healing: ${result.healingResults.length} arquivos processados.`);
    
    result.healingResults.forEach(r => {
        logger.info(`📄 Arquivo: ${r.file}`);
        logger.info(`   Status: ${r.healed ? '✅ CORRIGIDO' : '❌ FALHOU'}`);
        logger.info(`   Validação: ${r.validation_status}`);
        logger.info(`   Tentativas: ${r.attempts}`);
        if (r.test_output) {
            logger.info(`   Output do Teste: ${r.test_output.substring(0, 200)}...`);
        }
    });

    logger.info("🏁 Teste de Ciclo QA finalizado.");
    process.exit(0);
}

testHealingValidation().catch(err => {
    logger.error(`❌ Erro no teste: ${err}`);
    process.exit(1);
});
