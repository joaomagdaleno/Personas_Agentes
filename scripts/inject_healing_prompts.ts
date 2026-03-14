/**
 * Phase 30: Inject healing_prompt into all personas that are missing it.
 * Run with: bun run scripts/inject_healing_prompts.ts
 */
import * as fs from "node:fs";
import * as path from "node:path";

const CENSUS_PATH = path.resolve("src_local/metadata/identity_census.json");

const HEALING_PROMPTS: Record<string, string> = {
    bridge: "Fix the following API contract or protocol translation issue. Ensure correct HTTP/gRPC mapping, proper request/response schemas, and consistent error propagation. Return ONLY the corrected code or a specific diff.",
    cache: "Fix the following caching or memory hierarchy issue. Ensure correct TTL handling, cache invalidation logic, and eliminate memory leaks. Return ONLY the corrected code or a specific diff.",
    cloud: "Fix the following cloud-native or serverless issue. Ensure correct IAM policies, fix cold start bottlenecks, and resolve cloud resource misconfiguration. Return ONLY the corrected code or a specific diff.",
    decorator: "Fix the following design pattern or SOLID principle violation. Extract reusable abstractions and apply correct structural/behavioral patterns. Return ONLY the corrected code or a specific diff.",
    director: "Fix the following architectural drift or governance violation. Enforce layered boundaries and ensure proper separation of concerns. Return ONLY the corrected code or a specific diff.",
    echo: "Fix the following logging or observability issue. Ensure structured logging, proper trace context propagation, and consistent log levels. Return ONLY the corrected code or a specific diff.",
    enum: "Fix the following state machine or enum exhaustiveness issue. Add missing switch/match cases and ensure all enum variants are handled. Return ONLY the corrected code or a specific diff.",
    flow: "Fix the following async/reactive or stream processing issue. Resolve backpressure problems, unhandled promise rejections, and race conditions. Return ONLY the corrected code or a specific diff.",
    forge: "Fix the following code generation or meta-programming issue. Ensure template correctness and generated code consistency. Return ONLY the corrected code or a specific diff.",
    fragment: "Fix the following component isolation or micro-frontend issue. Remove cross-boundary imports and enforce strict module isolation. Return ONLY the corrected code or a specific diff.",
    generic: "Fix the following generic programming or type abstraction issue. Improve generic constraints and resolve type erasure problems. Return ONLY the corrected code or a specific diff.",
    globe: "Fix the following i18n or localization issue. Replace hardcoded strings with locale keys and ensure locale-aware formatting. Return ONLY the corrected code or a specific diff.",
    hermes: "Fix the following messaging or event-driven architecture issue. Ensure correct message schemas, dead-letter handling, and idempotency. Return ONLY the corrected code or a specific diff.",
    hype: "Fix the following developer experience issue. Simplify confusing APIs, improve error messages, and streamline interfaces. Return ONLY the corrected code or a specific diff.",
    mantra: "Fix the following code style or consistency violation. Enforce naming conventions, formatting rules, and coding standards. Return ONLY the corrected code or a specific diff.",
    master: "Fix the following system design or orchestration gap. Ensure saga/workflow integrity and proper coordination between services. Return ONLY the corrected code or a specific diff.",
    metric: "Fix the following metrics or KPI engineering issue. Correct metric calculations and ensure dimensional accuracy. Return ONLY the corrected code or a specific diff.",
    nebula: "Fix the following data pipeline or ETL issue. Correct data transformation errors and ensure proper schema evolution. Return ONLY the corrected code or a specific diff.",
    neural: "Fix the following ML/AI integration issue. Correct model loading, preprocessing pipelines, and inference errors. Return ONLY the corrected code or a specific diff.",
    nexus: "Fix the following dependency management or coupling issue. Break circular dependencies and reduce coupling metrics. Return ONLY the corrected code or a specific diff.",
    palette: "Fix the following UI/UX or design system issue. Resolve accessibility violations and ensure design token consistency. Return ONLY the corrected code or a specific diff.",
    probe: "Fix the following runtime diagnostics or health check issue. Ensure proper health endpoints, timeout handling, and liveness probes. Return ONLY the corrected code or a specific diff.",
    scale: "Fix the following horizontal scaling or load distribution issue. Correct sharding logic and connection pool sizing. Return ONLY the corrected code or a specific diff.",
    scope: "Fix the following scope analysis or variable lifecycle issue. Resolve variable shadowing, unused declarations, and scope leaks. Return ONLY the corrected code or a specific diff.",
    scribe: "Fix the following documentation or API specification issue. Complete JSDoc annotations and ensure OpenAPI spec accuracy. Return ONLY the corrected code or a specific diff.",
    sentinel: "Fix the following security vulnerability or threat. Remediate injection risks, enforce CSP/CORS policies, and sanitize all inputs. Return ONLY the corrected code or a specific diff.",
    spark: "Fix the following build system or compilation issue. Correct build configurations, tree-shaking settings, and bundler errors. Return ONLY the corrected code or a specific diff.",
    stream: "Fix the following real-time data or WebSocket issue. Correct connection handling, reconnection logic, and heartbeat mechanisms. Return ONLY the corrected code or a specific diff.",
    testify: "Fix the following testing or quality assurance issue. Eliminate flaky tests, improve assertion specificity, and increase coverage. Return ONLY the corrected code or a specific diff.",
    vault: "Fix the following secrets management or encryption issue. Remove plaintext secrets, enforce key rotation, and improve hashing algorithms. Return ONLY the corrected code or a specific diff.",
    vortex: "Fix the following code complexity issue. Reduce cyclomatic complexity, extract methods, and simplify convoluted logic. Return ONLY the corrected code or a specific diff.",
    voyager: "Fix the following migration or version upgrade issue. Replace deprecated API usage and ensure backward compatibility. Return ONLY the corrected code or a specific diff.",
    warden: "Fix the following access control or authorization issue. Correct RBAC violations and enforce the principle of least privilege. Return ONLY the corrected code or a specific diff.",
    web: "Fix the following web performance or DOM integrity issue. Eliminate layout shifts, optimize the critical rendering path, and fix reflow triggers. Return ONLY the corrected code or a specific diff.",
};

const census = JSON.parse(fs.readFileSync(CENSUS_PATH, "utf-8"));
let updated = 0;
let skipped = 0;

for (const persona of census.personas) {
    if (persona.healing_prompt) {
        skipped++;
        continue;
    }
    const prompt = HEALING_PROMPTS[persona.id];
    if (prompt) {
        persona.healing_prompt = prompt;
        updated++;
        console.log(`✅ ${persona.id}: healing_prompt injected`);
    } else {
        console.warn(`⚠️ ${persona.id}: no healing_prompt defined in script`);
    }
}

fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 6), "utf-8");
console.log(`\n🏁 Done. Updated: ${updated}, Skipped (already had): ${skipped}, Total: ${census.personas.length}`);
