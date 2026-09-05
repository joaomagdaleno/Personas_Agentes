import { PsaServer } from "../src_local/server/psa_server.ts";
import { spawn } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

console.log("🏛️ Iniciando Servidor Personas & Agentes (PSA) & Interface WinUI 3 Nativa...");

// 1. Iniciar servidor PSA local na porta 3080
const server = new PsaServer({ port: 3080 });
server.start();

// 2. Localizar executável WinUI 3 nativo
const isWin = process.platform === "win32";
const candidatePaths = [
    path.join(process.cwd(), "src_native/winui/bin/x64/Release/net8.0-windows10.0.19041.0/PersonasAgentes.WinUI.exe"),
    path.join(process.cwd(), "src_native/winui/bin/Release/net8.0-windows10.0.19041.0/PersonasAgentes.WinUI.exe"),
    path.join(process.cwd(), "src_native/winui/bin/x64/Release/net8.0-windows10.0.19041.0/win-x64/PersonasAgentes.WinUI.exe"),
    path.join(process.cwd(), "src_native/winui/bin/Release/net8.0-windows10.0.19041.0/win-x64/PersonasAgentes.WinUI.exe"),
    path.join(process.cwd(), "src_native/winui/bin/Debug/net8.0-windows10.0.19041.0/PersonasAgentes.WinUI.exe")
];

const winuiBin = candidatePaths.find(p => fs.existsSync(p));

if (isWin && winuiBin) {
    console.log(`🚀 Abrindo aplicação desktop WinUI 3 (PSA Agent Workbench): ${winuiBin}`);
    spawn(winuiBin, [], { detached: true, stdio: "ignore" }).unref();
    console.log("✨ Aplicação desktop WinUI 3 iniciada com sucesso!");
} else {
    console.log("ℹ️ Servidor PSA ativo na porta 3080.");
    console.log("🌐 Conecte sua interface WinUI 3 ou acesse os endpoints em: http://127.0.0.1:3080");
}
