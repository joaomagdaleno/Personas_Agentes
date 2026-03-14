import { watch } from "fs";

const PORT = 5173;
const ENTRY_POINT = "./src/main.tsx";

async function build() {
  console.log("📦 Bundling with Bun...");
  const result = await Bun.build({
    entrypoints: [ENTRY_POINT],
    outdir: "./dist",
    minify: false,
    sourcemap: "inline",
    splitting: false,
    target: "browser",
  });

  if (!result.success) {
    console.error("❌ Build failed");
    for (const message of result.logs) {
      console.error(message);
    }
    return null;
  }
  return result.outputs[0];
}

console.log(`🚀 Sovereign Dashboard running at http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      let html = await Bun.file("index.html").text();
      // Inject the bundle reference and remove the Vite-style module import
      html = html.replace(
        '<script type="module" src="/src/main.tsx"></script>',
        '<script type="module" src="/bundle.js"></script>'
      );
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (path === "/bundle.js") {
      const output = await build();
      if (!output) return new Response("Build Error", { status: 500 });
      return new Response(output);
    }

    // Serve static files (CSS, Assets)
    const file = Bun.file(`.${path}`);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback to index.html for SPA routing if needed
    return new Response("Not Found", { status: 404 });
  },
});

// Watch for changes to trigger rebuild on next request (managed by build() call in fetch)
watch("./src", { recursive: true }, (event, filename) => {
  if (filename) {
    console.log(`\u21ba Change detected in ${filename}`);
  }
});
