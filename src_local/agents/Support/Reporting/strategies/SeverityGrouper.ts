export class SeverityGrouper {
    static group(activeItems: any[]): Record<string, any[]> {
        const cats: Record<string, any[]> = { "CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": [], "STRATEGIC": [] };
        for (const item of activeItems) {
            if (item && typeof item === 'object') {
                const sev = (item.severity || 'MEDIUM').toUpperCase(), list = (cats as any)[sev];
                if (list) list.push(item); else (cats as any)["MEDIUM"].push(item);
            } else cats["STRATEGIC"].push(item);
        }
        return cats;
    }
}
