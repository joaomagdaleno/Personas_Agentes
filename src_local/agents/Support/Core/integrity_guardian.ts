import winston from "winston";

const logger = winston.child({ module: "IntegrityGuardian" });

/**
 * 🛡️ Guardião de Integridade PhD (Bun Version).
 */
export class IntegrityGuardian {
    async detectVulnerabilities(content: string, componentType: string, filename: string = "unknown", ignoreTestContext: boolean = false): Promise<any> {
        const issues = { brittle: false, silent_error: false };

        if (componentType === "TEST" && !ignoreTestContext) {
            return issues;
        }

        // Simplified detection logic (LogicAuditor mock for now)
        this.analyzeBrittleContext(content, filename, issues);
        this.analyzeErrorSilencing(content, filename, issues);

        return issues;
    }

    private analyzeBrittleContext(content: string, filename: string, issues: any) {
        const brittlePattern = /\b(eval|exec|global|shell=true)\b/gi;
        const matches = [...content.matchAll(brittlePattern)];

        if (matches.length > 0) {
            // In a real port, we'd use LogicAuditor here
            logger.warn(`Entropia detectada: Padrão frágil encontrado em ${filename}.`);
            issues.brittle = true;
        }
    }

    private analyzeErrorSilencing(content: string, filename: string, issues: any) {
        const silentPattern = /except.*:\s*pass/gi;
        const match = content.match(silentPattern);
        if (match) {
            if (!["logger.err", "logger.excep", "telemetry"].some(kw => content.includes(kw))) {
                logger.warn(`Cegueira operacional (Silent Except): Erro silenciado sem telemetria em ${filename}.`);
                issues.silent_error = true;
            }
        }
    }

    isRelevantFile(file: string, stack: string): boolean {
        if (stack === "Universal") return true;
        const extMap: Record<string, string> = { Flutter: ".dart", Kotlin: ".kt", Python: ".py" };
        const ext = extMap[stack];
        return (ext && file.endsWith(ext)) || [".yaml", ".xml", ".json", ".gradle", ".kts"].some(x => file.endsWith(x));
    }

    getAuditMission(dna: any, objective: string | null = null): string {
        if (objective) return objective;
        const mission = dna.core_mission || 'Software Proposital';
        return `Otimizar o sistema de ${mission}`;
    }
}
