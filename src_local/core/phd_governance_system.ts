import winston from "winston";
import * as path from "node:path";
import * as fs from "node:fs";

const logger = winston.child({ module: "PhdGovernanceSystem" });

export enum ComplianceLevel {
    SOVEREIGN = "SOVEREIGN",
    EXCELLENT = "EXCELLENT",
    STANDARD = "STANDARD",
    SUBSTANDARD = "SUBSTANDARD",
    DEGRADED = "DEGRADED",
    CRITICAL = "CRITICAL"
}

export enum VetoReason {
    INFRASTRUCTURE = "INFRASTRUCTURE",
    SECURITY_RISK = "SECURITY_RISK",
    TECHNICAL_MATH = "TECHNICAL_MATH",
    RULE_DEFINITION = "RULE_DEFINITION",
    LEGACY_ARTIFACT = "LEGACY_ARTIFACT",
    PROTECTED_NAMESPACE = "PROTECTED_NAMESPACE",
    COMPLIANCE_FAILURE = "COMPLIANCE_FAILURE"
}

export interface CompliancePolicy {
    level: ComplianceLevel;
    directives: string[];
    allowedActions: string[];
    vetoThreshold: number;
}

export interface HealthScore {
    stability: number;
    purity: number;
    observability: number;
    security: number;
    excellence: number;
    compliance: number;
    total: number;
}

/**
 * 🎓 PhD Governance System (High-Fidelity Sovereign Engine).
 * Consolida a lógica de 12 sistemas legados (Scoring, Veto, Topology, Conflict, Indexer, etc).
 */
export class PhdGovernanceSystem {
    private readonly policies: Record<ComplianceLevel, CompliancePolicy> = {
        [ComplianceLevel.SOVEREIGN]: {
            level: ComplianceLevel.SOVEREIGN,
            directives: ["Maintain absolute parity", "Zero tech debt", "Full documentation"],
            allowedActions: ["EVOLVE", "HEAL", "REFRACTOR"],
            vetoThreshold: 1.0
        },
        [ComplianceLevel.EXCELLENT]: {
            level: ComplianceLevel.EXCELLENT,
            directives: ["Continuous improvement", "High coverage"],
            allowedActions: ["EVOLVE", "HEAL"],
            vetoThreshold: 0.9
        },
        [ComplianceLevel.STANDARD]: {
            level: ComplianceLevel.STANDARD,
            directives: ["Parity maintenance"],
            allowedActions: ["MAINTAIN"],
            vetoThreshold: 0.7
        },
        [ComplianceLevel.SUBSTANDARD]: {
            level: ComplianceLevel.SUBSTANDARD,
            directives: ["Urgent refactoring needed"],
            allowedActions: ["FIX"],
            vetoThreshold: 0.5
        },
        [ComplianceLevel.DEGRADED]: {
            level: ComplianceLevel.DEGRADED,
            directives: ["System protection mode"],
            allowedActions: ["PROTECT", "FIX"],
            vetoThreshold: 0.3
        },
        [ComplianceLevel.CRITICAL]: {
            level: ComplianceLevel.CRITICAL,
            directives: ["Shutdown and restore"],
            allowedActions: ["RESTORE", "HALT"],
            vetoThreshold: 0.1
        }
    };

    /**
     * Calcula o score de saúde sistêmica baseado em múltiplas dimensões (ScoringEnginePhd logic).
     */
    public calculateHealth(data: {
        files: Record<string, any>;
        alerts: any[];
        totalFiles: number;
        avgComplexity: number;
    }): HealthScore {
        const { files, alerts, totalFiles, avgComplexity } = data;

        if (totalFiles === 0) {
            return { stability: 0, purity: 0, observability: 0, security: 0, excellence: 0, compliance: 0, total: 0 };
        }

        // 1. Estabilidade (Test Coverage + Verification Depth)
        const testFiles = Object.values(files).filter((f: any) => f.has_test);
        let stability = (testFiles.length / totalFiles) * 35;

        // 2. Pureza (Complexidade Ciclomática - Scaling de 1.5 a 2.0 conforme legacy)
        let purity = Math.max(0, 15 - ((avgComplexity - 1) * 1.5));

        // 3. Observabilidade (Real Telemetry Detection vs String mentions)
        const withTel = Object.values(files).filter((f: any) => f.component_type !== "TEST" && f.telemetry).length;
        let observability = (withTel / totalFiles) * 10;

        // 4. Segurança (Critical/High Severity Alerts)
        const highAlerts = alerts.filter(r => typeof r === "object" && (r.severity === "critical" || r.severity === "high"));
        const medAlerts = alerts.filter(r => typeof r === "object" && r.severity === "medium");
        const lowAlerts = alerts.filter(r => typeof r === "object" && (r.severity === "low" || r.severity === "strategic"));
        const stratAlerts = alerts.filter(r => typeof r === "string");

        let security = Math.max(0, 15 - (highAlerts.length * 5));

        // 5. Excelência (Knowledge Documentation Purpose)
        const kdoc = Object.values(files).filter((f: any) => f.purpose && f.purpose !== "UNKNOWN").length;
        let excellence = (kdoc / totalFiles) * 10;

        // 6. Compliance (Sovereign Level Logic)
        const complianceLevel = this.getComplianceLevel(highAlerts.length, medAlerts.length);
        const policy = this.policies[complianceLevel];
        let compliance = policy.vetoThreshold * 15;

        let rawTotal = stability + purity + observability + security + excellence + compliance;

        // 🛡️ [Apply Constraints] Logic from ScoringEnginePhd._apply_constraints
        let ceiling = 100;
        switch (complianceLevel) {
            case ComplianceLevel.CRITICAL: ceiling = 20; break;
            case ComplianceLevel.DEGRADED: ceiling = 40; break;
            case ComplianceLevel.SUBSTANDARD: ceiling = 60; break;
            case ComplianceLevel.STANDARD: ceiling = 85; break;
            case ComplianceLevel.EXCELLENT: ceiling = 95; break;
            case ComplianceLevel.SOVEREIGN: ceiling = 100; break;
        }

        // 📉 [Drain] Logic
        const drain = (highAlerts.length * 15) + (medAlerts.length * 5) + (lowAlerts.length * 1) + (stratAlerts.length * 0.5);

        let finalTotal = Math.max(0, Math.min(rawTotal, ceiling) - (drain * 0.2));

        return {
            stability: Number(stability.toFixed(2)),
            purity: Number(purity.toFixed(2)),
            observability: Number(observability.toFixed(2)),
            security: Number(security.toFixed(2)),
            excellence: Number(excellence.toFixed(2)),
            compliance: Number(compliance.toFixed(2)),
            total: Number(finalTotal.toFixed(2))
        };
    }

