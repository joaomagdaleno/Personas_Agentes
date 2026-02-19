export class PriorityAnalyzer {
    static analyze(matrix: any[]): any[] {
        return Array.from(matrix.reduce((acc: Map<string, any>, e: any) => {
            const id = e.file.split(/[\\/]/).pop() || e.file;
            if (!acc.has(id)) {
                acc.set(id, {
                    ...e,
                    name: id
                });
            } else {
                const item = acc.get(id);
                if (e.complexity > item.complexity) {
                    acc.set(id, { ...item, ...e, name: id });
                }
            }

            const item = acc.get(id);
            if (e.test_status === 'UNTESTED' || e.test_status === 'SHALLOW' || e.complexity > 20 || e.advanced_metrics?.riskLevel === "CRITICAL") {
                item.risky = true;
            }

            return acc;
        }, new Map<string, any>()).values())
            .filter((h: any) => h.risky)
            .sort((a: any, b: any) => (b.complexity || 0) - (a.complexity || 0))
            .slice(0, 5);
    }
}
