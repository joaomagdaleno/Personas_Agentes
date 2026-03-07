import * as path from "path";

async function run() {
    const targetDir = path.resolve(process.cwd(), "src_local");
    const rootDir = process.cwd();

    console.log(`📡 Scanning directory: ${targetDir} via Go Hub...`);

    try {
        const url = `http://localhost:8080/scan?dir=${encodeURIComponent(targetDir)}&root=${encodeURIComponent(rootDir)}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error("❌ Go Hub scan request failed:", res.statusText);
            process.exit(1);
        }

        const results: any[] = await res.json();
        const fragile: any[] = [];

        for (const fileData of results) {
            if (fileData.path.includes("/test/") || fileData.path.includes("\\test\\")) continue;

            // Proxy fragility based on Units/LOC since the Hub version only has basic LOC/Sloc now, but we can compute density
            const density = (fileData.units?.length || 0) / (fileData.loc || 1);
            if (density > 0.1 || fileData.loc > 500) {
                fragile.push({
                    file: fileData.path,
                    loc: fileData.loc,
                    units: fileData.units?.length || 0
                });
            }
        }

        console.log("--- POTENTIAL FRAGILITIES ---");
        fragile.sort((a, b) => b.loc - a.loc).forEach(f => {
            console.log(`${f.file} - LOC: ${f.loc} - Units: ${f.units}`);
        });
        console.log(`Total fragile files: ${fragile.length}`);

    } catch (err: any) {
        console.error("Target scanning failed:", err.message);
        console.error("Please ensure the Hub server is running at localhost:8080");
    }
}

run();
