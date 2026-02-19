import { ThresholdHelpers } from "./ThresholdHelpers.ts";
import { ComplianceHelpers } from "./ComplianceHelpers.ts";

/**
 * 🧮 CalcHelpers - PhD in Metric Synthetics
 * Split architecture to reach CC < 10.
 */
export class CalcHelpers {
    static aggregate(item: any, mapData: any, stats: any) {
        const m = item.advanced_metrics || {}, info = mapData[item.file] || {};
        ThresholdHelpers.checkStructural(m, stats);
        ComplianceHelpers.checkQuality(m, stats, item, info);
    }
}
