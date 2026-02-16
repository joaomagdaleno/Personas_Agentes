
import { unlink } from "node:fs/promises";
import { join } from "path";

const files = [
    "src_local/agents/base.py",
    "src_local/agents/Flutter/Audit/bolt.py",
    "src_local/agents/Flutter/Audit/metric.py",
    "src_local/agents/Flutter/Audit/nebula.py",
    "src_local/agents/Flutter/Audit/probe.py",
    "src_local/agents/Flutter/Audit/scale.py",
    "src_local/agents/Flutter/Audit/scope.py",
    "src_local/agents/Flutter/Audit/testify.py",
    "src_local/agents/Flutter/Content/echo.py",
    "src_local/agents/Flutter/Content/forge.py",
    "src_local/agents/Flutter/Content/globe.py",
    "src_local/agents/Flutter/Content/hype.py",
    "src_local/agents/Flutter/Content/mantra.py",
    "src_local/agents/Flutter/Content/palette.py",
    "src_local/agents/Flutter/Content/scribe.py",
    "src_local/agents/Flutter/Strategic/sentinel.py",
    "src_local/agents/Flutter/Strategic/vault.py",
    "src_local/agents/Flutter/Strategic/voyager.py",
    "src_local/agents/Flutter/Strategic/warden.py",
    "src_local/agents/Flutter/System/bridge.py",
    "src_local/agents/Flutter/System/cache.py",
    "src_local/agents/Flutter/System/flow.py",
    "src_local/agents/Flutter/System/hermes.py",
    "src_local/agents/Flutter/System/neural.py",
    "src_local/agents/Flutter/System/nexus.py",
    "src_local/agents/Flutter/System/spark.py",
    "src_local/agents/Flutter/System/stream.py",
    "src_local/agents/Kotlin/Audit/bolt.py",
    "src_local/agents/Kotlin/Audit/metric.py",
    "src_local/agents/Kotlin/Audit/nebula.py",
    "src_local/agents/Kotlin/Audit/probe.py",
    "src_local/agents/Kotlin/Audit/scale.py",
    "src_local/agents/Kotlin/Audit/scope.py",
    "src_local/agents/Kotlin/Audit/testify.py",
    "src_local/agents/Kotlin/Content/echo.py",
    "src_local/agents/Kotlin/Content/forge.py",
    "src_local/agents/Kotlin/Content/globe.py",
    "src_local/agents/Kotlin/Content/hype.py",
    "src_local/agents/Kotlin/Content/mantra.py",
    "src_local/agents/Kotlin/Content/palette.py",
    "src_local/agents/Kotlin/Content/scribe.py",
    "src_local/agents/Kotlin/Strategic/sentinel.py",
    "src_local/agents/Kotlin/Strategic/vault.py",
    "src_local/agents/Kotlin/Strategic/voyager.py",
    "src_local/agents/Kotlin/Strategic/warden.py",
    "src_local/agents/Kotlin/System/bridge.py",
    "src_local/agents/Kotlin/System/cache.py",
    "src_local/agents/Kotlin/System/flow.py",
    "src_local/agents/Kotlin/System/hermes.py",
    "src_local/agents/Kotlin/System/neural.py",
    "src_local/agents/Kotlin/System/nexus.py",
    "src_local/agents/Kotlin/System/spark.py",
    "src_local/agents/Kotlin/System/stream.py",
    "src_local/agents/Python/Audit/bolt.py",
    "src_local/agents/Python/Audit/metric.py",
    "src_local/agents/Python/Audit/nebula.py",
    "src_local/agents/Python/Audit/probe.py",
    "src_local/agents/Python/Audit/scale.py",
    "src_local/agents/Python/Audit/scope.py",
    "src_local/agents/Python/Audit/testify.py",
    "src_local/agents/Python/Content/echo.py",
    "src_local/agents/Python/Content/forge.py",
    "src_local/agents/Python/Content/globe.py",
    "src_local/agents/Python/Content/palette.py",
    "src_local/agents/Python/Content/scribe.py",
    "src_local/agents/Python/Strategic/sentinel.py",
    "src_local/agents/Python/Strategic/vault.py",
    "src_local/agents/Python/Strategic/voyager.py",
    "src_local/agents/Python/System/cache.py",
    "src_local/agents/Python/System/flow.py",
    "src_local/agents/Python/System/neural.py",
    "src_local/agents/Python/System/nexus.py",
    "src_local/agents/Python/System/spark.py",
    "src_local/agents/Python/System/stream.py"
];

async function run() {
    let deleted = 0;
    for (const file of files) {
        try {
            await unlink(file);
            console.log(`✅ Deleted: ${file}`);
            deleted++;
        } catch (e: any) {
            console.error(`❌ Failed to delete ${file}: ${e.message}`);
        }
    }
    console.log(`\n🎉 Total deleted: ${deleted}/${files.length}`);
}

run();
