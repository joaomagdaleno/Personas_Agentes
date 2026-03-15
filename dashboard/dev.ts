import { watch } from "fs";

const PORT = 5173;
const ENTRY_POINT = "./src/main.tsx";

async function build() {
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

console.log(`🚀 Sovereign Dashboard (Bun-native) → http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      return new Response(Bun.file("index.html"), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (path === "/bundle.js") {
      const output = await build();
      if (!output) return new Response("Build Error", { status: 500 });
      return new Response(output);
    }

    // Serve static files from src/ (CSS) and public/
    const candidates = [`.${path}`, `./src${path}`, `./public${path}`];
    for (const candidate of candidates) {
      const file = Bun.file(candidate);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // SPA fallback
    return new Response(Bun.file("index.html"), {
      headers: { "Content-Type": "text/html" },
    });
  },
});

// Watch for changes and log them (rebuild happens on next request)
watch("./src", { recursive: true }, (_event, filename) => {
  if (filename) console.log(`↺ Change: ${filename}`);
});
