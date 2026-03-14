/**
 * Phase 19 Verification: Individual Language Persona Agents
 * Validates all agents instantiate correctly via the orchestrator.
 */
import { LanguagePersonaOrchestrator } from "../src_local/core/language_persona_orchestrator.ts";

async function verifyPhase19() {
    console.log("🧪 Phase 19 Verification: Individual Language Persona Agents\n");

    const orchestrator = new LanguagePersonaOrchestrator();

    // 1. Check agent counts
    const flutterAgents = await orchestrator.getAgentsForStack("flutter");
    const kotlinAgents = await orchestrator.getAgentsForStack("kotlin");
    const pythonAgents = await orchestrator.getAgentsForStack("python");

    console.log(`  Flutter agents: ${flutterAgents.length}`);
    console.log(`  Kotlin agents:  ${kotlinAgents.length}`);
    console.log(`  Python agents:  ${pythonAgents.length}`);

    if (flutterAgents.length !== 26) { console.error("❌ Expected 26 Flutter agents"); process.exit(1); }
    if (kotlinAgents.length !== 26) { console.error("❌ Expected 26 Kotlin agents"); process.exit(1); }
    if (pythonAgents.length !== 27) { console.error("❌ Expected 27 Python agents"); process.exit(1); }
    console.log("  ✅ Agent counts verified\n");

    // 2. Check each agent has all 3 required methods
    for (const agents of [flutterAgents, kotlinAgents, pythonAgents]) {
        agents.forEach(validateAgent);
    }
    console.log("  ✅ All agents have performAudit, reasonAboutObjective, getSystemPrompt\n");

    // 3. Run audit on sample context
    const contextMap: Record<string, any> = {
        "lib/main.dart": { content: 'setState(() {}); print("hello"); while (true) { }' },
        "app/MainActivity.kt": { content: 'runBlocking { }; println("test"); GlobalScope.launch {}' },
        "main.py": { content: 'import os; print("hello"); while True: pass; eval("code"); pickle.load(f)' },
    };

    const findings = await orchestrator.runAll(contextMap);
    console.log(`  ✅ Total findings: ${findings.length}`);

    // 4. Verify summary
    const summary = orchestrator.summarize(findings);
    console.log(`  ✅ Summary: ${summary.total} total, ${summary.criticalCount} critical`);
    console.log(`     By stack:`, summary.byStack);

    // 5. Test strategic audit
    const strategic = await orchestrator.runStrategic(contextMap, "Orquestração de IA");
    console.log(`  ✅ Strategic findings: ${strategic.length}`);

    console.log("\n🎉 Phase 19 Verification: ALL PASSED!");
}

function validateAgent(agent: any) {
    const required = ["performAudit", "reasonAboutObjective", "getSystemPrompt"];
    for (const method of required) {
        if (typeof agent[method] !== "function") {
            console.error(`❌ ${agent.name} missing ${method}`);
            process.exit(1);
        }
    }
    const prompt = agent.getSystemPrompt();
    if (!prompt || prompt.length < 10) {
        console.error(`❌ ${agent.name} getSystemPrompt too short`);
        process.exit(1);
    }
}

verifyPhase19().catch(e => { console.error("❌ Failed:", e); process.exit(1); });
