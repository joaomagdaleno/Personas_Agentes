import winston from "winston";
import { Path } from "./path_utils.ts";

const logger = winston.child({ module: "TaskOrchestrator" });

/**
 * Orquestrador de Tarefas (Bun Version).
 */
export class TaskOrchestrator {
    orc: any;

    constructor(orchestrator: any) {
        this.orc = orchestrator;
    }

    async runAuditCycle(activePhds: any[], obj: string, changedFiles: Record<string, string>, context: any): Promise<any[]> {
        /** Executa o ciclo paralelo de auditoria para os PhDs selecionados. */
        const auditTask = async (agent: any) => {
            if (typeof agent.setContext === 'function') {
                agent.setContext({ identity: context.identity, map: context.map });
            }
            const res: any[] = [];
            if (Object.keys(changedFiles).length > 0 && typeof agent.performAudit === 'function') {
                res.push(...await agent.performAudit());
            }
            if (typeof agent.performStrategicAudit === 'function') {
                res.push(...await agent.performStrategicAudit(obj));
            }
            return res;
        };

        const nestedResults = await this.orc.executor.runParallel(auditTask, activePhds);
        return nestedResults.flat();
    }

    async runTargetedVerification(auditMap: Record<string, string[]>): Promise<any[]> {
        /** Surgically verifies specific files using the assigned agents. */
        const verifiedFindings: any[] = [];
        for (const [file, agents] of Object.entries(auditMap)) {
            const fullPath = this.orc.projectRoot.join(file);
            if (!(await fullPath.exists())) continue;

            const content = await this.orc.contextEngine.analyst.readProjectFile(fullPath.toString());
            if (!content) continue;

            for (const agentName of agents) {
                const agent = this.orc.personas.find((p: any) => p.name === agentName);
                if (agent && typeof agent.performStrategicAudit === 'function') {
                    // Inicia auditoria estratégica cirúrgica
                    verifiedFindings.push(...await agent.performStrategicAudit({ fileTarget: file, contentTarget: content }));
                }
            }
        }
        return verifiedFindings;
    }

    selectActivePhds(objective: string, stacks: Set<string>, personas: any[]): any[] {
        /** Filtra PhDs aptos para a missão baseado no objetivo e stack. */
        const lowObj = objective.toLowerCase();
        const isCrit = ["segurança", "crítico", "vulnerabilidade"].some(k => lowObj.includes(k));

        const isEligible = (p: any) => {
            if (p.stack && !stacks.has(p.stack) && p.stack !== "Universal") return false;
            // Simplified criticality filtering for now
            return true;
        };

        return personas.filter(isEligible);
    }
}
