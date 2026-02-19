import { MarkdownLintEngine } from "./MarkdownLintEngine.ts";

export class LintRules {
    private static engine = new MarkdownLintEngine();

    static checkSpacing(lines: string[], i: number, stripped: string, file: string, errs: any[]) {
        // Objeto de contexto dummy para manter compatibilidade com a assinatura antiga se necessário fora d'aqui, 
        // mas o ideal é que o MarkdownAuditor use o engine diretamente ou passemos o hMap.
        // Como o Auditor passa o hMap apenas em checkHeadings, vamos manter o hMap local se não for provido.
    }

    static checkHeadings(lines: string[], i: number, stripped: string, file: string, hMap: Map<string, number>, errs: any[]) {
        this.run(lines, i, stripped, file, hMap, errs);
    }

    static run(lines: string[], i: number, stripped: string, file: string, hMap: Map<string, number>, errs: any[]) {
        this.engine.lint(lines, i, stripped, file, { hMap, errs });
    }
}
