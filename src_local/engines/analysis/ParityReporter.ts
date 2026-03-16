import type { ParityReport } from "./parity_types";

/**
 * ✍️ ParityReporter — Helper for formatting parity reports.
 */
export class ParityReporter {
    static formatMarkdown(report: ParityReport): string {
        let md = `## ⚖️ SINCRO-NATIVA: Consistência Multi-Stack (Soberania 2.0)\n\n> Zero Legacy Reference.\n\n| Métrica | Valor |\n| :--- | :---: |\n`;
        md += `| **Sincronia Geral** | ${report.overallParity}% |\n`;
        md += `| **Personas Identificadas** | ${report.totalAgents} |\n`;
        md += `| **Instalações Ativas** | ${report.totalInstances} |\n`;
        md += `| **Symmetry Mirror** | ${report.symmetricCount} |\n`;
        md += `| **Divergências** | ${report.divergentCount} |\n\n### 🌍 Cobertura Global\n\n| Persona | Fidelidade | Stacks |\n| :--- | :---: | :--- |\n`;

        report.coverage
            .sort((a, b) => b.stacks.length - a.stacks.length)
            .forEach(c => md += `| ${c.agent} | ${c.stacks.length}/6 | ${c.stacks.join(", ")} |\n`);

        return md;
    }
}
