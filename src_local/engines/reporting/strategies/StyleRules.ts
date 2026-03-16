import { HeadingRules } from "./HeadingRules.ts";
import { ListRules } from "./ListRules.ts";
import { TableRules } from "./TableRules.ts";
import { QuoteRules } from "./QuoteRules.ts";

/**
 * 📝 StyleRules (Facade) — Legacy Compatibility with PhD Sovereignty.
 */
export class StyleRules {
    static ensureBlanksAroundHeadings(lines: string[]): string[] { return HeadingRules.ensureBlanks(lines); }
    static ensureBlanksAroundLists(lines: string[]): string[] { return ListRules.ensureBlanks(lines); }
    static ensureBlanksAroundTables(lines: string[]): string[] { return TableRules.ensureBlanks(lines); }
    static ensureBlockquoteContinuity(lines: string[]): string[] { return QuoteRules.ensureContinuity(lines); }
}