    private getComplianceLevel(high: number, med: number): ComplianceLevel {
        if (high > 5) return ComplianceLevel.CRITICAL;
        if (high > 2) return ComplianceLevel.DEGRADED;
        if (high > 0) return ComplianceLevel.SUBSTANDARD;
        if (med > 5) return ComplianceLevel.STANDARD;
        if (med > 0) return ComplianceLevel.EXCELLENT;
        return ComplianceLevel.SOVEREIGN;
    }

    /**
     * Determina se um caminho deve ser vetado (VetoRulesPhd logic).
     */
    public shouldVeto(relPath: string): { veto: boolean; reason?: VetoReason; justification?: string } {
        const ignored = ['.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules', 'dist', 'target', 'bin'];
        const parts = relPath.split(/[/\\]/);

        if (parts.some(part => ignored.includes(part))) {
            return { veto: true, reason: VetoReason.INFRASTRUCTURE, justification: "Caminho de infraestrutura ignorado." };
        }

        if (relPath.endsWith(".pyc") || relPath.endsWith(".o") || relPath.endsWith(".exe") || relPath.endsWith(".dll") || relPath.endsWith(".class")) {
            return { veto: true, reason: VetoReason.LEGACY_ARTIFACT, justification: "Binário ou cache legado detectado." };
        }

        if (relPath.includes("/secrets/") || relPath.includes("/internal/keys/")) {
            return { veto: true, reason: VetoReason.SECURITY_RISK, justification: "Acesso a subdiretório de segredos protegido." };
        }

        return { veto: false };
    }

    /**
     * Heurística para matemática técnica (VetoRulesPhd extension).
     */
    public isTechnicalMath(lineContent: string, issue: string): boolean {
        if (!issue.includes("Imprecisão Monetária")) return false;

        const techTerms = [
            'alpha', 'progress', 'offset', 'dp', 'sp', 'radius', 'velocity',
            'phase', 'amplitude', 'frequency', 'duration', 'x', 'y', 'width', 'height',
            'sigma', 'delta', 'theta', 'gamma', 'epsilon', 'lambda', 'mu', 'nu',
            'integral', 'derivative', 'matrix', 'tensor', 'scalar', 'vector'
        ];
        const lower = lineContent.toLowerCase();

        const moneyTerms = ['price', 'amount', 'balance', 'cost', 'total', 'euro', 'usd', 'brl', 'payment', 'transaction', 'wallet', 'currency'];
        if (moneyTerms.some(f => lower.includes(f))) {
            return false;
        }

        return techTerms.some(t => new RegExp(`\\b${t}\\b`).test(lower));
    }

    /**
     * Heurística para definições de regras (VetoRulesPhd extension).
     */
    public isRuleDefinition(lineContent: string): boolean {
        const lower = lineContent.toLowerCase();
        const keywords = [
            "rules =", "patterns =", "audit_rules =", "regex =",
            "silent_pattern =", "brittle_pattern =", "heuristic =",
            "veto_criteria =", "security_policy =", "compliance_check =",
            "validation_logic =", "rule_registry ="
        ];
        return keywords.some(kw => lower.includes(kw));
    }

