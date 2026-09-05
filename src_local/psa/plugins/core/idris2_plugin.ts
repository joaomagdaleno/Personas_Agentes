import { FormalVerificationEngine } from "../../../engines/healing/formal_verification_engine.ts";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export class Idris2FormalVerificationPlugin implements PsaPlugin {
    public name = "psa-plugin-idris2-verifier";
    public version = "1.0.0";
    public description = "Portão de provas matemáticas formais para validação de segurança e contratos de tipos.";

    public apply(ctx: PsaContext): void {
        const engine = FormalVerificationEngine.getInstance();

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
            isExclusive: true,
            execute: async (args: { patchCode: string }) => {
                const report = engine.verifyPatch(args.patchCode, "psa_verified_contract.ts");
                if (!report.approved) {
                    throw new Error(`Contratos formais violados: ${report.contracts.join(", ")}`);
                }
                return { approved: true, contracts: report.contracts };
            }
        });

        ctx.events.waterfall("tools/post-execute", async (payload, next) => {
            const raw = payload.result;
            if (typeof raw === "string" && (raw.includes("```") || raw.includes("DELETE FROM") || raw.includes("DROP TABLE"))) {
                const check = engine.verifyPatch(raw, "psa_waterfall_target.ts");
                if (!check.approved) {
                    console.warn(`⚠️ [PSA Idris 2 Plugin] Violação matemática detectada em ${payload.toolName}!`);
                }
            }
            return await next();
        });
    }
}

export { Idris2FormalVerificationPlugin as Idris2Plugin };
