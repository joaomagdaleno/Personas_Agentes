import { HubManagerGRPC } from "../../src_local/core/hub_manager_grpc";
import * as winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [new winston.transports.Console()]
});

async function testSwarm() {
    logger.info("🚀 Iniciando teste de Swarm Intelligence...");
    
    const hub = new HubManagerGRPC();
    
    // 1. Escutar eventos do Hub
    logger.info("📡 Conectando ao fluxo de eventos do Hub...");
    hub.watchEvents((event) => {
        logger.info(`🔔 Evento Recebido: [${event.type}] em ${event.path || 'N/A'}`);
        if (event.data) {
            try {
                const data = JSON.parse(event.data);
                logger.info(`   Raw Data: ${JSON.stringify(data, null, 2)}`);
            } catch (e) {}
        }
    });

    // Aguardar conexão
    await new Promise(r => setTimeout(r, 2000));

    // 2. Simular Sinal de Broadcase
    logger.info("📢 Enviando sinal: DEPLOY_READY...");
    const signalSent = await hub.broadcastSignal("voyager", "DEPLOY_READY", {
        version: "2.5.0",
        stability_score: 0.98
    });
    logger.info(`✅ Sinal enviado: ${signalSent}`);

    // 3. Simular Pedido de Peer Review
    logger.info("🤝 Solicitando Peer Review: Performance...");
    const reviewRes = await hub.requestPeerReview(
        "director",
        "performance",
        "src_local/core/orchestrator.ts",
        "Análise de latência no coletor de resultados.",
        "HIGH"
    );
    logger.info(`✅ Pedido de Review enviado: ${JSON.stringify(reviewRes)}`);

    // Aguardar para ver os eventos chegarem
    logger.info("⏳ Aguardando eventos por 5 segundos...");
    await new Promise(r => setTimeout(r, 5000));
    
    logger.info("🏁 Teste finalizado.");
    process.exit(0);
}

testSwarm().catch(err => {
    logger.error(`❌ Erro no teste: ${err}`);
    process.exit(1);
});
