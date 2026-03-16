export class HealerPromptBuilder {
    static buildHealPrompt(filePath: string, content: string, issue: string, contextPrompt: string): string {
        return `
        Você é o Dr. Healer, PhD em Reparação e Migração de Software.
        Sua missão é integrar a lógica que falta ou corrigir a fragilidade.
        
        ARQUIVO ALVO: ${filePath}
        CÓDIGO ATUAL NO PROJETO:
        \`\`\`typescript
        ${content}
        \`\`\`
        
        PROBLEMA IDENTIFICADO: ${issue}
        ${contextPrompt}
        
        REQUISITO: Forneça o código completo (merged) do arquivo alvo, garantindo que a lógica do legado seja implementada com as melhores práticas de TypeScript.
        Forneça APENAS o código completo rodeado por triplos backticks.
        `;
    }

    static buildDisparityContext(legacyContent: string, unitName: string, unitType: string): string {
        return `
                CONTEXTO DO LEGADO (Código original que deve ser migrado):
                \`\`\`
                ${legacyContent}
                \`\`\`
                FOCO NA UNIDADE: ${unitName} (${unitType})
                `;
    }
}
