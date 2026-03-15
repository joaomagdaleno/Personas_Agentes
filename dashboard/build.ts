console.log("🚀 Building Sovereign Dashboard for production (Bun-native)...");

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

// Copy index.html and CSS to dist
await Bun.write("./dist/index.html", Bun.file("index.html"));
await Bun.write("./dist/index.css", Bun.file("./src/index.css"));

console.log("✅ Build complete! Output in ./dist");
