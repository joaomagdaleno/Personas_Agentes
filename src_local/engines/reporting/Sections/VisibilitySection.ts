/**
 * 🔍 VisibilitySection — specialized in rendering gaps and blind spots.
 */
export class VisibilitySection {
    render(healthData: any, getStatusBadge: (s: string) => string): string {
        const blindCount = (healthData.dark_matter || []).length;
        const brittleCount = (healthData.brittle_points || []).length;
        const stats = healthData.parity_stats || { total_atoms: 0, shallow: 0, deep: 0, gaps: 0 };
        const purityRate = stats.total_atoms > 0 ? Math.round((stats.deep / stats.total_atoms) * 100) : 0;

        return [
            "### 🔍 VISIBILIDADE E INTEGRIDADE SISTÊMICA",
            "",
            "> Análise cruzada entre Cobertura de Testes (Realidade) e a Paridade Atômica (Consistência).",
            "",
            "| Dimensão de Integridade | Valor | Status | Contexto de Realidade |",
            "| :--- | :--- | :--- | :--- |",
            `| 🧨 **Gaps de Paridade** | \`${stats.gaps}\` | ${stats.gaps > 0 ? "🔴 `CRÍTICO`" : "🟢 `ZERO`"} | ${stats.total_atoms > 0 ? Math.round((stats.gaps / stats.total_atoms) * 100) : 0}% de desalinhamento |`,
            `| 🌫️ **Pontos Cegos** | \`${blindCount}\` | ${getStatusBadge(blindCount > 10 ? "ALERTA" : "OK")} | Ativos sem qualquer monitoramento |`,
            `| 💎 **Deep Parity** | \`${stats.deep}\` | 🟢 \`ATÔMICO\` | \`${purityRate}%\` de fidelidade sistêmica |`,
            `| 🚧 **Shallow Parity** | \`${stats.shallow}\` | 🟡 \`ADAPTADO\` | Componentes com lógica parcial |`,
            `| 🧊 **Fragilidades** | \`${brittleCount}\` | ${getStatusBadge(brittleCount > 0 ? "CRÍTICO" : "OK")} | Pontos de ruptura identificados |`,
            "",
            `**Sincronia Nativa:** \`${stats.native_sync || 0}%\` | **Personas Ativas:** \`${stats.total_atoms}\` | **Audit Score:** \`${Math.round(healthData.health_score)}%\``,
            "",
        ].join("\n");
    }
}
