import { ComplianceLevel, type HealthScore, POLICIES } from "./policy_definitions.ts";

/**
 * 📊 Scoring Engine (Sovereign).
 */
export class ScoringEngine {
    public calculateHealth(data: { files: Record<string, any>; alerts: any[]; totalFiles: number; avgComplexity: number; }): HealthScore {
        const { files, alerts, totalFiles, avgComplexity } = data;
        if (totalFiles === 0) return this._emptyScore();
        const s = this._calcStability(files, totalFiles), p = this._calcPurity(avgComplexity), o = this._calcObs(files, totalFiles);
        const sec = this._calcSecurity(alerts), e = this._calcExcellence(files, totalFiles), c = this._calcCompliance(sec.high, sec.med);
        const raw = s + p + o + sec.security + e + c;
        return this._format(this._applyConstraints(raw, sec), s, p, o, sec.security, e, c);
    }

    private _emptyScore() { return { stability: 0, purity: 0, observability: 0, security: 0, excellence: 0, compliance: 0, total: 0 }; }
    private _calcStability(f: any, t: number) { return (Object.values(f).filter((x: any) => x.has_test).length / t) * 35; }
    private _calcPurity(a: number) { return Math.max(0, 15 - ((a - 1) * 1.5)); }
    private _calcObs(f: any, t: number) { return (Object.values(f).filter((x: any) => x.component_type !== "TEST" && x.telemetry).length / t) * 10; }
    private _calcExcellence(f: any, t: number) { return (Object.values(f).filter((x: any) => x.purpose && x.purpose !== "UNKNOWN").length / t) * 10; }
    private _calcSecurity(a: any[]) {
        const c = { high: 0, med: 0, low: 0, strat: 0 };
        a.forEach(r => {
            if (typeof r !== "object") c.strat++;
            else if (r.severity === "critical" || r.severity === "high") c.high++;
            else if (r.severity === "medium") c.med++;
            else c.low++;
        });
        return { security: Math.max(0, 15 - (c.high * 5)), ...c };
    }
    private _calcCompliance(h: number, m: number) { return POLICIES[this.getComplianceLevel(h, m)].vetoThreshold * 15; }
    private _applyConstraints(r: number, s: any) {
        const lvl = this.getComplianceLevel(s.high, s.med), c = { [ComplianceLevel.CRITICAL]: 20, [ComplianceLevel.DEGRADED]: 40, [ComplianceLevel.SUBSTANDARD]: 60, [ComplianceLevel.STANDARD]: 85, [ComplianceLevel.EXCELLENT]: 95, [ComplianceLevel.SOVEREIGN]: 100 };
        return Math.max(0, Math.min(r, (c as any)[lvl] || 100) - (((s.high * 15) + (s.med * 5) + (s.low)) * 0.2));
    }
    private _format(t: number, s: number, p: number, o: number, sec: number, e: number, c: number) {
        return { stability: +s.toFixed(2), purity: +p.toFixed(2), observability: +o.toFixed(2), security: +sec.toFixed(2), excellence: +e.toFixed(2), compliance: +c.toFixed(2), total: +t.toFixed(2) };
    }
    public getComplianceLevel(h: number, m: number): ComplianceLevel {
        if (h > 5) return ComplianceLevel.CRITICAL; if (h > 2) return ComplianceLevel.DEGRADED; if (h > 0) return ComplianceLevel.SUBSTANDARD;
        if (m > 5) return ComplianceLevel.STANDARD; if (m > 0) return ComplianceLevel.EXCELLENT; return ComplianceLevel.SOVEREIGN;
    }
}
