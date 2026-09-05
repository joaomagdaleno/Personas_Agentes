import * as fs from "node:fs";
import * as path from "node:path";
import type { PsaPlugin } from "../../kernel/psa_plugin.ts";
import type { PsaContext } from "../../kernel/psa_context.ts";

export interface SkillSummary {
    name: string;
    description: string;
    path: string;
    modelInvocable: boolean;
    userInvocable: boolean;
}

export interface SkillDetails extends SkillSummary {
    content: string;
    frontmatter: Record<string, any>;
}

export interface SkillPluginConfig {
    skillsDir?: string;
    catalogDescriptionMaxLength?: number;
}

/**
 * 🧠 PsaSkillPlugin
 *
 * Implementação soberana e de alto desempenho do carregador de habilidades sob demanda (`skill`, `skill.list`, `skill.load`).
 * Descobre habilidades a partir de arquivos `.psa_skills/` ou `.skills/` contendo `SKILL.md` com YAML frontmatter.
 * Permite ao agente manter contexto enxuto e carregar instruções detalhadas apenas quando necessário.
 */
export class SkillPlugin implements PsaPlugin {
    public name = "psa-plugin-skill";
    public version = "1.0.0";
    public description = "Catálogo durável e carregamento sob demanda de habilidades modulares para o agente.";

    private skillsDir: string;
    private catalogDescriptionMaxLength: number;
    private cache: Map<string, SkillDetails> = new Map();

    constructor(config: SkillPluginConfig = {}) {
        this.skillsDir = config.skillsDir || ".psa_skills";
        this.catalogDescriptionMaxLength = config.catalogDescriptionMaxLength || 500;
    }

    private parseFrontmatter(text: string): { frontmatter: Record<string, any>; content: string } {
        const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
        if (!match) {
            return { frontmatter: {}, content: text };
        }

        const rawYaml = match[1];
        const content = match[2];
        const frontmatter: Record<string, any> = {};

        for (const line of rawYaml.split(/\r?\n/)) {
            const kv = line.split(":");
            if (kv.length >= 2) {
                const key = kv[0].trim();
                const val = kv.slice(1).join(":").trim().replace(/^['"]|['"]$/g, "");
                if (val === "true") frontmatter[key] = true;
                else if (val === "false") frontmatter[key] = false;
                else if (!isNaN(Number(val)) && val !== "") frontmatter[key] = Number(val);
                else frontmatter[key] = val;
            }
        }

        return { frontmatter, content };
    }

    public scanSkills(workspaceRoot: string): SkillDetails[] {
        const potentialDirs = [
            path.resolve(workspaceRoot, this.skillsDir),
            path.resolve(workspaceRoot, ".skills"),
            path.resolve(workspaceRoot, "skills")
        ];

        this.cache.clear();
        const results: SkillDetails[] = [];

        for (const dir of potentialDirs) {
            if (!fs.existsSync(dir)) continue;

            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                let skillPath = "";
                let skillName = "";

                if (entry.isDirectory()) {
                    const skillMd = path.join(dir, entry.name, "SKILL.md");
                    if (fs.existsSync(skillMd)) {
                        skillPath = skillMd;
                        skillName = entry.name;
                    }
                } else if (entry.isFile() && entry.name.endsWith(".md")) {
                    skillPath = path.join(dir, entry.name);
                    skillName = path.basename(entry.name, ".md");
                }

                if (skillPath) {
                    try {
                        const rawText = fs.readFileSync(skillPath, "utf-8");
                        const { frontmatter, content } = this.parseFrontmatter(rawText);

                        const name = (frontmatter.name as string) || skillName;
                        let desc = (frontmatter.description as string) || content.slice(0, 150).trim();
                        if (desc.length > this.catalogDescriptionMaxLength) {
                            desc = desc.slice(0, this.catalogDescriptionMaxLength - 3) + "...";
                        }

                        const details: SkillDetails = {
                            name,
                            description: desc,
                            path: skillPath,
                            modelInvocable: frontmatter["disable-model-invocation"] !== true,
                            userInvocable: frontmatter["disable-user-invocation"] !== true,
                            content,
                            frontmatter
                        };

                        this.cache.set(name, details);
                        results.push(details);
                    } catch (e) {
                        // Ignora arquivos ilegíveis no scanner de skills
                    }
                }
            }
        }

        return results;
    }

    public apply(ctx: PsaContext): void {
        const getSkill = (name: string): SkillDetails => {
            if (this.cache.size === 0) {
                this.scanSkills(ctx.workspaceRoot);
            }
            const skill = this.cache.get(name);
            if (!skill) {
                // Re-escaneia se não encontrou inicialmente
                this.scanSkills(ctx.workspaceRoot);
                const retry = this.cache.get(name);
                if (!retry) {
                    throw new Error(`Habilidade "${name}" não encontrada no catálogo de skills.`);
                }
                return retry;
            }
            return skill;
        };

        const executeLoad = async (args: { name: string }) => {
            if (!args.name || typeof args.name !== "string") {
                throw new Error("O argumento 'name' é obrigatório para carregar uma skill.");
            }
            const skill = getSkill(args.name);
            return {
                name: skill.name,
                description: skill.description,
                path: path.relative(ctx.workspaceRoot, skill.path),
                frontmatter: skill.frontmatter,
                content: skill.content
            };
        };

        const executeList = async () => {
            const skills = this.scanSkills(ctx.workspaceRoot);
            return {
                total: skills.length,
                skills: skills.map(s => ({
                    name: s.name,
                    description: s.description,
                    path: path.relative(ctx.workspaceRoot, s.path),
                    modelInvocable: s.modelInvocable
                }))
            };
        };

        // 1. skill (upstream canonical loader)
        ctx.tools.register({
            name: "skill",
            description: "Carrega as instruções completas de uma habilidade disponível. Chame com o nome exato da skill antes de agir em tarefas que requerem esse conhecimento especializado.",
            schema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "O nome exato da habilidade contida no catálogo disponível." }
                },
                required: ["name"]
            },
            isExclusive: false,
            execute: executeLoad
        });

        // 2. skill.load (namespace moderno)
        ctx.tools.register({
            name: "skill.load",
            description: "Carrega instruções especializadas de uma habilidade do catálogo (alias moderno para skill).",
            schema: {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"]
            },
            isExclusive: false,
            execute: executeLoad
        });

        // 3. skill.list (inspeção do catálogo)
        ctx.tools.register({
            name: "skill.list",
            description: "Lista todas as habilidades modulares disponíveis para este workspace.",
            schema: {
                type: "object",
                properties: {}
            },
            isExclusive: false,
            execute: executeList
        });
    }
}
