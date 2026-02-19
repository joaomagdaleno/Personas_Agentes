/**
 * 🟦 ParserHelpers - PhD in Syntax Traversal
 */
export class ParserHelpers {
    static getParts(content: string) {
        return {
            functions: [...content.matchAll(/function\s+(\w+)/g)].map(m => (m[1] as string) || ''),
            arrows: [...content.matchAll(/const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g)].map(m => (m[1] as string) || ''),
            methods: [...content.matchAll(/(?:(public|private|protected|static|async)\s+)?(\w+)\s*\(/g)].map(m => (m[2] as string) || ''),
            classes: [...content.matchAll(/class\s+(\w+)/g)].map(m => (m[1] as string) || ''),
            con: [...content.matchAll(/constructor\s*\(/g)].map(() => 'constructor')
        };
    }

    static checkTelemetry(content: string): boolean {
        return content.includes("winston") ||
            content.includes("logger.info") ||
            content.includes("logger.debug") ||
            content.includes("log_performance") ||
            /telemetry|console\.log/.test(content);
    }
}
