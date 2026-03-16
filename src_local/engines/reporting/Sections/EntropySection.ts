/**
 * 🌪️ EntropySection — specialized in rendering thermal maps of code complexity.
 */
export class EntropySection {
    render(mapData: Record<string, any>, limit: number = 200): string {
        const entries: Array<{ file: string; complexity: number; instability: number }> = [];

        for (const [f, info] of Object.entries(mapData)) {
            const file = f.toLowerCase().replace(/\\/g, "/");
            if (file.includes("/.agent/") || file.startsWith(".agent/")) continue;
            if (file.includes("legacy_restore") || file.endsWith("__init__.py")) continue;

            entries.push({
                file: f,
                complexity: (info as any).complexity || 1,
                instability: (info as any).coupling?.instability || 0,
            });
        }

        entries.sort((a, b) => b.complexity - a.complexity);

        const rows = entries.slice(0, limit).map(e => {
            const basename = e.file.split(/[\\/]/).pop() || e.file;
            return `> | \`${basename}\` | \`${e.complexity}\` | \`${Math.round(e.instability * 100)}%\` |`;
        });

        return [
            "> | Componente | Complex. | Instabilidade (Prob.) |",
            "> | :--- | :---: | :--- |",
            ...rows,
            "",
        ].join("\n");
    }
}
