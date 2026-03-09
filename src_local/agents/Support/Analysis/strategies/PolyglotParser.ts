import { HubManagerGRPC } from "../../../../core/hub_manager_grpc";

/**
 * 🌍 PolyglotParser - PhD in Multi-language Structural Analysis (gRPC Proxy).
 */
export class PolyglotParser {
    constructor(private hubManager?: HubManagerGRPC) { }

    analyzeKt(content: string) {
        const lines = content.split('\n');
        return {
            imports: lines.filter(l => l.startsWith('import ')).map(l => l.split(/\s+/)[1] || ''),
            functions: [...content.matchAll(/fun\s+(\w+)/g)].map(m => m[1] || ''),
            classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '')
        };
    }

    async calculateKtComplexity(filename: string): Promise<number> {
        return this.callHubScanner(filename);
    }

    analyzeGo(content: string) {
        const functions = [...content.matchAll(/func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g)].map(m => m[1] || '');
        const structs = [...content.matchAll(/type\s+(\w+)\s+struct/g)].map(m => m[1] || '');
        return { functions, classes: structs };
    }

    async calculateGoComplexity(filename: string): Promise<number> {
        return this.callHubScanner(filename);
    }

    private async callHubScanner(filename: string): Promise<number> {
        if (!this.hubManager) return 1;

        try {
            const result = await this.hubManager.analyzeFile(filename);
            return result?.total_complexity || 1;
        } catch (err) {
            console.error(`[PolyglotParser] gRPC proxy calculation failed for ${filename}:`, err);
            return 1;
        }
    }

    analyzeDart(content: string) {
        const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/(\w+)\s+\w+\s*\(.*?\)\s*{/g)]
            .map(this.extractDartFunctionName)
            .filter(this.isValidDartFunctionName);
        return { functions, classes };
    }

    private extractDartFunctionName(m: RegExpMatchArray): string {
        const parts = m[0].split(/\s+/);
        return (parts[1] || "").replace('(', '');
    }

    private isValidDartFunctionName(f: string): boolean {
        return f !== "" && f !== 'if' && f !== 'for';
    }
}
