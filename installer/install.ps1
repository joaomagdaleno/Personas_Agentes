# ==============================================================================
# Personas e Agentes (PSA) - Instalador Automatico para Windows (x64)
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "         PERSONAS & AGENTES (PSA) - INSTALADOR SOBERANO           " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$CurrentDir = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $CurrentDir "dist"
$InstallDir = Join-Path $env:LocalAppData "Programs\PersonasAgentes"
$BinDir = Join-Path $InstallDir "bin"
$WinUiExe = Join-Path $InstallDir "winui\PersonasAgentes.WinUI.exe"

# 1. Verificar pacote dist
if (-not (Test-Path $DistDir)) {
    Write-Host "[*] Gerando pacote de distribuicao via 'bun run bundle'..." -ForegroundColor Yellow
    Push-Location $CurrentDir
    bun run bundle
    Pop-Location
}

if (-not (Test-Path $DistDir)) {
    Write-Error "[-] Falha: Pasta dist nao encontrada. Execute 'bun run bundle' primeiro."
    exit 1
}

# 2. Criar diretorio de instalacao
Write-Host "[1/5] Criando diretorio de instalacao: $InstallDir" -ForegroundColor Green
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 3. Copiar arquivos
Write-Host "[2/5] Copiando arquivos do ecossistema PSA..." -ForegroundColor Green
Copy-Item -Path "$DistDir\*" -Destination $InstallDir -Recurse -Force

# 4. Configurar PATH
Write-Host "[3/5] Configurando variavel de ambiente PATH..." -ForegroundColor Green
$UserPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
if ($UserPath -notlike "*$BinDir*") {
    $NewPath = "$UserPath;$BinDir"
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, [EnvironmentVariableTarget]::User)
    $env:PATH += ";$BinDir"
    Write-Host "   [+] '$BinDir' adicionado ao PATH com sucesso!" -ForegroundColor DarkGreen
} else {
    Write-Host "   [*] '$BinDir' ja esta presente no PATH." -ForegroundColor Gray
}

# 5. Criar Atalhos
Write-Host "[4/5] Criando atalhos na Area de Trabalho e Menu Iniciar..." -ForegroundColor Green
$WScriptShell = New-Object -ComObject WScript.Shell

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$DesktopShortcut = $WScriptShell.CreateShortcut((Join-Path $DesktopPath "PSA Agent Workbench.lnk"))
$DesktopShortcut.TargetPath = $WinUiExe
$DesktopShortcut.WorkingDirectory = (Join-Path $InstallDir "winui")
$DesktopShortcut.Description = "Personas e Agentes (PSA) Workbench WinUI 3"
$DesktopShortcut.Save()
Write-Host "   [+] Atalho criado na Area de Trabalho." -ForegroundColor DarkGreen

$StartMenuPath = [Environment]::GetFolderPath("Programs")
$PsaStartDir = Join-Path $StartMenuPath "Personas Agentes"
if (-not (Test-Path $PsaStartDir)) {
    New-Item -ItemType Directory -Path $PsaStartDir -Force | Out-Null
}
$StartShortcut = $WScriptShell.CreateShortcut((Join-Path $PsaStartDir "PSA Agent Workbench.lnk"))
$StartShortcut.TargetPath = $WinUiExe
$StartShortcut.WorkingDirectory = (Join-Path $InstallDir "winui")
$StartShortcut.Description = "Personas e Agentes (PSA) Workbench WinUI 3"
$StartShortcut.Save()
Write-Host "   [+] Atalho criado no Menu Iniciar." -ForegroundColor DarkGreen

# 6. Teste de Validacao
Write-Host ""
Write-Host "[5/5] Testando execucao do binario soberano..." -ForegroundColor Green
$EngineExe = Join-Path $BinDir "personas-engine.exe"
if (Test-Path $EngineExe) {
    & $EngineExe status
} else {
    Write-Host "[-] Binario personas-engine.exe nao encontrado em $BinDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Instalacao concluida com sucesso!" -ForegroundColor Green
Write-Host "Comando CLI:      personas-engine status" -ForegroundColor White
Write-Host "Interface WinUI:  PSA Agent Workbench (Desktop / Menu Iniciar)" -ForegroundColor White
Write-Host "Instalado em:     $InstallDir" -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
