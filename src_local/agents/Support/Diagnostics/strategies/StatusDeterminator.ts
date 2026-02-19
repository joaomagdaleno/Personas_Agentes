export class StatusDeterminator {
    static determine(structure: string, cc: number, assertions: number): string {
        if (assertions === 0) return "UNTESTED";
        if (assertions < (cc / 2)) return "SHALLOW";
        if (structure === "FLAKY") return "UNSTABLE";
        return "STABLE";
    }
}
