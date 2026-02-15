param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("Genesis", "Infra", "Forge", "Orbit", "Full")]
    [string]$Phase,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("Flutter", "Kotlin")]
    [string]$Platform
)

$baseDir = Join-Path $PSScriptRoot "$Platform"
$director = Get-Content (Join-Path $PSScriptRoot "Director - Project Orchestrator.txt") -Raw

$personas = @()

switch ($Phase) {
    "Genesis" { $personas = "Scope", "Scale", "Scribe" }
    "Infra"   { $personas = "Nebula", "Sentinel", "Bridge" }
    "Forge"   { $personas = "Flow", "Palette", "Nexus", "Bolt", "Stream", "Cache" }
    "Orbit"   { $personas = "Testify", "Warden", "Hype", "Metric", "Echo", "Vault" }
    "Full"    { 
        Get-Content "Personas_Agentes\todos_agentes_$($Platform.ToLower()).txt" -Raw | Set-Clipboard
        Write-Host "✅ [FULL CONTEXT] copiado para o seu CTRL+V!" -ForegroundColor Green
        return
    }
}

$output = "=== MASTER ORCHESTRATOR ===`n$director`n`n"

foreach ($p in $personas) {
    $file = Get-ChildItem $baseDir -Filter "*$p*" | Select-Object -First 1
    if ($file) {
        $content = Get-Content $file.FullName -Raw
        $output += "=== START OF PERSONA: $($file.Name) ===`n$content`n`n"
    }
}

$output | Set-Clipboard
Write-Host "✅ [PHASE: $Phase] para $Platform copiado para o seu CTRL+V!" -ForegroundColor Green
Write-Host "Personas ativas: $($personas -join ', ')" -ForegroundColor Cyan
