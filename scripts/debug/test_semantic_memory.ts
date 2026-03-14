import { HubManagerGRPC } from "../../src_local/core/hub_manager_grpc";
import { BaseActivePersona } from "../../src_local/agents/base";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
});

class DebugPersona extends BaseActivePersona {
    override id = "debug_persona";
    override name = "Debug Specialist";
    override emoji = "🔍";
    
    getAuditRules() {
        return { extensions: [".ts"], rules: [] };
    }
    
    getSystemPrompt() {
        return "You are a debug assistant.";
    }

    async testMemory() {
        logger.info("🧪 [Test] Starting Semantic Memory test...");
        
        // 1. Record a decision
        const objective = "Fix evaluate bug in calc.ts";
        const action = "Replace eval() with safe Parser.parse()";
        const result = "SUCCESS";
        
        logger.info(`📝 [Test] Recording decision: ${objective}`);
        await this.rememberDecision(objective, action, result);
        
        // 2. Recall decisions
        logger.info("🔍 [Test] Recalling decisions for 'calc.ts'...");
        const records = await this.recallDecisions("calc.ts");
        
        logger.info(`📊 [Test] Found ${records.length} records in memory.`);
        for (const rec of records) {
            logger.info(`✅ [Recall] Obj: ${rec.objective} | Action: ${rec.action} | Result: ${rec.result}`);
        }
        
        if (records.length > 0 && records[0].objective === objective) {
            logger.info("✨ [Test] Semantic Memory Cycle PASSED!");
        } else {
            logger.error("❌ [Test] Semantic Memory Cycle FAILED or result mismatch.");
        }
    }
}

async function run() {
    const hub = new HubManagerGRPC();
    const persona = new DebugPersona();
    
    // Inject hub into persona
    persona.setContext({ hub });
    
    await persona.testMemory();
}

run().catch(console.error);
