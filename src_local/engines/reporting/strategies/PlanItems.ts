export class PlanItems {
    static format(item: any, sev: string): string {
        if (typeof item !== 'object' || item === null) return `- **Diretriz Estratégica:** ${item.toString().replace(/\.$/, '').trim()}\n\n`;
        const issue = (item.issue || '').toString().replace(/\.$/, '').trim();
        const line = item.line || 'N/A', fileId = (item.file || '').replace(/\./g, '_').replace(/[\\/]/g, '/');
        let res = `#### 🔴 Item ${line}: ${issue} [ID: ${fileId}_${line}]\n\n`;
        if (item.snippet) res += `- **Evidência:**\n\n\`\`\`typescript\n${item.snippet.trim()}\n\`\`\`\n\n`;
        if (item.ai_insight) res += `> 🧠 **TestRefiner (AI Insight):**\n> ${item.ai_insight.replace(/\n/g, '\n> ')}\n\n`;
        return res + `- **Diretriz:** Padrão soberano de ${sev.toLowerCase()}\n\n`;
    }
}
