console.log("🚀 Building Sovereign Dashboard for production...");

const result = await Bun.build({
  entrypoints: ["./src/main.tsx"],
  outdir: "./dist",
  minify: true,
  sourcemap: "none",
  splitting: true,
  target: "browser",
});

if (!result.success) {
  console.error("❌ Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

// Copy index.html to dist and update script tag
let html = await Bun.file("index.html").text();
html = html.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<script type="module" src="/bundle.js"></script>'
);
await Bun.write("./dist/index.html", html);

console.log("✅ Build complete! Output in ./dist");
