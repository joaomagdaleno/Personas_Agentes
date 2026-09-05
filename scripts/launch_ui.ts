import { DSHServer } from "../src_local/server/dsh_server.ts";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

console.log("🏛️ Iniciando Servidor DeepSeek Harness & Interface WinUI 3...");

// 1. Iniciar servidor DSH local na porta 3080
const server = new DSHServer({ port: 3080 });
server.start();

// 2. Verificar executável WinUI 3
const isWin = process.platform === "win32";
const winuiBin = path.join(process.cwd(), "src_native/winui/bin/x64/Release/net8.0-windows10.0.19041.0/win-x64/PersonasAgentes.WinUI.exe");

if (isWin && fs.existsSync(winuiBin)) {
    console.log(`🚀 Abrindo aplicação desktop WinUI 3: ${winuiBin}`);
    spawn(winuiBin, [], { detached: true, stdio: "ignore" }).unref();
} else {
    console.log("ℹ️ Servidor DeepSeek Harness pronto!");
    console.log("🌐 Conecte sua interface WinUI 3 ou navegue para: http://127.0.0.1:3080");
}
