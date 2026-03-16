import * as path from 'path';
import { StructureClassifier } from "./StructureClassifier.ts";
import { TestDiscoveryStrategy } from "./TestDiscoveryStrategy.ts";

export class MatrixBuilder {
    static build(file: string, info: any, mapData: any, skipFn: (f: string, i: any) => boolean, statusFn: (s: string, c: number, a: number) => string, mapFn: (i: any, a: any) => any): any {
        if (skipFn(file, info)) return null;
        const targetName = path.parse(file).name, testInfo = TestDiscoveryStrategy.findTestForModule(targetName, mapData);
        const cc = info.complexity || 1, assertions = testInfo?.test_depth?.assertion_count || 0, structure = StructureClassifier.classify(file, info), advanced = info.advanced_metrics || {};
        return {
            file, assertions, originalComplexity: cc, instability: info.coupling?.instability || 0,
            complexity: (advanced.isShadow && advanced.shadowComplexity) ? advanced.shadowComplexity : cc,
            coverage_ratio: Number(((assertions * 5) / Math.max(1, cc)).toFixed(2)),
            test_status: statusFn(structure, cc, assertions),
            advanced_metrics: mapFn(info, advanced)
        };
    }
}
