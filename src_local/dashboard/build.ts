// build.ts
import { rm } from "fs/promises";
import { existsSync } from "fs";

const distDir = "./dist";

async function build() {
    if (existsSync(distDir)) {
        await rm(distDir, { recursive: true, force: true });
    }

    console.log("🏗️ Building Sentinel Dashboard...");

    const result = await Bun.build({
        entrypoints: ["./App.tsx"],
        outdir: distDir,
        minify: true,
        format: "esm",
    });

    if (!result.success) {
        console.error("❌ Build failed:");
        for (const message of result.logs) {
            console.error(message);
        }
        process.exit(1);
    }

    // Copy index.html to dist
    await Bun.write(`${distDir}/index.html`, Bun.file("./index.html"));

    console.log(`✅ Build complete! ${result.outputs.length} assets generated in ${distDir}`);
}

build();
