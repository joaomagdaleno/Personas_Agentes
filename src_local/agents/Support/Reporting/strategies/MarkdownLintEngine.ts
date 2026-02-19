import type { LintRule } from "./rules/LintRule.ts";
import { SpacingRules } from "./rules/SpacingRules.ts";
import { HeadingRules } from "./rules/HeadingRules.ts";

export class MarkdownLintEngine {
    private rules: LintRule[] = [
        new SpacingRules(),
        new HeadingRules()
    ];

    lint(lines: string[], i: number, stripped: string, file: string, context: { hMap: Map<string, number>, errs: any[] }): void {
        for (const rule of this.rules) {
            rule.check(lines, i, stripped, file, context);
        }
    }
}
