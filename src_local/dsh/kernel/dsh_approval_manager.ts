export interface ApprovalRequest {
    callId: string;
    sessionId: string;
    toolName: string;
    args: any;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    resolvedAt?: string;
    resolve?: (approved: boolean) => void;
}

/**
 * 🛡️ DshApprovalManager
 *
 * Gerencia os pedidos de autorização do operador humano (Human-in-the-Loop)
 * para ferramentas exclusivas ou de alto privilégio (shell.exec, write_file, etc.).
 */
export class DshApprovalManager {
    private pending: Map<string, ApprovalRequest> = new Map();

    /**
     * Registra uma requisição de aprovação e retorna uma Promise que resolve quando o operador clica em Aprovar/Rejeitar.
     */
    public requestApproval(params: { callId: string; sessionId: string; toolName: string; args: any; autoApproveIfTest?: boolean }): Promise<boolean> {
        if (params.autoApproveIfTest || process.env.DSH_AUTO_APPROVE === "true") {
            return Promise.resolve(true);
        }

        return new Promise<boolean>((resolve) => {
            const req: ApprovalRequest = {
                callId: params.callId,
                sessionId: params.sessionId,
                toolName: params.toolName,
                args: params.args,
                status: "pending",
                createdAt: new Date().toISOString(),
                resolve
            };

            this.pending.set(params.callId, req);

            // Timeout de segurança de 60 segundos caso o operador não responda
            setTimeout(() => {
                if (this.pending.has(params.callId)) {
                    const r = this.pending.get(params.callId);
                    if (r && r.status === "pending") {
                        r.status = "rejected";
                        this.pending.delete(params.callId);
                        resolve(false);
                    }
                }
            }, 60000);
        });
    }

    /**
     * Resolve uma aprovação pendente pelo callId (chamado pelo endpoint /v1/approval)
     */
    public resolveApproval(callId: string, approved: boolean): boolean {
        const req = this.pending.get(callId);
        if (!req || req.status !== "pending") {
            return false;
        }

        req.status = approved ? "approved" : "rejected";
        req.resolvedAt = new Date().toISOString();
        this.pending.delete(callId);

        if (req.resolve) {
            req.resolve(approved);
        }
        return true;
    }

    public getPending(): ApprovalRequest[] {
        return Array.from(this.pending.values());
    }

    public get(callId: string): ApprovalRequest | undefined {
        return this.pending.get(callId);
    }
}
