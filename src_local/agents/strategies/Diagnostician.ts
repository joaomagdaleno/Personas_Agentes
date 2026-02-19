export class Diagnostician {
    static diagnose(name: string, emoji: string, prompt: string): { status: string; score: number; issues: string[] } {
        const issues = [];
        if (name === "Base") issues.push("Name not customized");
        if (emoji === "👤") issues.push("Emoji not customized");
        if (!prompt || prompt.length < 10) issues.push("System prompt short");
        return { status: issues.length === 0 ? "HEALTHY" : "DEGRADED", score: 100 - (issues.length * 10), issues };
    }
}
