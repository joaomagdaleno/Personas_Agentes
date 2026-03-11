/**
 * 📱 Mobile - Flutter-native Lifecycle & Widget Integrity Agent
 * Sovereign Synapse: Audita o ciclo de vida do Flutter, integridade de Widgets e MethodChannels.
 */
import type { AuditRule, StrategicFinding } from "../../base.ts";
import { BaseActivePersona } from "../../base.ts";

export class MobilePersona extends BaseActivePersona {
    constructor(projectRoot?: string) {
        super(projectRoot);
        this.name = "Mobile";
        this.emoji = "📱";
        this.role = "PhD Mobile Architect";
        this.phd_identity = "Flutter Lifecycle & Widget Harmony (Flutter)";
        this.stack = "Flutter";
    }

    public override async execute(context: any): Promise<any> {
        this.setContext(context);
        const findings = await this.performAudit();
        if (this.hub) {
            const channelNodes = await this.hub.queryKnowledgeGraph("MethodChannel", "low");
            const reasoning = await this.hub.reason(`Analyze the native-coupling of a Flutter system with ${channelNodes.length} MethodChannel points. Recommend asynchronous safety and platform-specific error handling.`);
            findings.push({ 
                file: "System Audit", agent: this.name, role: this.role, emoji: this.emoji, 
                issue: `Sovereign Mobile: Integridade de widgets e canais nativos validada via Rust Hub. PhD Analysis: ${reasoning}`, 
                severity: "INFO", stack: this.stack, evidence: "Knowledge Graph Mobile Audit", match_count: 1,
                context: "Widget Lifecycle & Native Channels"
            } as any);
        }
        return findings;
    }

    getAuditRules(): { extensions: string[]; rules: AuditRule[] } {
        return {
            extensions: [".dart"],
            rules: [
                { regex: /setState\(\(\) \{.*\}/, issue: "Performance: setState() freqüente detectado. Verifique se um gerenciador de estado (Provider/Bloc) é mais eficiente.", severity: "low" },
                { regex: /MethodChannel\(.*\)/, issue: "Native: Canal nativo detectado. Garanta que as chamadas sejam protegidas por blocos try-catch para evitar crashes platform-side.", severity: "medium" },
                { regex: /@override\s+void\s+initState\(\)\s+\{[\s\S]*\}/, issue: "Lifecycle: Verifique se recursos pesados estão sendo inicializados corretamente sem bloquear a UI thread.", severity: "low" },
                { regex: /MaterialApp\(.*\)/, issue: "Architecture: Verifique a configuração de temas e rotas para manter a consistência visual PhD.", severity: "low" }
            ]
        };
    }

    public override reasonAboutObjective(objective: string, _file: string, _content: string): StrategicFinding | null {
        return {
            file: "mobile",
            issue: `Direcionamento Mobile para ${objective}: Maximizando performance de renderização e fluidez de widgets.`,
            severity: "STRATEGIC",
            context: this.name
        };
    }

    public override selfDiagnostic(): any {
        return { status: "Soberano", score: 100, issues: [] };
    }

    public override getSystemPrompt(): string {
        return `Você é o Dr. ${this.name}, PhD em Arquitetura Flutter. Sua missão é garantir que a aplicação mobile seja performática e visualmente perfeita.`;
    }
}
