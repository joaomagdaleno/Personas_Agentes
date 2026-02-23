import { ExtractorHelpers } from "./ExtractorHelpers.ts";

/**
 * 🕵️ FingerprintExtractor - PhD in Code DNA Extraction
 */
import type { AtomicFingerprint } from "../parity_types.ts";
import { ExtractorHelpers } from "./ExtractorHelpers.ts";

export class FingerprintExtractor {
    static extractPython(content: string, name: string): AtomicFingerprint {
        const units = ExtractorHelpers.processMatches(content, ExtractorHelpers.getPythonRegexes());
        return this.mapToFingerprint(name, units, content, "Python");
    }

    static extractTS(content: string, name: string): AtomicFingerprint {
        const units = ExtractorHelpers.processMatches(content, ExtractorHelpers.getTSRegexes());
        return this.mapToFingerprint(name, units, content, "TypeScript");
    }

    private static mapToFingerprint(name: string, units: any[], content: string, stack: string): AtomicFingerprint {
        const methods = units.filter(u => u.type === "function" || u.type === "arrow").map(u => u.value);
        const rules = content.match(/{['"]regex['"]:/g) || content.match(/regex:/g) || [];

        return {
            name: units.find(u => u.type === "name")?.value || name,
            emoji: "👤",
            role: "PhD Agent",
            stack: stack,
            rulesCount: rules.length,
            rulePatterns: [],
            ruleIssues: [],
            ruleSeverities: [],
            fileExtensions: [],
            hasReasoning: content.includes("reasonAboutObjective"),
            reasoningTrigger: "",
            systemPrompt: "",
            hasExtraMethods: [],
            methods: methods
        };
    }

    static matchTSRules(content: string): string[] {
        const matches = [...content.matchAll(/issue:\s*['"]([^'"]+)['"]/g)];
        return matches.map(m => m[1] || "").filter(Boolean);
    }
}
