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

export const POLICIES: Record<ComplianceLevel, CompliancePolicy> = {
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
