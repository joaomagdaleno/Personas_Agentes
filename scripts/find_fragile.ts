import * as cp from "child_process";
import * as path from "path";
import * as fs from "fs";

async function run() {
    const targetDir = path.resolve(process.cwd(), "src_local");
    const goScanner = path.resolve(process.cwd(), "src_native/go-scanner.exe");

    if (!fs.existsSync(goScanner)) {
        console.error("❌ go-scanner.exe not found. Build it first.");
        process.exit(1);
    }

    console.log(`📡 Scanning directory: ${targetDir} via go-scanner...`);

    try {
        const output = cp.execSync(`"${goScanner}" -dir "${targetDir}" -root "${process.cwd()}"`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 });
        const results: any[] = JSON.parse(output);
        const fragile: any[] = [];

        for (const fileData of results) {
            if (fileData.path.includes("/test/") || fileData.path.includes("\\test\\")) continue;

            // Proxy fragility based on Total Complexity from Go Scanner
            if (fileData.total_complexity > 20) {
                fragile.push({
                    file: fileData.path,
                    cc: fileData.total_complexity,
                    units: fileData.units?.length || 0
                });
            }
        }

        console.log("--- POTENTIAL FRAGILITIES ---");
        fragile.sort((a, b) => b.cc - a.cc).forEach(f => {
            console.log(`${f.file} - CC: ${f.cc} - Units: ${f.units}`);
        });
        console.log(`Total fragile files: ${fragile.length}`);

    } catch (err: any) {
        console.error("Target scanning failed:", err.message);
    }
}

run();
