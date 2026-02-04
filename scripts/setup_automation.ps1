$taskName = "Personas_Agentes_AutoSync"
$scriptPath = "c:\Users\joaom\Documents\GitHub\Personas_Agentes\scripts\autonomous_sync.py"
$pythonPath = "python" # Assume python está no PATH

# Verifica se a tarefa já existe e remove
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Define a ação: Executar o script python em background
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument $scriptPath

# Define o gatilho: A cada 1 hora (ou ajuste conforme necessário)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)

# Define as configurações: Rodar apenas se houver internet
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Registra a tarefa
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Sincronização Autônoma do Submódulo .agent/skills"

Write-Host "✅ Tarefa agendada com sucesso: $taskName"
Write-Host "🕒 Frequência: A cada 1 hora, se houver internet."
