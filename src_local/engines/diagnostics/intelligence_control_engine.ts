import * as fs from "node:fs";
import * as path from "node:path";
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} - IntelligenceControl - ${level.toUpperCase()} - ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

export interface DetectedTechnology {
  id: string;
  name: string;
  category: "Language" | "Runtime" | "AI/SLM" | "Database" | "IPC/RPC" | "Security" | "Frontend" | "Search Engine";
  evidenceFiles: string[];
  description: string;
}

export interface PersonaCapability {
  personaKey: string;
  displayName: string;
  serviceFile: string;
  handledTechnologies: string[];
  auditRulePatternsCount: number;
}

export interface BlindspotFinding {
  techId: string;
  techName: string;
  category: string;
  evidenceFiles: string[];
  recommendedPersonaKey: string;
  recommendedPersonaName: string;
  gapReason: string;
  actionableRecommendation: string;
}

export interface IntelligenceCoverageReport {
  timestamp: string;
  totalTechnologiesDetected: number;
  totalSuperPersonasEvaluated: number;
  coveredTechnologiesCount: number;
  blindspotCount: number;
  coveragePercentage: number;
  detectedTechnologies: DetectedTechnology[];
  personaCapabilities: PersonaCapability[];
  blindspots: BlindspotFinding[];
}

/**
 * 🧠 IntelligenceControlEngine
 *
 * Mapeia recursivamente todas as tecnologias e features do projeto (SLMs, WASM, GGUF, ZvecGrep, Zig, Go, gRPC, SQLite, etc.),
 * avalia a capacidade de cobertura das 8 Super Personas e identifica pontos cegos de inteligência com recomendações detalhadas.
 */
export class IntelligenceControlEngine {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Scans codebase for installed features, tools, dependencies, and code constructs
   */
  public detectProjectTechnologies(): DetectedTechnology[] {
    const technologies: DetectedTechnology[] = [];
    const files = this.getAllFiles(this.projectRoot);

    // Inspect manifest files directly (e.g., package.json, Cargo.toml, go.mod, build.zig, opencode.jsonc)
    const manifests = ["package.json", "opencode.jsonc", "Cargo.toml", "go.mod", "build.zig", ".env.example"];
    const manifestContents: Record<string, string> = {};
    for (const m of manifests) {
      const p = path.join(this.projectRoot, m);
      if (fs.existsSync(p)) {
        try {
          manifestContents[m] = fs.readFileSync(p, "utf-8");
        } catch {}
      }
    }

    const techCatalog: Array<{
      id: string;
      name: string;
      category: DetectedTechnology["category"];
      pattern: RegExp;
      manifestCheck?: (manifests: Record<string, string>) => boolean;
      description: string;
    }> = [
      {
        id: "ts_bun",
        name: "TypeScript / Bun Runtime",
        category: "Runtime",
        pattern: /Bun\.(serve|file|spawn|FFI)|from "bun"/i,
        manifestCheck: (m) => !!m["package.json"] && m["package.json"].includes("typescript"),
        description: "Runtime JS/TS de alta velocidade com FFI nativo."
      },
      {
        id: "slm_gguf",
        name: "SLM / Local GGUF (Llama.cpp)",
        category: "AI/SLM",
        pattern: /\.gguf|WarmPurgeOfflineEngine|llama/i,
        description: "Modelos locais offline compactos Qwen 0.5B em formato GGUF."
      },
      {
        id: "cloud_ai_dual",
        name: "Dual-API Cloud Engine (Gemini/HF)",
        category: "AI/SLM",
        pattern: /DualAPIEngine|generativelanguage\.googleapis\.com|huggingface/i,
        description: "Roteamento inteligente com failover entre Gemini 1.5 e Hugging Face."
      },
      {
        id: "zvec_grep",
        name: "ZvecGrep (Hybrid Vector/BM25 Search)",
        category: "Search Engine",
        pattern: /@zvec\/zvec-grep|ZvecGrepEngine|createZvecGrep/i,
        manifestCheck: (m) => !!m["package.json"] && m["package.json"].includes("@zvec/zvec-grep"),
        description: "Motor de busca híbrido vetorial + BM25 + ripgrep para agentes."
      },
      {
        id: "wasm_micro_agents",
        name: "WASM Micro-Agents (WASI Runtime)",
        category: "Runtime",
        pattern: /WasmMicroAgentRuntime|\.wasm|WASI/i,
        manifestCheck: (m) => !!m["package.json"] && (m["package.json"].includes("wasm") || m["package.json"].includes("agents_registry")),
        description: "Micro-agentes efémeros rodando em sandbox WebAssembly WASI."
      },
      {
        id: "zig_native_ffi",
        name: "Zig Native Analyzer & FFI",
        category: "Language",
        pattern: /\.zig|libzig_analyzer|ReadDirectoryChangesW/i,
        manifestCheck: (m) => !!m["build.zig"],
        description: "Código de alta performance em Zig integrado via FFI no Bun."
      },
      {
        id: "go_hub_grpc",
        name: "Go Hub gRPC Proxy",
        category: "IPC/RPC",
        pattern: /go-scanner|hub\.exe|@grpc\/grpc-js|HubManagerGRPC/i,
        manifestCheck: (m) => !!m["package.json"] && m["package.json"].includes("@grpc/grpc-js"),
        description: "Barramento gRPC Go persistente para movimentação massiva de dados e AST."
      },
      {
        id: "rust_simd",
        name: "Rust SIMD Analyzer & FFI",
        category: "Language",
        pattern: /PatternFinder|cargo|src_native\/analyzer/i,
        description: "Motor de auditoria de código e buscas Regex em Rust SIMD."
      },
      {
        id: "nim_canvas",
        name: "Nim Canvas Desktop Interface",
        category: "Frontend",
        pattern: /\.nim|CoderNim/i,
        description: "Interface desktop nativa renderizada direto em Canvas via Nim."
      },
      {
        id: "sqlite_persistence",
        name: "SQLite Persistence & Stability Ledger",
        category: "Database",
        pattern: /DatabaseHub|bun:sqlite|stability_ledger/i,
        description: "Persistência relacional local SQLite para histórico e estado."
      },
      {
        id: "micro_gpt_neural",
        name: "MicroGPT Neural Subsystem",
        category: "AI/SLM",
        pattern: /MicroGPT|NeuralSubsystemService|PredictorEngine/i,
        description: "Rede neural própria em TypeScript para análise preditiva de anomalias."
      }
    ];

    for (const tech of techCatalog) {
      const evidences: string[] = [];

      // Add manifest evidence if manifest check passes
      if (tech.manifestCheck && tech.manifestCheck(manifestContents)) {
        for (const mName of manifests) {
          if (manifestContents[mName] && (tech.pattern.test(manifestContents[mName]) || mName === "package.json")) {
            evidences.push(mName);
            break;
          }
        }
      }

      // Scan all repository files
      for (const filePath of files) {
        try {
          const relativePath = path.relative(this.projectRoot, filePath).replace(/\\/g, "/");
          const content = fs.readFileSync(filePath, "utf-8");
          if (tech.pattern.test(content) || tech.pattern.test(relativePath)) {
            if (!evidences.includes(relativePath)) {
              evidences.push(relativePath);
            }
            if (evidences.length >= 5) break;
          }
        } catch {}
      }

      if (evidences.length > 0) {
        technologies.push({
          id: tech.id,
          name: tech.name,
          category: tech.category,
          evidenceFiles: evidences,
          description: tech.description
        });
      }
    }

    return technologies;
  }

