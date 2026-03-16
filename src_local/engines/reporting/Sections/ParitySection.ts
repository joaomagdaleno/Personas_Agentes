/**
 * 🧩 ParitySection — specialized in rendering Atomic Parity metrics.
 */
export class ParitySection {
    render(stats: any): string {
        const s = stats || { total_atoms: 0, shallow: 0, deep: 0, gaps: 0, evolution: 0 };
        const purityRate = s.total_atoms > 0 ? Math.round((s.deep / s.total_atoms) * 100) : 0;

        return [
            "### 🧩 PARIDADE ATÔMICA (DENSIDADE REAL)",
            "",
            "| Dimensão | Qtd. | Densidade | Status |",
            "| :--- | :---: | :---: | :--- |",
            `| 💎 **Deep Parity** | \`${s.deep}\` | \`${purityRate}%\` | 🟢 \`ATÔMICO\` |`,
            `| 🚧 **Shallow** | \`${s.shallow}\` | \`${s.total_atoms > 0 ? Math.round((s.shallow / s.total_atoms) * 100) : 0}%\` | 🟡 \`ADAPTADO\` |`,
            `| 🧨 **Gaps** | \`${s.gaps}\` | \`${s.total_atoms > 0 ? Math.round((s.gaps / s.total_atoms) * 100) : 0}%\` | ${s.gaps > 0 ? "🔴 `CRÍTICO`" : "🟢 `ZERO`"} |`,
            `| 🚀 **Evolution** | \`${s.evolution}\` | N/A | 🔵 \`POSITIVO\` |`,
            "",
            `> **Sincronia Nativa:** \`${s.native_sync || 0}%\` | **Personas Ativas:** \`${s.total_atoms}\` | **Soberania:** \`100%\``,
            ""
        ].join("\n");
    }
}
