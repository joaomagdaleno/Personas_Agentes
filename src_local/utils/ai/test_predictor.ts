import { MicroPredictor } from './MicroPredictor';

async function runTest() {
    console.log("=== Inicializando o MicroPredictor (MicroGPT para Anomalias) ===");

    // 1. O Vocabulário do nosso sistema (Os "Eventos" que ele reconhece)
    const systemEvents = [
        "INIT",
        "READ_FILE",
        "PARSE_AST",
        "CHECK_COMPLEXITY",
        "WARN_HOTSPOT",
        "ERROR_SYNTAX",
        "OOM_CRASH",
        "SUCCESS"
    ];

    const detector = new MicroPredictor(systemEvents);
    console.log(`✓ Instanciado modelo com Vocabulário de ${detector.vocabSize} tokens (incluindo marcador BOS).`);

    // 2. Criando DADOS HISTÓRICOS (O comportamento NORMAL do sistema)
    console.log("\n-> Treinando o modelo com o padrão de COMPORTAMENTO NORMAL...");
    const normalHistory = [
        ["INIT", "READ_FILE", "PARSE_AST", "CHECK_COMPLEXITY", "SUCCESS"],
        ["INIT", "READ_FILE", "PARSE_AST", "WARN_HOTSPOT", "SUCCESS"],
        ["INIT", "READ_FILE", "PARSE_AST", "CHECK_COMPLEXITY", "SUCCESS"],
        ["INIT", "READ_FILE", "PARSE_AST", "CHECK_COMPLEXITY", "WARN_HOTSPOT", "SUCCESS"],
    ];

    // Vamos treinar por algumas épocas para ele fixar as probabilidades matemáticas
    detector.train(normalHistory, 150, 0.05);
    console.log("✓ Treinamento concluído.");

    // 3. Testando o Modelo com Sequências
    console.log("\n=== Testando Sequências na Vida Real ===");

    // Teste A: Uma sequência normal que acabou de ocorrer
    const recentFlowNormal = ["INIT", "READ_FILE", "PARSE_AST", "CHECK_COMPLEXITY", "SUCCESS"];
    const scoreNormal = detector.calculateAnomalyScore(recentFlowNormal);
    console.log(`[Fluxo Saudável] Perplexidade (Loss): ${scoreNormal.toFixed(4)}`);

    // Teste B: Um warning esperado, algo perfeitamente aceitável
    const recentFlowWarning = ["INIT", "READ_FILE", "PARSE_AST", "WARN_HOTSPOT", "SUCCESS"];
    const scoreWarning = detector.calculateAnomalyScore(recentFlowWarning);
    console.log(`[Fluxo c/ Warning Comum] Perplexidade (Loss): ${scoreWarning.toFixed(4)}`);

    // Teste C: Algo muito estranho - Falha de sintaxe em loop
    const flowAnomalyA = ["INIT", "READ_FILE", "ERROR_SYNTAX", "ERROR_SYNTAX", "ERROR_SYNTAX"];
    const scoreAnomalyA = detector.calculateAnomalyScore(flowAnomalyA);
    console.log(`[ANOMALIA A - Syntax Error Loop] Perplexidade (Loss): ${scoreAnomalyA.toFixed(4)}`);

    // Teste D: Falha Crítica
    const flowAnomalyB = ["INIT", "OOM_CRASH"];
    const scoreAnomalyB = detector.calculateAnomalyScore(flowAnomalyB);
    console.log(`[ANOMALIA B - Out Of Memory Crash] Perplexidade (Loss): ${scoreAnomalyB.toFixed(4)}`);

    console.log("\n=== Conclusão do Motor ===");
    const threshold = 1.0; // Um limite de corte hipotético

    [
        { name: "Fluxo Normal", score: scoreNormal },
        { name: "Fluxo Warning", score: scoreWarning },
        { name: "Anomalia A", score: scoreAnomalyA },
        { name: "Anomalia B", score: scoreAnomalyB },
    ].forEach(test => {
        if (test.score > threshold) {
            console.log(`🚨 ALERTA: '${test.name}' disparou o limite de anomalia (${test.score.toFixed(4)} > ${threshold}). Acionar Agente de Auto-Healing!`);
        } else {
            console.log(`✅ OK: '${test.name}' está dentro do padrão estatístico (${test.score.toFixed(4)} <= ${threshold}).`);
        }
    });
}

runTest().catch(console.error);
