import { PredictorEngine } from "../src_local/utils/ai/predictor_engine.ts";
import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

async function run() {
    console.log("🔮 MicroGPT Attention Visualizer");
    const engine = new PredictorEngine(".");

    const sequence = [
        "PIPELINE_START",
        "DISCOVERY_PHASE_START",
        "DISCOVERY_FINDINGS",
        "CENSUS_VALIDATION",
        "COGNITIVE_AUDIT",
        "VALIDATION_PHASE"
    ];

    console.log(`\nAnalisando Sequência: [${sequence.join(" -> ")}]\n`);

    // Trigger evaluation to capture weights
    engine.recordEvent("PIPELINE_START");
    engine.recordEvent("DISCOVERY_PHASE_START");
    engine.recordEvent("DISCOVERY_FINDINGS");
    engine.recordEvent("CENSUS_VALIDATION");
    engine.recordEvent("COGNITIVE_AUDIT");
    engine.recordEvent("VALIDATION_PHASE");

    const score = engine.evaluateCurrentFlow();
    console.log(`Score de Anomalia: ${score.toFixed(4)}`);

    // @ts-ignore - Accessing private for visualization
    const weights = engine.predictor.lastAttentionWeights;

    console.log("\n--- MAPA DE ATENÇÃO NEURAL ---");
    weights.forEach((layer: any, li: number) => {
        console.log(`\n[Camada ${li}]`);
        layer.forEach((head: any, hi: number) => {
            console.log(`  Head ${hi}:`);
            let row = "    ";
            head.forEach((w: number, i: number) => {
                const intens = Math.round(w * 10);
                const bar = "█".repeat(intens) + "░".repeat(10 - intens);
                row += `[E${i}] ${bar} (${w.toFixed(2)})  `;
                if ((i + 1) % 4 === 0) {
                    console.log(row);
                    row = "    ";
                }
            });
            if (row.trim()) console.log(row);
        });
    });

    console.log("\nInterpretação: Blocos mais escuros indicam maior foco da rede naquele evento específico para prever o próximo passo.");
}

run();