    /**
     * Gatilho de Reflexos Sistêmicos (ReflexEnginePhd logic).
     */
    public triggerReflexes(health: HealthScore, personas: any[]): void {
        logger.info(`⚡ [PhD] Estado Sistêmico: ${health.total}% - Analisando Reflexos...`);

        if (health.total < 20) {
            this.executeEmergencyAction("HALT", personas);
            return;
        }

        if (health.stability < 20) {
            logger.error("🛑 [PhD] ALERTA DE INSTABILIDADE: Cobertura de testes crítica!");
            this.executeEmergencyAction("STABILIZE", personas);
        }

        if (health.security < 10) {
            logger.error("🛡️ [PhD] ALERTA DE SEGURANÇA: Vulnerabilidades críticas detectadas!");
            this.executeEmergencyAction("PROTECT", personas);
        }

        const voyager = personas.find((p: any) => p.name === "Voyager");
        if (health.total < 80 && voyager && voyager.performActiveHealing) {
            voyager.performActiveHealing(["SYSTEM_FRAGILITY_RECOVERY"]);
        }

        if (health.purity < 10) {
            logger.warn("扫 [PhD] Solicitando refatoração emergencial por alta complexidade.");
        }
    }

    private executeEmergencyAction(action: string, personas: any[]): void {
        switch (action) {
            case "STABILIZE":
                logger.info("🧪 [PhD] Iniciando protocolo de estabilização...");
                const testify = personas.find((p: any) => p.name === "Testify");
                if (testify) testify.performAudit();
                break;
            case "PROTECT":
                logger.warn("🛡️ [PhD] Ativando escudos de segurança...");
                const sentinel = personas.find((p: any) => p.name === "Sentinel");
                if (sentinel) sentinel.performAudit();
                break;
            case "HALT":
                logger.error("🚨 [PhD] PARADA DE EMERGÊNCIA: Integridade sistêmica comprometida!");
                break;
            case "RESTORE":
                logger.error("🚨 [PhD] Iniciando restauração soberana!");
                break;
            default:
                logger.warn(`❓ [PhD] Ação de emergência desconhecida: ${action}`);
        }
    }

    /**
     * Resolução Forense de Conflitos (ConflictPolicyPhd logic).
     */
    public resolveMergeConflict(file: string, isProtected: boolean): "OURS" | "THEIRS" | "MANUAL" | "CLEANUP" {
        if (file.endsWith(".pyc") || file.includes("__pycache__") || file.endsWith(".tmp")) return "CLEANUP";
        if (file === "skills_index.json" || file.endsWith(".json") || file.endsWith(".yaml")) return "MANUAL";

        if (isProtected) {
            logger.info(`🛡️ [PhD] Conflito em arquivo Gold Standard: ${file}. Protegendo LOCAL.`);
            return "OURS";
        }

        logger.info(`📡 [PhD] Priorizando UPSTREAM para: ${file}`);
        return "THEIRS";
    }

    /**
     * Mapeia Topologia Ativa (GitOperationsPhd logic).
     */
    public getActiveTopology(cwd: string): { branch: string, tracking: string, isHealthy: boolean, remoteDelta: number } {
        try {
            const dotGit = path.join(cwd, ".git");
            const isHealthy = fs.existsSync(dotGit);
            return {
                branch: "main",
                tracking: "origin/main",
                isHealthy,
                remoteDelta: 0
            };
        } catch {
            return { branch: "unknown", tracking: "none", isHealthy: false, remoteDelta: -1 };
        }
    }

    /**
     * Analisa Profundidade de Teste (AnalysisEnginePhd logic).
     */
    public analyzeTestQuality(content: string): { assertions: number; quality: "DEEP" | "SHALLOW" | "NONE" } {
        const patterns = [
            /expect\(|assert\s|assertThat\(|self\.assert|equal\(|toBe\(|check\(|should\(|verify\(|must\(/g,
            /assert[A-Z]\w*\(/g,
            /fail\(|exception\(|rejects\.|throws\(/g,
            /it\(|describe\(|test\(|suite\(/g
        ];

        let count = 0;
        patterns.forEach(p => {
            count += (content.match(p) || []).length;
        });

        if (count > 30) return { assertions: count, quality: "DEEP" };
        if (count > 10) return { assertions: count, quality: "SHALLOW" };
        return { assertions: count, quality: "NONE" };
    }

    /**
     * Perfil de Recursos (ResourceGovernor logic).
     */
    public getResourceProfile(cores: number, ramGb: number): { profile: string, parallelism: number, throttle: boolean } {
        if (ramGb >= 64) return { profile: "ELITE_MODE", parallelism: cores * 8, throttle: false };
        if (ramGb >= 32) return { profile: "GOD_MODE", parallelism: cores * 4, throttle: false };
        if (ramGb >= 16) return { profile: "SOVEREIGN", parallelism: cores * 2, throttle: false };
        if (ramGb >= 8) return { profile: "STANDARD", parallelism: cores, throttle: true };
        return { profile: "CONSTRAINED", parallelism: Math.max(1, Math.floor(cores / 2)), throttle: true };
    }

    public getDirectives(level: ComplianceLevel): string[] {
        return this.policies[level].directives;
    }

    public getPolicy(level: ComplianceLevel): CompliancePolicy {
        return this.policies[level];
    }
}
