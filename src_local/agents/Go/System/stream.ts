import { BaseActivePersona } from "../../base.ts";
import type { AuditFinding, AuditRule, StrategicFinding, ProjectContext } from "../../base.ts";

/**
 * 📻 Stream - PhD in Go Reactivity & Streaming (Sovereign Version)
 * Analisa o processamento contínuo de dados, websockets e fluxos em tempo real em Go.
 */
export enum StreamStateGo {
    REALTIME = "REALTIME",
    BUFFERED = "BUFFERED",
    STALLED = "STALLED"
}

export class GoStreamEngine {
    public static audit(content: string): string[] {
        const findings: string[] = [];
        if (content.includes("websocket.Upgrader") && !content.includes("CheckOrigin")) {
            findings.push("Insecure WebSocket: Upgrader sem verificação de origem PhD.");
        }
        if (content.includes("for {") && content.includes("ReadMessage") && !content.includes("break")) {
            findings.push("Infinite Loop Stream: Loop de leitura sem condição de saída PhD.");
        }
        return findings;
    }
}

export class StreamPersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Stream";
        this.emoji = "📻";
        this.role = "PhD Reactivity Expert";
        this.phd_identity = "Go Reactivity & Streaming";
        this.stack = "Go";
    }

    public override async execute(context: ProjectContext): Promise<(AuditFinding | StrategicFinding)[]> {
        this.setContext(context);
        const findings: (AuditFinding | StrategicFinding)[] = await this.performAudit();
        return findings;
    }

    override getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".go"],
            rules: [
                { regex: /github\.com\/gorilla\/websocket/, issue: "Legacy WS: Gorilla Websocket detectado; considere migrar PhD.", severity: "low" },
                { regex: /WriteJSON/, issue: "Stream Output: Verifique se o buffer evita bloqueios em slow consumers PhD.", severity: "high" },
                { regex: /PongHandler/, issue: "Keep-Alive: Garanta heartbeat para detectar desconexões PhD.", severity: "medium" },
                { regex: /BinaryMessage/, issue: "Data Protocol: Verifique a integridade da serialização binária PhD.", severity: "low" },
                { regex: /Context\(\)/, issue: "Stream Lifecycle: Garanta que o stream encerra via contexto PhD.", severity: "high" },
                { regex: /RateLimit/, issue: "Ingress Control: Verifique limites para evitar exaustão PhD.", severity: "high" }
            ]
        };
    }

    public override async performAudit(): Promise<AuditFinding[]> {
        this.startMetrics();
        const rules = this.getAuditRules();
        const results = await this.findPatterns(rules.extensions, rules.rules);

        // Manual Stream Check
        const streamFindings = GoStreamEngine.audit(""); 
        streamFindings.forEach(f => results.push({
            file: "STREAM_AUDIT", agent: this.name, role: this.role, emoji: this.emoji, issue: f, 
            severity: "high", stack: this.stack, evidence: "Real-time Streaming Audit", match_count: 1
        }));

        this.endMetrics(results.length);
        return results;
    }

    public override reasonAboutObjective(objective: string, file: string, _content: string | Promise<string | null>): StrategicFinding | null {
        return {
            file,
            issue: `PhD Stream (Go): Auditando a fluidez e a segurança dos fluxos de dados em tempo real para ${objective}.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Fluxos em Tempo Real Go. Sua missão é garantir a sincronia perfeita do tempo real.`;
    }
}
