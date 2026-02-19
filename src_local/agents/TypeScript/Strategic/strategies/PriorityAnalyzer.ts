export class PriorityAnalyzer {
    static analyze(matrix: any[]): any[] {
        return Array.from(matrix.reduce((acc: Map<string, any>, e: any) => {
            const id = e.file.split(/[\\/]/).pop() || e.file;
            if (!acc.has(id)) acc.set(id, { name: id, cc: 0, risky: false });
            const item = acc.get(id); item.cc = Math.max(item.cc, e.complexity);
            if (e.test_status === 'UNTESTED' || e.test_status === 'SHALLOW' || e.complexity > 20) item.risky = true;
            return acc;
        }, new Map<string, any>()).values()).filter((h: any) => h.risky).sort((a: any, b: any) => b.cc - a.cc).slice(0, 5);
    }
}
