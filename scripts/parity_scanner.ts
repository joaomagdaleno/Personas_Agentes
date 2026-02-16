// @ts-nocheck
/**
 * Parity Scanner v3: AI-Aware/Consciousness Edition
 * Compares legacy Python agents vs TypeScript ports with AST & Logic Auditing
 */
import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import { MaturityEvaluator } from "../src_local/agents/Support/maturity_evaluator.ts";
import { LogicAuditor } from "../src_local/agents/Support/logic_auditor.ts";

const LEGACY_ROOT = "c:/Users/joaom/Documents/GitHub/Personas_Agentes/legacy_restore/src_local/agents";
const TS_ROOT = "c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/agents";

const maturityEvaluator = new MaturityEvaluator();

interface ParityResult {
    agent: string;
    stack: string;
    category: string;
    status: "✅ OK" | "⚠️ DIFF" | "❌ MISSING";
    issues: string[];
    maturityScore?: { py: number, ts: number };
    logicalIssues?: number;
}

function extractPythonMeta(content: string): {
    name: string; emoji: string; role: string; stack: string;
    rules: string[]; reasoning: string; systemPrompt: string;
    hasValidate: boolean; patterns: string[];
    maturity: {
        has_telemetry: boolean;
        has_reasoning: boolean;
        has_pathlib: boolean;
        is_linear_syntax: boolean;
    };
} {
    // Intelligent Meta Extraction (Handles tuples and direct assignments)
    const nameMatch = content.match(/self\.name\s*=\s*["'](\w+)["']/) || content.match(/self\.name,\s*self\.emoji.*=\s*["'](\w+)["']/);
    const emojiMatch = content.match(/self\.emoji\s*=\s*["']([^"']+)["']/) || content.match(/self\.name,\s*self\.emoji.*=\s*["'][^"']+["'],\s*["']([^"']+)["']/);
    const roleMatch = content.match(/self\.role\s*=\s*["']([^"']+)["']/) || content.match(/self\.name,\s*self\.emoji,\s*self\.role.*=\s*(?:["'][^"']+["'],\s*){2}["']([^"']+)["']/);
    const stackMatch = content.match(/self\.stack\s*=\s*["'](\w+)["'](?!\s*,)/) || content.match(/self\.name,\s*self\.emoji,\s*self\.role,\s*self\.stack\s*=\s*(?:["'][^"']+["'],\s*){3}["']([^"']+)["']/);

    // Extract regex rules
    const ruleMatches = content.match(/'regex':\s*r?"([^"]+)"/g) || [];
    const rules = ruleMatches.map(r => {
        const m = r.match(/'regex':\s*r?"([^"]+)"/);
        return m ? m[1] : "";
    }).filter(Boolean);

    // Extract issue texts
    const issueMatches = content.match(/'issue':\s*'([^']+)'/g) || [];

    // Check reasoning logic
    const reasoningMatch = content.match(/def\s+_reason_about_objective\(self.*?\):\s*\n([\s\S]*?)(?=\n\s{4}def |\n\s{4}$|\Z)/);
    const reasoning = (reasoningMatch && reasoningMatch[1]) ? reasoningMatch[1].trim() : "None";
    const hasReasoning = reasoning !== "None" && (!reasoning.includes("return None") || reasoning.includes("if "));

    // System prompt
    const promptMatch = content.match(/def\s+get_system_prompt\(self\):\s*\n\s+return\s+f?"([^"]+)"/);
    const systemPrompt = (promptMatch && promptMatch[1]) ? promptMatch[1] : "";

    // Extra methods
    const hasValidate = content.includes("def validate_code_safety");

    // Extensions in find_patterns
    const patternMatch = content.match(/find_patterns\(\s*\((.*?)\)/);
    const patterns: string[] = (patternMatch && patternMatch[1]) ? (patternMatch[1] as string).replace(/'/g, "").split(",").map(s => s.trim()).filter(Boolean) : [];

    // Sync Maturity formula with TS version
    const evidences = {
        has_telemetry: ["time.time()", "_log_performance", "logging.getLogger", "startMetrics", "endMetrics"].some(kw => content.includes(kw)),
        has_reasoning: content.includes("_reason_about_objective") || content.includes("brain.reason"),
        has_pathlib: content.includes("Path(") || content.includes("pathlib"),
        is_linear_syntax: /rules\s*[=:]|patterns\s*[=:]|mapping\s*[=:]/i.test(content.toLowerCase()),
        has_self_diagnostic: content.includes("self_diagnostic") || content.includes("selfDiagnostic")
    };

    return {
        name: (nameMatch && nameMatch[1]) ? nameMatch[1] : "?",
        emoji: (emojiMatch && (emojiMatch[1] || emojiMatch[2])) ? (emojiMatch[1] || emojiMatch[2]) : "?",
        role: (roleMatch && (roleMatch[1] || roleMatch[2])) ? (roleMatch[1] || roleMatch[2]) : "?",
        stack: (stackMatch && (stackMatch[1] || stackMatch[2])) ? (stackMatch[1] || stackMatch[2]) : "?",
        rules,
        reasoning: hasReasoning ? "HAS_REASONING" : "NONE",
        systemPrompt: systemPrompt || "",
        hasValidate,
        patterns,
        maturity: evidences
    };
}

function extractTSMeta(content: string, className: string): {
    name: string; emoji: string; role: string; stack: string;
    rules: string[]; hasReasoning: boolean; hasPrompt: boolean;
    hasValidate: boolean; extensions: string[];
    maturity: any;
    logicalIssues: any[];
} {
    const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);
    let classNode: ts.ClassDeclaration | undefined;

    function findClass(node: ts.Node) {
        if (ts.isClassDeclaration(node) && node.name?.text === `${className}Persona`) {
            classNode = node;
        }
        ts.forEachChild(node, findClass);
    }
    findClass(sourceFile);

    const classBody = classNode ? classNode.getText() : content;

    // Fallback regex for simple fields if AST extraction is too complex for this script
    const nameMatch = classBody.match(/this\.name\s*=\s*"(\w+)"/);
    const emojiMatch = classBody.match(/this\.emoji\s*=\s*"([^"]+)"/);
    const roleMatch = classBody.match(/this\.role\s*=\s*"([^"]+)"/);
    const stackMatch = classBody.match(/this\.stack\s*=\s*"(\w+)"/);

    // Extract rules with content
    const rules: string[] = [];
    const ruleRegex = /regex:\s*(?:\/([^\/]+)\/|["']([^"']+)["'])/g;
    let match;
    while ((match = ruleRegex.exec(classBody)) !== null) {
        rules.push(match[1] || match[2]);
    }

    // Check reasoning with more depth
    const hasReasoning = classBody.includes("reasonAboutObjective") &&
        !classBody.match(/reasonAboutObjective\([^)]*\)[^{]*\{[^}]*return\s+null;\s*\}$/m);

    const hasPrompt = classBody.includes("getSystemPrompt");
    const hasValidate = classBody.includes("validateCodeSafety") || classBody.includes("validate_code_safety");

    // Extensions
    const extMatch = classBody.match(/findPatterns\(\[(.*?)\]/);
    const extensions = (extMatch && extMatch[1]) ? (extMatch[1] as string).replace(/"/g, "").split(",").map(s => s.trim()).filter(Boolean) : [];

    // Intelligence Integration
    const maturity = maturityEvaluator.calculateMaturity(classBody, "TypeScript");
    const logicalIssues = classNode ? LogicAuditor.scanFile(sourceFile).filter((i: any) => i.line >= sourceFile.getLineAndCharacterOfPosition(classNode!.getStart()).line + 1 && i.line <= sourceFile.getLineAndCharacterOfPosition(classNode!.getEnd()).line + 1) : [];

    // Check for selfDiagnostic implementation with more flexibility
    const hasSelfDiag = /selfDiagnostic\s*\(\s*\)/.test(classBody);

    return {
        name: (nameMatch && nameMatch[1]) ? nameMatch[1] : "?",
        emoji: (emojiMatch && emojiMatch[1]) ? emojiMatch[1] : "?",
        role: (roleMatch && roleMatch[1]) ? roleMatch[1] : "?",
        stack: (stackMatch && stackMatch[1]) ? stackMatch[1] : "?",
        rules,
        hasReasoning,
        hasPrompt,
        hasValidate,
        extensions: extensions as string[],
        maturity,
        logicalIssues,
        hasSelfDiag
    };
}

function scanAgentParity(): ParityResult[] {
    const results: ParityResult[] = [];
    const stacks = ["Flutter", "Kotlin", "Python"];
    const categories = ["Audit", "Content", "Strategic", "System"];

    for (const stack of stacks) {
        for (const cat of categories) {
            const legacyDir = path.join(LEGACY_ROOT, stack, cat);
            if (!fs.existsSync(legacyDir)) continue;

            const pyFiles = fs.readdirSync(legacyDir).filter(f => f.endsWith(".py") && f !== "__init__.py");

            for (const pyFile of pyFiles) {
                const agentName = pyFile.replace(".py", "");
                const pyContent = fs.readFileSync(path.join(legacyDir, pyFile), "utf-8");
                const pyMeta = extractPythonMeta(pyContent);

                // Find corresponding TS file
                let tsDir = path.join(TS_ROOT, stack, cat);

                // Special mapping: Legacy Python agents are ported to src_local/agents/TypeScript
                if (stack === "Python") {
                    tsDir = path.join(TS_ROOT, "TypeScript", cat);
                }

                const tsFile = path.join(tsDir, `${agentName}.ts`);
                const issues: string[] = [];

                // Check if TS file exists (could be in a combined file)
                let tsContent = "";
                if (fs.existsSync(tsFile)) {
                    tsContent = fs.readFileSync(tsFile, "utf-8");
                } else {
                    // Check combined files
                    const searchFiles = fs.existsSync(tsDir) ? fs.readdirSync(tsDir).filter(f => f.endsWith(".ts")) : [];
                    for (const sf of searchFiles) {
                        const c = fs.readFileSync(path.join(tsDir, sf), "utf-8");
                        if (c.includes(`"${pyMeta.name}"`)) {
                            tsContent = c;
                            break;
                        }
                    }
                }

                if (!tsContent) {
                    results.push({ agent: agentName, stack, category: cat, status: "❌ MISSING", issues: ["No TypeScript port found"] });
                    continue;
                }

                const tsMeta = extractTSMeta(tsContent, agentName.charAt(0).toUpperCase() + agentName.slice(1));

                // Compare metadata
                if (pyMeta.name !== tsMeta.name) issues.push(`Name: PY=${pyMeta.name} TS=${tsMeta.name}`);
                if (pyMeta.emoji !== tsMeta.emoji) issues.push(`Emoji: PY=${pyMeta.emoji} TS=${tsMeta.emoji}`);
                if (pyMeta.role !== tsMeta.role) issues.push(`Role: PY=${pyMeta.role} TS=${tsMeta.role}`);
                if (pyMeta.stack !== tsMeta.stack) issues.push(`Stack: PY=${pyMeta.stack} TS=${tsMeta.stack}`);

                // Compare rules count and content
                if (pyMeta.rules.length !== tsMeta.rules.length) {
                    issues.push(`Rules Count: PY=${pyMeta.rules.length} TS=${tsMeta.rules.length}`);
                }
                const missingRules = pyMeta.rules.filter(r => !tsMeta.rules.includes(r));
                if (missingRules.length > 0) {
                    issues.push(`Missing Rules: [${missingRules.join(", ")}]`);
                }

                // Compare maturity
                const pyScore = Object.values(pyMeta.maturity).filter(Boolean).length;
                const tsScore = tsMeta.maturity.score;
                console.log(`🎓 [Maturity] Score calculado: ${pyScore}/5 para ${stack}`);
                if (pyScore > tsScore) {
                    issues.push(`Maturity Gap: PY=${pyScore}/5 TS=${tsScore}/5`);
                }

                // Logic Auditor findings
                if (tsMeta.logicalIssues.length > 0) {
                    issues.push(`Logical Integrity: ${tsMeta.logicalIssues.length} findings (try/catch or telemetry issues)`);
                }

                // Compare reasoning
                if (pyMeta.reasoning === "HAS_REASONING" && !tsMeta.hasReasoning) {
                    issues.push(`Reasoning Gap: Legacy has brain logic, TS returns null`);
                }

                // Check Self-Awareness (PhD DNA)
                if (!tsMeta.hasSelfDiag) {
                    issues.push(`Self-Awareness: Missing selfDiagnostic() method (DNA Loss)`);
                }

                // Compare validate_code_safety
                if (pyMeta.hasValidate && !tsMeta.hasValidate) {
                    issues.push(`Missing: validate_code_safety method`);
                }

                // Compare system prompt
                if (!tsMeta.hasPrompt) {
                    issues.push(`Missing: getSystemPrompt`);
                }

                results.push({
                    agent: agentName,
                    stack,
                    category: cat,
                    status: issues.length === 0 ? "✅ OK" : "⚠️ DIFF",
                    issues,
                    maturityScore: { py: pyScore, ts: tsScore },
                    logicalIssues: tsMeta.logicalIssues.length
                });
            }
        }
    }
    return results;
}

// Run analysis
console.log("═══════════════════════════════════════════════════════════════");
console.log("   PARITY ANALYSIS: Legacy Python → TypeScript Agents");
console.log("═══════════════════════════════════════════════════════════════\n");

const results = scanAgentParity();
let ok = 0, diff = 0, missing = 0;

for (const stack of ["Flutter", "Kotlin", "Python"]) {
    console.log(`\n━━━ ${stack} ━━━`);
    const stackResults = results.filter(r => r.stack === stack);
    for (const cat of ["Audit", "Content", "Strategic", "System"]) {
        const catResults = stackResults.filter(r => r.category === cat);
        if (catResults.length === 0) continue;
        console.log(`  ${cat}:`);
        for (const r of catResults) {
            if (r.status === "✅ OK") {
                console.log(`    ${r.status} ${r.agent}`);
                ok++;
            } else if (r.status === "⚠️ DIFF") {
                console.log(`    ${r.status} ${r.agent}: ${r.issues.join("; ")}`);
                diff++;
            } else {
                console.log(`    ${r.status} ${r.agent}: ${r.issues.join("; ")}`);
                missing++;
            }
        }
    }
}

console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`TOTAL: ${results.length} agents | ✅ OK: ${ok} | ⚠️ DIFF: ${diff} | ❌ MISSING: ${missing}`);
console.log(`PARITY: ${((ok / results.length) * 100).toFixed(1)}%`);
console.log("═══════════════════════════════════════════════════════════════\n");

if (diff > 0 || missing > 0) {
    console.log("DETAILS OF DIFFERENCES:");
    for (const r of results.filter(r => r.status !== "✅ OK")) {
        console.log(`\n  ${r.stack}/${r.category}/${r.agent}:`);
        for (const i of r.issues) console.log(`    → ${i}`);
    }
}