  /**
   * Evaluates capabilities of the 8 Super Personas
   */
  public evaluatePersonaCapabilities(): PersonaCapability[] {
    const superPersonas = [
      {
        key: "strategic_cognitive_architect",
        name: "Strategic Cognitive Architect",
        file: "src_local/engines/strategic/strategic_cognitive_architect_service.ts",
        handledTechs: ["slm_gguf", "cloud_ai_dual", "zvec_grep", "micro_gpt_neural", "ts_bun"]
      },
      {
        key: "audit_code_guardian",
        name: "Audit Code Guardian",
        file: "src_local/engines/diagnostics/audit_code_guardian_service.ts",
        handledTechs: ["rust_simd", "go_hub_grpc", "ts_bun"]
      },
      {
        key: "security_cloud_guardian",
        name: "Security Cloud Guardian",
        file: "src_local/engines/security/security_cloud_guardian_service.ts",
        handledTechs: ["ts_bun", "cloud_ai_dual"]
      },
      {
        key: "architecture_types",
        name: "Architecture Types",
        file: "src_local/engines/analysis/architecture_types_service.ts",
        handledTechs: ["go_hub_grpc", "rust_simd", "ts_bun"]
      },
      {
        key: "resilience_healing_architect",
        name: "Resilience Healing Architect",
        file: "src_local/engines/healing/resilience_healing_architect_service.ts",
        handledTechs: ["sqlite_persistence", "ts_bun", "zig_native_ffi"]
      },
      {
        key: "sys_perf_architect",
        name: "Sys Perf Architect",
        file: "src_local/engines/maintenance/sys_perf_architect_service.ts",
        handledTechs: ["ts_bun", "wasm_micro_agents"]
      },
      {
        key: "sync_devops_architect",
        name: "Sync DevOps Architect",
        file: "src_local/engines/automation/sync_devops_architect_service.ts",
        handledTechs: ["go_hub_grpc", "ts_bun"]
      },
      {
        key: "ui_ux_architect",
        name: "UI/UX Architect",
        file: "src_local/engines/reporting/ui_ux_architect_service.ts",
        handledTechs: ["nim_canvas", "ts_bun"]
      }
    ];

    return superPersonas.map(p => {
      let rulesCount = 0;
      const fullPath = path.join(this.projectRoot, p.file);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          rulesCount = (content.match(/getAuditRules|rules|patterns/g) || []).length;
        } catch {}
      }

      return {
        personaKey: p.key,
        displayName: p.name,
        serviceFile: p.file,
        handledTechnologies: p.handledTechs,
        auditRulePatternsCount: rulesCount
      };
    });
  }

  /**
   * Generates full intelligence coverage report with blindspot detection
   */
  public generateReport(): IntelligenceCoverageReport {
    const detectedTechs = this.detectProjectTechnologies();
    const personaCapabilities = this.evaluatePersonaCapabilities();

    const coveredTechIds = new Set<string>();
    personaCapabilities.forEach(p => p.handledTechnologies.forEach(t => coveredTechIds.add(t)));

    const blindspots: BlindspotFinding[] = [];

    const techToPersonaRecommendation: Record<string, { key: string; name: string; gap: string; rec: string }> = {
      "wasm_micro_agents": {
        key: "sys_perf_architect",
        name: "Sys Perf Architect",
        gap: "Sistemas de sandbox WASM com limite de concorrência não possuem regras ativas de monitoramento no Sys Perf Architect.",
        rec: "Adicionar validação de vazamento de memória e limite de concorrência WASI no SysPerfArchitectService."
      },
      "zig_native_ffi": {
        key: "resilience_healing_architect",
        name: "Resilience Healing Architect",
        gap: "O FFI nativo em Zig (ReadDirectoryChangesW) carece de regras de auditoria de estabilidade nativa no Resilience Healing Architect.",
        rec: "Expandir o ResilienceHealingArchitectService para verificar a saúde dos binários nativos Zig (.so/.dll) durante o auto-healing."
      }
    };

    for (const tech of detectedTechs) {
      if (!coveredTechIds.has(tech.id)) {
        const rec = techToPersonaRecommendation[tech.id] || {
          key: "strategic_cognitive_architect",
          name: "Strategic Cognitive Architect",
          gap: `A tecnologia ${tech.name} foi detectada no projeto mas não está catalogada no escopo das 8 Super Personas.`,
          rec: `Enriquecer as regras de auditoria em getAuditRules() da persona recomendada para incluir suporte a ${tech.name}.`
        };

        blindspots.push({
          techId: tech.id,
          techName: tech.name,
          category: tech.category,
          evidenceFiles: tech.evidenceFiles,
          recommendedPersonaKey: rec.key,
          recommendedPersonaName: rec.name,
          gapReason: rec.gap,
          actionableRecommendation: rec.rec
        });
      }
    }

    const coveredCount = detectedTechs.length - blindspots.length;
    const coveragePercentage = detectedTechs.length > 0
      ? Number(((coveredCount / detectedTechs.length) * 100).toFixed(1))
      : 100;

    const report: IntelligenceCoverageReport = {
      timestamp: new Date().toISOString(),
      totalTechnologiesDetected: detectedTechs.length,
      totalSuperPersonasEvaluated: personaCapabilities.length,
      coveredTechnologiesCount: coveredCount,
      blindspotCount: blindspots.length,
      coveragePercentage,
      detectedTechnologies: detectedTechs,
      personaCapabilities,
      blindspots
    };

    this.writeMarkdownReport(report);
    this.logConsoleReport(report);

    return report;
  }

  /**
   * Writes docs/INTELLIGENCE_COVERAGE_REPORT.md
   */
  private writeMarkdownReport(report: IntelligenceCoverageReport): void {
    const docsDir = path.join(this.projectRoot, "docs");
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const markdownLines = [
      `# 🧠 Relatório de Cobertura de Inteligência e Pontos Cegos das Super Personas`,
      ``,
      `> **Data de Gerado:** ${report.timestamp}`,
      `> **Status Geral de Inteligência:** ${report.coveragePercentage}% Coberto (${report.coveredTechnologiesCount}/${report.totalTechnologiesDetected} Tecnologias)`,
      ``,
      `---`,
      ``,
      `## 📊 Resumo Executivo`,
      `- **Tecnologias Detectadas no Projeto:** ${report.totalTechnologiesDetected}`,
      `- **Super Personas Avaliadas:** ${report.totalSuperPersonasEvaluated}`,
      `- **Tecnologias Cobertas:** ${report.coveredTechnologiesCount}`,
      `- **Pontos Cegos Identificados:** ${report.blindspotCount}`,
      ``,
      `---`,
      ``,
      `## 🛠️ Tecnologias Mapeadas no Projeto`,
      `| ID | Tecnologia / Feature | Categoria | Evidências / Módulos |`,
      `| :--- | :--- | :--- | :--- |`
    ];

    for (const tech of report.detectedTechnologies) {
      const sampleEv = tech.evidenceFiles.slice(0, 2).map(e => `\`${e}\``).join(", ");
      markdownLines.push(`| \`${tech.id}\` | **${tech.name}** | ${tech.category} | ${sampleEv} |`);
    }

    markdownLines.push(
      ``,
      `---`,
      ``,
      `## 🚨 Pontos Cegos Detectados e Recomendações de Ação`,
      ``
    );

    if (report.blindspots.length === 0) {
      markdownLines.push(`✅ **Nenhum ponto cego detectado! Todas as tecnologias do projeto estão cobertas pelas 8 Super Personas.**`);
    } else {
      for (const blind of report.blindspots) {
        markdownLines.push(
          `### 🎯 Ponto Cego: ${blind.techName} (\`${blind.techId}\`)`,
          `- **Categoria:** ${blind.category}`,
          `- **Arquivos Evidência:** ${blind.evidenceFiles.map(e => `\`${e}\``).join(", ")}`,
          `- **Super Persona Responsável Recomendada:** **${blind.recommendedPersonaName}** (\`${blind.recommendedPersonaKey}\`)`,
          `- **Causa do Ponto Cego:** ${blind.gapReason}`,
          `- **Recomendação de Ação:** 💡 *${blind.actionableRecommendation}*`,
          ``
        );
      }
    }

    markdownLines.push(
      `---`,
      ``,
      `## 👥 Capacidades Atuais das 8 Super Personas Soberanas`,
      `| Super Persona | Serviço | Tecnologias Cobertas |`,
      `| :--- | :--- | :--- |`
    );

    for (const p of report.personaCapabilities) {
      markdownLines.push(`| **${p.displayName}** | \`${p.serviceFile}\` | ${p.handledTechnologies.map(t => `\`${t}\``).join(", ")} |`);
    }

    fs.writeFileSync(path.join(docsDir, "INTELLIGENCE_COVERAGE_REPORT.md"), markdownLines.join("\n"), "utf-8");
    logger.info(`📝 Relatório salvo com sucesso em 'docs/INTELLIGENCE_COVERAGE_REPORT.md'.`);
  }

  /**
   * Logs structured report to console (Option C)
   */
  private logConsoleReport(report: IntelligenceCoverageReport): void {
    logger.info(`══════════════════════════════════════════════════════════════`);
    logger.info(`🧠 [INTELLIGENCE CONTROL] Auditoria de Cobertura de Pontos Cegos`);
    logger.info(`══════════════════════════════════════════════════════════════`);
    logger.info(`📊 Cobertura Atual: ${report.coveragePercentage}% (${report.coveredTechnologiesCount}/${report.totalTechnologiesDetected} Tecnologias)`);
    logger.info(`👥 Super Personas Avaliadas: ${report.totalSuperPersonasEvaluated}`);

    if (report.blindspots.length > 0) {
      logger.warn(`🚨 ${report.blindspots.length} Pontos Cegos Encontrados:`);
      for (const b of report.blindspots) {
        logger.warn(`  ❌ [${b.techName}] -> Persona Recomendada: ${b.recommendedPersonaName}`);
        logger.warn(`     💡 Recomendação: ${b.actionableRecommendation}`);
      }
    } else {
      logger.info(`✅ Zero Pontos Cegos! Todas as tecnologias possuem cobertura de inteligência pelas Super Personas.`);
    }
    logger.info(`══════════════════════════════════════════════════════════════`);
  }

  private getAllFiles(dir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    // Ignorar pastas pesadas/de terceiros/caches para varreduras de I/O ultrarrápidas
    const IGNORED_DIRS = new Set(["node_modules", ".git", "target", "build", ".gemini", "dist", "tmp_predictor_test", ".opencode"]);

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIRS.has(entry.name)) continue;

      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.getAllFiles(full));
      } else {
        // Apenas varrer arquivos com extensoes de código-fonte/configuração relevantes
        if (/\.(ts|js|json|zig|nim|wasm|rs|go|py|md|template|toml|mod|c|h|cpp|hpp)$/i.test(entry.name) || ["Dockerfile", ".env.example", "LICENSE"].includes(entry.name)) {
          results.push(full);
        }
      }
    }
    return results;
  }
}
