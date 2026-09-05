import { HubManagerGRPC } from "../../../core/hub_manager_grpc.ts";

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
        const imports = [...content.matchAll(/import\s+(?:\(\s*([\s\S]*?)\s*\)|"([^"]+)")/g)].flatMap(m => {
            if (m[2]) return [m[2]];
            if (m[1]) return [...m[1].matchAll(/"([^"]+)"/g)].map(im => im[1]);
            return [];
        });
        return { functions, classes: structs, imports };
    }

    async calculateGoComplexity(filename: string): Promise<number> {
        return this.callHubScanner(filename);
    }

    analyzeCs(content: string) {
        const lines = content.split('\n');
        const imports = lines.filter(l => l.trim().startsWith('using ')).map(l => l.trim().replace(/^using\s+/, '').replace(';', ''));
        const classes = [...content.matchAll(/(?:class|interface|struct)\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/(?:public|private|protected|internal|static|\s)+\s+[\w<>]+\s+(\w+)\s*\(/g)]
            .map(m => m[1])
            .filter(f => f && f !== 'if' && f !== 'while' && f !== 'for' && f !== 'switch' && f !== 'catch');
        return { functions, classes, imports };
    }

    analyzeRs(content: string) {
        const lines = content.split('\n');
        const imports = lines.filter(l => l.trim().startsWith('use ')).map(l => l.trim().replace(/^use\s+/, '').replace(';', ''));
        const structs = [...content.matchAll(/(?:struct|enum|trait)\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/fn\s+(\w+)/g)].map(m => m[1] || '');
        return { functions, classes: structs, imports };
    }

    analyzeCpp(content: string) {
        const lines = content.split('\n');
        const imports = lines.filter(l => l.trim().startsWith('#include')).map(l => l.trim().replace(/^#include\s+/, ''));
        const classes = [...content.matchAll(/(?:class|struct)\s+(\w+)/g)].map(m => m[1] || '');
        const functions = [...content.matchAll(/[\w:<>]+\s+(\w+)\s*\([^)]*\)\s*[{;]/g)]
            .map(m => m[1])
            .filter(f => f && f !== 'if' && f !== 'while' && f !== 'for' && f !== 'switch' && f !== 'catch');
        return { functions, classes, imports };
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
