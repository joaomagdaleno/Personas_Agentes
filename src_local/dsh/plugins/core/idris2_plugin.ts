import { FormalVerificationEngine } from "../../../engines/healing/formal_verification_engine.ts";
import type { DshPlugin } from "../../kernel/dsh_plugin.ts";
import type { DshContext } from "../../kernel/dsh_context.ts";

export class Idris2FormalVerificationPlugin implements DshPlugin {
    public name = "dsh-plugin-idris2-verifier";
    public version = "1.0.0";
    public description = "Portão de provas matemáticas formais para validação de segurança e contratos de tipos.";

    public apply(ctx: DshContext): void {
        const engine = FormalVerificationEngine.getInstance();

        // 1. Registra a ferramenta idris2_verifier.verify
        ctx.tools.register({
            name: "idris2_verifier.verify",
            description: "Verifica formalmente a corretude de um patch de código contra teoremas e contratos matemáticos.",
            schema: {
                type: "object",
                properties: {
                    patchCode: { type: "string", description: "Código do patch a ser verificado" }
                },
                required: ["patchCode"]
            },
            isExclusive: true, // Portão de segurança atômico
            execute: async (args: { patchCode: string }) => {
                const report = engine.verifyPatch(args.patchCode, "dsh_verified_contract.ts");
                if (!report.approved) {
                    throw new Error(`Contratos formais violados: ${report.contracts.join(", ")}`);
                }
                return { approved: true, contracts: report.contracts };
            }
        });

        // 2. Registra hook tools/post-execute para inspecionar saídas contendo patches
        ctx.events.waterfall("tools/post-execute", async (payload, next) => {
            const raw = payload.result;
            if (typeof raw === "string" && (raw.includes("```") || raw.includes("DELETE FROM") || raw.includes("DROP TABLE"))) {
                const check = engine.verifyPatch(raw, "dsh_waterfall_target.ts");
                if (!check.approved) {
                    console.warn(`⚠️ [Idris 2 Plugin] Violação matemática detectada em ${payload.toolName}!`);
                }
            }
            return await next();
        });
    }
}

export { Idris2FormalVerificationPlugin as Idris2Plugin };
