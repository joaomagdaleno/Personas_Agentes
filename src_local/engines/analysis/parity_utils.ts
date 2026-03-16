import type { AtomicFingerprint, AgentDelta } from "./parity_types";
import { FingerprintExtractor } from "./strategies/FingerprintExtractor.ts";
import { DeltaEngine } from "./strategies/DeltaEngine.ts";

/**
 * 🛠️ ParityUtils — PhD in Semantic Consistency & Delta Mapping.
 */

export async function extractPythonFingerprint(content: string, name: string): Promise<AtomicFingerprint> {
    const extractor = new FingerprintExtractor();
    return await extractor.extractPython(content, name);
}

export async function extractTSFingerprint(content: string, name: string): Promise<AtomicFingerprint | null> {
    const extractor = new FingerprintExtractor();
    return await extractor.extractTS(content, name);
}

export function computeDeltas(legacy: AtomicFingerprint, current: AtomicFingerprint, agent: string): AgentDelta[] {
    return DeltaEngine.compute(legacy, current, agent);
}

export function computeScore(deltas: AgentDelta[]): number {
    return DeltaEngine.computeScore(deltas);
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
