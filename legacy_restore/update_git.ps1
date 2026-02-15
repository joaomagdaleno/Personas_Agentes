# Script de Sincronização de Git para o Submódulo .agent
$submodulePath = Join-Path $PSScriptRoot "..\.agent"
$upstreamUrl = "https://github.com/google-gemini/skills.git" # Ajuste se o upstream for outro

if (-not (Test-Path $submodulePath)) {
    Write-Host "❌ Submódulo .agent não encontrado!" -ForegroundColor Red
    return
}

Push-Location $submodulePath

Write-Host "🔄 Iniciando Sincronização de Git no Submódulo..." -ForegroundColor Cyan

# 1. Garantir que o upstream existe
$remotes = git remote
if (-not ($remotes -contains "upstream")) {
    Write-Host "➕ Adicionando remote upstream..." -ForegroundColor Gray
    git remote add upstream $upstreamUrl
}

# 2. Buscar atualizações do upstream
Write-Host "📡 Buscando novidades do upstream..." -ForegroundColor Gray
git fetch upstream

# 3. Atualizar a branch 'main' do Fork
Write-Host "🌿 Sincronizando branch 'main'..." -ForegroundColor Gray
git checkout main
git merge upstream/main --no-edit
git push origin main

# 4. Atualizar a branch 'minhas-regras' com o que veio da main
Write-Host "🌿 Sincronizando branch 'minhas-regras'..." -ForegroundColor Gray
git checkout minhas-regras
git merge upstream/main --no-edit
git push origin minhas-regras

Write-Host "✅ Submódulo sincronizado com sucesso!" -ForegroundColor Green

Pop-Location
