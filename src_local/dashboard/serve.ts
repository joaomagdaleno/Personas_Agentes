// serve.ts
console.log("Starting Sentinel Dashboard Dev Server...");

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Serve HTML
        if (url.pathname === "/") {
            return new Response(Bun.file("./index.html"), {
                headers: { "Content-Type": "text/html" },
            });
        }

        // Transpile and Serve React App on the fly
        if (url.pathname === "/App.js") {
            const build = await Bun.build({
                entrypoints: ["./App.tsx"],
                format: "esm",
            });

            if (!build.success) {
                return new Response(build.logs.join("\n"), { status: 500 });
            }

            return new Response(build.outputs[0], {
                headers: { "Content-Type": "application/javascript" },
            });
        }

        return new Response("Not found", { status: 404 });
    },
});

console.log(`✅ Development server running at http://localhost:${server.port}`);
