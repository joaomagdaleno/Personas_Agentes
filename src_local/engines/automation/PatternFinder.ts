
import type { HubManagerGRPC } from "../../core/hub_manager_grpc.ts";
import type { AuditFinding, AuditRule, FileContextData } from "../../core/types.ts";
import * as path from "node:path";

/**
 * 🔍 PatternFinder — PhD in Regex Pattern Discovery & Hub Delegation.
 */
export class PatternFinder {
    constructor(private hub: HubManagerGRPC) {}

    /**
     * Executes pattern finding across project files.
     * Since the system is Hub-Native, it delegates the actual regex analysis back to the Hub or Rust sidecar.
     */
    public async find(
        contextData: Record<string, FileContextData>,
        extensions: string[],
        rules: AuditRule[],
        ignoredFiles: string[],
        persona: any
    ): Promise<AuditFinding[]> {
        const allFindings: AuditFinding[] = [];
        const files = Object.keys(contextData);

        for (const file of files) {
            const ext = path.extname(file);
            if (!extensions.includes(ext)) continue;
            if (ignoredFiles.includes(path.basename(file))) continue;

            const content = contextData[file].content;
            if (!content) continue;

            // Delegate to Hub for high-performance regex analysis
            const results = await this.hub.analyzeCode(content, persona.id, persona.stack);
            
            results.forEach(f => {
                if (f.file === "embedded_content") f.file = file;
                allFindings.push(f);
            });
        }

        return allFindings;
    }
}
