import type { AtomicFingerprint } from "../parity_types";

/**
 * 🧬 FingerprintExtractor — specialized in extracting persona DNA.
 */
export class FingerprintExtractor {
    static extractPython(content: string, name: string): AtomicFingerprint {
        const get = (re: RegExp) => content.match(re)?.[1] || "?";
        const prompt = content.match(/def\s+get_system_prompt\(self\):\s*\n\s+return\s+f?"([^"]+)"/) || content.match(/system_prompt\s*=\s*f?["']([\s\S]*?)["']\s*(?=def|class|$)/);

        return {
            name, emoji: get(/emoji\s*=\s*["'](.*?)["']/), role: get(/role\s*=\s*["'](.*?)["']/), stack: get(/stack\s*=\s*["'](.*?)["']/),
            rulesCount: (content.match(/'regex':\s*r?"([^"]+)"/g) || []).length,
            rulePatterns: (content.match(/'regex':\s*r?"([^"]+)"/g) || []).map(r => r.match(/"([^"]+)"/)?.[1] || ""),
            ruleIssues: (content.match(/'issue':\s*'([^']+)'/g) || []).map(i => i.match(/'([^']+)'/)?.[1] || ""),
            ruleSeverities: [], fileExtensions: [],
            hasReasoning: /def (_reason_about_objective|reasoning)/.test(content),
            reasoningTrigger: "", systemPrompt: prompt?.[1] || "",
            hasExtraMethods: content.includes("def validate_code_safety") ? ["validate_code_safety"] : [],
            methods: (content.match(/^\s*def\s+(\w+)/gm) || []).map(m => m.trim().replace("def ", ""))
        };
    }

    static extractTS(content: string, name: string): AtomicFingerprint | null {
        const get = (re: RegExp) => content.match(re)?.[1] || "?";
        const prompt = content.match(/this\.systemPrompt\s*=\s*`([\s\S]*?)`/) || content.match(/getSystemPrompt\(\)\s*\{.*?return\s*`([\s\S]*?)`/s);
        const rules: string[] = [];
        const ruleRegex = /regex:\s*(?:\/([^\/]+)\/|["']([^"']+)["'])/g;
        let m; while ((m = ruleRegex.exec(content))) rules.push(m[1] || m[2] || "");

        return {
            name, emoji: get(/emoji:\s*["'](.*?)["']/), role: get(/role:\s*["']([\s\S]*?)["']/), stack: get(/stack:\s*["'](.*?)["']/),
            rulesCount: rules.length, rulePatterns: rules, ruleIssues: [], ruleSeverities: [], fileExtensions: [],
            hasReasoning: /reasonAboutObjective|protected reasoning\(/.test(content) && !content.includes("return null"),
            reasoningTrigger: "", systemPrompt: prompt?.[1] || "",
            hasExtraMethods: /validateCodeSafety|validate_code_safety/.test(content) ? ["validate_code_safety"] : [],
            methods: (content.match(/(?:public|private|protected|async)?\s+(\w+)\s*\(.*?\)\s*(?::|{)/g) || [])
                .map(m => m.match(/(\w+)\s*\(/)?.[1] || "").filter(n => n && !/if|for|while|switch|catch/.test(n))
        };
    }
}
