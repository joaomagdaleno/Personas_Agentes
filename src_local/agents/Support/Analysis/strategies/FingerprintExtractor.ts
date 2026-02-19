import { ExtractorHelpers } from "./ExtractorHelpers.ts";

/**
 * 🕵️ FingerprintExtractor - PhD in Code DNA Extraction
 */
export class FingerprintExtractor {
    extractPython(content: string): any[] {
        return ExtractorHelpers.processMatches(content, ExtractorHelpers.getPythonRegexes());
    }

    extractTS(content: string): any[] {
        return ExtractorHelpers.processMatches(content, ExtractorHelpers.getTSRegexes());
    }

    matchTSRules(content: string): string[] {
        const matches = [...content.matchAll(/issue:\s*['"]([^'"]+)['"]/g)];
        return matches.map(m => m[1] || "").filter(Boolean);
    }
}
