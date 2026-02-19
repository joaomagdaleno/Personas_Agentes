export interface LintRule {
    check(lines: string[], i: number, stripped: string, file: string, context: { hMap: Map<string, number>, errs: any[] }): void;
}
