import { ComplianceLevel, type HealthScore, POLICIES } from "./policy_definitions.ts";

/**
 * 📊 Scoring Engine (Sovereign).
 */
export class ScoringEngine {
    public calculateHealth(data: { files: Record<string, any>; alerts: any[]; totalFiles: number; avgComplexity: number; }): HealthScore {
        const { files, alerts, totalFiles, avgComplexity } = data;
        if (totalFiles === 0) return this._emptyScore();

        const s = this._calcStability(files, totalFiles);
        const p = this._calcPurity(avgComplexity);
        const o = this._calcObs(files, totalFiles);
        const sec = this._calcSecurity(alerts);
        const e = this._calcExcellence(files, totalFiles);
        const c = this._calcCompliance(sec.high, sec.med);

        const raw = s + p + o + sec.security + e + c;
        const constrained = this._applyConstraints(raw, sec);

        return this._format(constrained, s, p, o, sec.security, e, c);
    }

    private _emptyScore() {
        return { stability: 0, purity: 0, observability: 0, security: 0, excellence: 0, compliance: 0, total: 0 };
    }

    private _calcStability(f: any, t: number) {
        const tested = Object.values(f).filter((x: any) => x.has_test).length;
        return (tested / t) * 35;
    }

    private _calcPurity(a: number) {
        return Math.max(0, 15 - ((a - 1) * 1.5));
    }

    private _calcObs(f: any, t: number) {
        const observed = Object.values(f).filter((x: any) => x.component_type !== "TEST" && x.telemetry).length;
        return (observed / t) * 10;
    }

    private _calcExcellence(f: any, t: number) {
        const excellent = Object.values(f).filter((x: any) => x.purpose && x.purpose !== "UNKNOWN").length;
        return (excellent / t) * 10;
    }

    private _calcSecurity(a: any[]) {
        const c = { high: 0, med: 0, low: 0, strat: 0 };
        a.forEach(r => this.categorizeAlert(r, c));
        return { security: Math.max(0, 15 - (c.high * 5)), ...c };
    }

    private categorizeAlert(r: any, counts: any) {
        if (typeof r !== "object") {
            counts.strat++;
            return;
        }

        const sev = String(r.severity).toLowerCase();
        if (sev === "critical" || sev === "high") {
            counts.high++;
        } else if (sev === "medium") {
            counts.med++;
        } else {
            counts.low++;
        }
    }

    private _calcCompliance(h: number, m: number) {
        const level = this.getComplianceLevel(h, m);
        return POLICIES[level].vetoThreshold * 15;
    }

    private _applyConstraints(r: number, s: any) {
        const lvl = this.getComplianceLevel(s.high, s.med);
        const ceilings = {
            [ComplianceLevel.CRITICAL]: 20,
            [ComplianceLevel.DEGRADED]: 40,
            [ComplianceLevel.SUBSTANDARD]: 60,
            [ComplianceLevel.STANDARD]: 85,
            [ComplianceLevel.EXCELLENT]: 95,
            [ComplianceLevel.SOVEREIGN]: 100
        };
        const ceiling = (ceilings as any)[lvl] || 100;
        const penalty = ((s.high * 15) + (s.med * 5) + (s.low)) * 0.2;

        return Math.max(0, Math.min(r, ceiling) - penalty);
    }

    private _format(t: number, s: number, p: number, o: number, sec: number, e: number, c: number) {
        return {
            stability: +s.toFixed(2),
            purity: +p.toFixed(2),
            observability: +o.toFixed(2),
            security: +sec.toFixed(2),
            excellence: +e.toFixed(2),
            compliance: +c.toFixed(2),
            total: +t.toFixed(2)
        };
    }

    public getComplianceLevel(h: number, m: number): ComplianceLevel {
        if (h > 5) return ComplianceLevel.CRITICAL;
        if (h > 2) return ComplianceLevel.DEGRADED;
        if (h > 0) return ComplianceLevel.SUBSTANDARD;
        return this.getStandardCompliance(m);
    }

    private getStandardCompliance(m: number): ComplianceLevel {
        if (m > 5) return ComplianceLevel.STANDARD;
        if (m > 0) return ComplianceLevel.EXCELLENT;
        return ComplianceLevel.SOVEREIGN;
    }
}
