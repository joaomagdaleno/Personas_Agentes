/**
 * 🎯 IntentClassifier — specialized in identifying file purpose.
 */
export class IntentClassifier {
    static classify(content: string, filename: string): string {
        if (/export\s+(type|interface|enum)\s+/.test(content)) return "METADATA";
        if (/logger\.(info|warn|error|debug)/.test(content)) return "OBSERVABILITY";
        return "LOGIC";
    }
}
