import { Orchestrator } from "./src_local/core/orchestrator";

async function main() {
    const orc = new Orchestrator(".");
    
    console.log("🔍 Debugando novas métricas de penalidade...");
    
    const ctx = await orc.contextEngine.analyzeProject();
    
    const { QualityAnalyst } = await import("./src_local/agents/Support/Diagnostics/quality_analyst");
    const qa = new QualityAnalyst();
    const matrix = qa.calculateConfidenceMatrix(ctx.map);
    
    // Contadores para cada penalidade
    let ccHigh = 0, cognitiveHigh = 0, nestingDeep = 0, cboHigh = 0;
    let miLow = 0, defectHigh = 0, riskCritical = 0, gateRed = 0, shadowNonComp = 0;
    let miExcellent = 0, gateGreen = 0, shadowComp = 0, ccLow = 0, riskLow = 0;
    
    for (const m of matrix) {
        const metrics = m.advanced_metrics || {};
        
        if (metrics.cyclomaticComplexity > 20) ccHigh++;
        if (metrics.cognitiveComplexity > 30) cognitiveHigh++;
        if (metrics.nestingDepth > 5) nestingDeep++;
        if (metrics.cbo > 10) cboHigh++;
        if (metrics.maintainabilityIndex > 0 && metrics.maintainabilityIndex < 15) miLow++;
        if (metrics.defectDensity > 1) defectHigh++;
        if (metrics.riskLevel === "CRITICAL") riskCritical++;
        if (metrics.qualityGate === "RED") gateRed++;
        if (metrics.isShadow && metrics.shadowCompliance && !metrics.shadowCompliance.compliant) shadowNonComp++;
        
        // Bônus
        if (metrics.maintainabilityIndex >= 20) miExcellent++;
        if (metrics.maintainabilityIndex >= 50) miExcellent += 2; // +2 para >= 50
        if (metrics.qualityGate === "GREEN") gateGreen++;
        if (metrics.isShadow && metrics.shadowCompliance?.compliant) shadowComp++;
        if (metrics.cyclomaticComplexity <= 10) ccLow++;
        if (metrics.riskLevel === "LOW") riskLow++;
    }
    
    console.log("\n📊 Penalidades (9+ Métricas):");
    console.log(`   CC > 20:          ${ccHigh} × 2.0  = ${ccHigh * 2}`);
    console.log(`   Cognitive > 30:   ${cognitiveHigh} × 1.5 = ${cognitiveHigh * 1.5}`);
    console.log(`   Nesting > 5:      ${nestingDeep} × 1.0 = ${nestingDeep * 1}`);
    console.log(`   CBO > 10:         ${cboHigh} × 1.5 = ${cboHigh * 1.5}`);
    console.log(`   MI < 15:          ${miLow} × 2.0  = ${miLow * 2}`);
    console.log(`   Defect > 1/KLOC:  ${defectHigh} × 3.0 = ${defectHigh * 3}`);
    console.log(`   Risk CRITICAL:     ${riskCritical} × 5.0 = ${riskCritical * 5}`);
    console.log(`   Gate RED:         ${gateRed} × 2.0  = ${gateRed * 2}`);
    console.log(`   Shadow Non-Comp:  ${shadowNonComp} × 4.0 = ${shadowNonComp * 4}`);
    
    const totalPenalty = ccHigh*2 + cognitiveHigh*1.5 + nestingDeep*1 + cboHigh*1.5 + 
                         miLow*2 + defectHigh*3 + riskCritical*5 + gateRed*2 + shadowNonComp*4;
    
    console.log(`\n   TOTAL PENALTY: ${totalPenalty}`);
    
    console.log("\n📊 Bônus de Qualidade:");
    console.log(`   MI >= 20:         ${miExcellent} × 0.5  = ${miExcellent * 0.5}`);
    console.log(`   Gate GREEN:       ${gateGreen} × 0.3  = ${gateGreen * 0.3}`);
    console.log(`   Shadow Compliant: ${shadowComp} × 2.0  = ${shadowComp * 2}`);
    console.log(`   CC <= 10:         ${ccLow} × 0.2  = ${ccLow * 0.2}`);
    console.log(`   Risk LOW:         ${riskLow} × 0.3  = ${riskLow * 0.3}`);
    
    const totalBonus = miExcellent*0.5 + gateGreen*0.3 + shadowComp*2 + ccLow*0.2 + riskLow*0.3;
    console.log(`\n   TOTAL BONUS: ${totalBonus.toFixed(1)}`);
}

main().catch(console.error);
