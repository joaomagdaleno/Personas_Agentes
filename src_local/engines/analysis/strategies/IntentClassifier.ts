/**
 * 🎯 IntentClassifier — specialized in identifying file purpose.
 */
export class IntentClassifier {
    static classify(content: string, filename: string, rustMetadata?: any): string {
        if (rustMetadata && rustMetadata.semantic_blocks) {
            let metadata = 0, observability = 0, logic = 0;
            const blocks = rustMetadata.semantic_blocks;
            for (const key in blocks) {
                const intent = blocks[key];
                if (intent === "METADATA") metadata++;
                else if (intent === "OBSERVABILITY") observability++;
                else logic++;
            }
            if (metadata > logic && metadata > observability) return "METADATA";
            if (observability > logic) return "OBSERVABILITY";
            return "LOGIC";
        }

        if (/export\s+(type|interface|enum)\s+/.test(content)) return "METADATA";
        if (/logger\.(info|warn|error|debug)/.test(content)) return "OBSERVABILITY";
        return "LOGIC";
    }
}
