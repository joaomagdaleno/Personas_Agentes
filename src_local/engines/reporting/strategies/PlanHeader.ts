export class PlanHeader {
    static formatImpact(cats: Record<string, any[]>): string {
        let res = "### 📊 RESUMO DE INTERVENÇÕES\n\n| Severidade | Quantidade |\n| :--- | :---: |\n";
        ["CRITICAL", "HIGH", "MEDIUM", "LOW", "STRATEGIC"].forEach(s => {
            const list = cats[s];
            if (list && list.length > 0) res += `| ${s} | ${list.length} |\n`;
        });
        return res.trim();
    }
}
