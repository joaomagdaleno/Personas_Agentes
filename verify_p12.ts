import { Orchestrator } from "./src_local/core/orchestrator";
import { Path } from "./src_local/core/path_utils";
import winston from "winston";

// Configuração básica de log para o teste
winston.configure({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

async function verifyPhase12() {
    const orchestrator = new Orchestrator(".");
    await orchestrator.ready;
    const targetFile = "src_local/core/path_utils.ts";
    
    console.log(`🚀 [Verification] Iniciando validação da Fase 12 para: ${targetFile}`);
    
    // 1. Gerar e Validar Testes Unitários PhD
    const success = await orchestrator.generateTests(targetFile);
    
    if (success) {
        console.log("✅ [Verification] Teste Unitário PhD gerado e validado com sucesso!");
    } else {
        console.log("❌ [Verification] Falha na geração/validação do teste PhD.");
    }

    // 2. Testar Geração de Teste de Integração
    console.log(`🚀 [Verification] Testando Geração de Teste de Integração: orchestrator.ts <-> hub_manager_grpc.ts`);
    const intSuccess = await orchestrator.qaEngineer.generateIntegrationTest(
        "src_local/core/orchestrator.ts",
        "src_local/core/hub_manager_grpc.ts",
        orchestrator
    );

    if (intSuccess) {
        console.log("✅ [Verification] Teste de Integração PhD gerado com sucesso!");
    } else {
        console.log("❌ [Verification] Falha na geração do teste de integração.");
    }
}

verifyPhase12().catch(console.error);
