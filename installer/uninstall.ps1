# ==============================================================================
# Personas e Agentes (PSA) - Desinstalador Automatico para Windows (x64)
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "         PERSONAS & AGENTES (PSA) - DESINSTALADOR                 " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host ""

$InstallDir = Join-Path $env:LocalAppData "Programs\PersonasAgentes"
$BinDir = Join-Path $InstallDir "bin"

# 1. Remover Atalhos
Write-Host "[1/3] Removendo atalhos do Desktop e Menu Iniciar..." -ForegroundColor Yellow
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$DesktopShortcut = Join-Path $DesktopPath "PSA Agent Workbench.lnk"
if (Test-Path $DesktopShortcut) {
    Remove-Item -Path $DesktopShortcut -Force
    Write-Host "   [+] Atalho da Area de Trabalho removido." -ForegroundColor DarkGreen
}

$StartMenuPath = [Environment]::GetFolderPath("Programs")
$PsaStartDir = Join-Path $StartMenuPath "Personas Agentes"
if (Test-Path $PsaStartDir) {
    Remove-Item -Path $PsaStartDir -Recurse -Force
    Write-Host "   [+] Atalho do Menu Iniciar removido." -ForegroundColor DarkGreen
}

# 2. Remover do PATH
Write-Host "[2/3] Removendo da variavel PATH..." -ForegroundColor Yellow
$UserPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
if ($UserPath -like "*$BinDir*") {
    $NewPath = ($UserPath.Split(';') | Where-Object { $_ -and $_ -ne $BinDir }) -join ';'
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, [EnvironmentVariableTarget]::User)
    Write-Host "   [+] '$BinDir' removido do PATH." -ForegroundColor DarkGreen
}

# 3. Remover Pasta de Instalacao
Write-Host "[3/3] Removendo arquivos de instalacao..." -ForegroundColor Yellow
if (Test-Path $InstallDir) {
    Remove-Item -Path $InstallDir -Recurse -Force
    Write-Host "   [+] Pasta de instalacao removida." -ForegroundColor DarkGreen
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "[SUCCESS] Personas & Agentes desinstalado com sucesso." -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
