
// Experiment: Bun.markdown & Bun.wrapAnsi

async function testMarkdown() {
    console.log("🧪 Testing Bun.markdown...");
    if (Bun.markdown) {
        const md = "# Hello Bun\n* Item 1\n* Item 2";
        // Assuming compile or render exists, the blog said Bun.markdown.render or similar.
        // Let's print what we have since types might not be updated yet.
        console.log("Bun.markdown API:", Bun.markdown);

        // Hypothetical usage based on blog
        /*
        const html = await Bun.markdown.toHTML(md);
        console.log("HTML:", html);
        */
    } else {
        console.log("❌ Bun.markdown not found (requires Bun v1.3.8+)");
    }
}

async function testWrapAnsi() {
    console.log("\n🧪 Testing Bun.wrapAnsi...");
    // @ts-ignore
    if (Bun.wrapAnsi) {
        const longText = "\u001b[31mHello World\u001b[0m this is a very long text that should be wrapped correclty while preserving ansi codes.";
        // @ts-ignore
        const wrapped = Bun.wrapAnsi(longText, 20);
        console.log("Wrapped:\n" + wrapped);
    } else {
        console.log("❌ Bun.wrapAnsi not found (requires Bun v1.3.7+)");
    }
}

async function run() {
    console.log(`Current Version: ${Bun.version}`);
    await testMarkdown();
    await testWrapAnsi();
}

run();
