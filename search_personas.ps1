param(
    [string]$query = ""
)

$scriptPath = Join-Path $PSScriptRoot "index_personas.py"

if ($query) {
    python $scriptPath "$query"
} else {
    python $scriptPath --help
}
