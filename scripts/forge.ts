
import * as fs from "node:fs";
import * as path from "node:path";

interface AuditRule {
    regex: string;
    issue: string;
    severity: string;
}

interface StackConfig {
    extensions: string[];
    rules: AuditRule[];
}

interface Persona {
    id: string;
    name: string;
    emoji: string;
    role: string;
    phd_identity: string;
    description: string;
    system_prompt?: string;
    prompt_template?: string;
    healing_prompt?: string;
    categories: string[];
    stacks: Record<string, StackConfig>;
}

interface Census {
    personas: Persona[];
}

const ROOT = path.resolve(".");
const CENSUS_PATH = path.join(ROOT, "src_local/metadata/identity_census.json");
const TEMPLATE_DIR = path.join(ROOT, "src_local/metadata/templates");

async function forge() {
    console.log("🛠️ Starting Sovereign Forge...");

    if (!fs.existsSync(CENSUS_PATH)) {
        console.error("❌ Metadata census not found at:", CENSUS_PATH);
        process.exit(1);
    }

    const TARGET_STACKS = ["TypeScript", "Bun", "Go", "Python", "Kotlin", "Flutter", "Rust"];
    const STACK_EXTENSIONS: Record<string, string> = {
        "TypeScript": "ts",
        "Bun": "ts",
        "Go": "go",
        "Python": "py",
        "Kotlin": "kt",
        "Flutter": "dart",
        "Rust": "rs"
    };
    const census: Census = JSON.parse(fs.readFileSync(CENSUS_PATH, "utf-8"));
    const templates: Record<string, string> = {};

    // Load templates
    fs.readdirSync(TEMPLATE_DIR).forEach(file => {
        const ext = file.split(".")[0];
        templates[ext] = fs.readFileSync(path.join(TEMPLATE_DIR, file), "utf-8");
    });

    for (const persona of census.personas) {
        console.log(`⚡ Forging Persona: ${persona.name} (${persona.emoji})`);

        for (const [stackName, config] of Object.entries(persona.stacks)) {
            let templateKey = stackName.toLowerCase();
            if (templateKey === "typescript" || templateKey === "bun") templateKey = "ts";
            
            const template = templates[templateKey];
            if (!template) {
                console.warn(`⚠️ No template for stack: ${stackName} (key: ${templateKey}). Skipping.`);
                continue;
            }

            // Generate content
            let content = template
                .replace(/{{id}}/g, persona.id)
                .replace(/{{name}}/g, persona.name)
                .replace(/{{emoji}}/g, persona.emoji)
                .replace(/{{role}}/g, persona.role)
                .replace(/{{phd_identity}}/g, persona.phd_identity)
                .replace(/{{system_prompt}}/g, persona.system_prompt || "")
                .replace(/{{prompt_template}}/g, persona.prompt_template || "")
                .replace(/{{healing_prompt}}/g, persona.healing_prompt || "")
                .replace(/{{stack}}/g, stackName)
                .replace(/{{extensions}}/g, JSON.stringify(config.extensions))
                .replace(/{{rules}}/g, JSON.stringify(config.rules, null, 12));

            // Categorization
            for (const category of persona.categories) {
                const targetDir = path.join(ROOT, "src_local/agents", stackName, category);
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const ext = STACK_EXTENSIONS[stackName] || "ts";
                const fileName = `${persona.id}.${ext}`;
                const targetPath = path.join(targetDir, fileName);

                // Inject category into content
                const finalContent = content.replace(/{{category}}/g, category.toLowerCase());

                console.log(`   └─ [${stackName}/${category}] -> ${fileName}`);
                fs.writeFileSync(targetPath, finalContent);
            }
        }
    }

    console.log("🏁 Forge operation complete. 251 personas projected for next cycle.");
}

forge().catch(err => {
    console.error("🚨 Forge failed:", err);
    process.exit(1);
});
