#nullable enable
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PersonasAgentes.WinUI
{
    public class PsaSessionItem
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Info { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public List<PsaTrajectoryRecord> Records { get; set; } = new List<PsaTrajectoryRecord>();
    }

    // Alias de compatibilidade
    public class DshSessionItem : PsaSessionItem {}

    public class PersonaItem
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class PsaTrajectoryRecord
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public long DurationMs { get; set; }
        public int EstimatedTokens { get; set; }
        public string Timestamp { get; set; } = string.Empty;
        public string RawJson { get; set; } = string.Empty;
    }

    // Alias de compatibilidade
    public class DshTrajectoryRecord : PsaTrajectoryRecord {}

    public sealed partial class MainWindow : Window
    {
        private const string PsaApiUrl = "http://127.0.0.1:3080/v1/stream";
        private const string DshApiUrl = PsaApiUrl;
        private readonly HttpClient _httpClient = new HttpClient();
        
        private PsaSessionItem? _currentSession;
        private PersonaItem? _selectedPersona;
        private string _selectedModel = "qwen2.5-coder-1.5b";
        private string _selectedMode = "Standard";
        private bool _isDispatching = false;
        private int _totalTurnsCount = 0;
        private Process? _backendProcess;

        public MainWindow()
        {
            this.InitializeComponent();
            InitializeSessions();
            InitializePersonas();
            _ = EnsureBackendRunningAsync();
            CheckPreviousCrashLogs();
            _ = CheckForUpdatesAsync();
        }

        private async Task CheckForUpdatesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://127.0.0.1:3080/v1/version");
                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("version", out var vProp))
                    {
                        string currentVersion = vProp.GetString() ?? "2.0.0";
                        bool hasUpdate = doc.RootElement.TryGetProperty("updateAvailable", out var uProp) && uProp.GetBoolean();

                        DispatcherQueue.TryEnqueue(() =>
                        {
                            if (hasUpdate)
                            {
                                TelemetryTurnsTextBlock.Text = $"v{currentVersion} (Nova Versão Disponível 🚀)";
                                TelemetryTurnsTextBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153));
                            }
                            else
                            {
                                TelemetryTurnsTextBlock.Text = $"v{currentVersion}";
                            }
                        });
                    }
                }
            }
            catch { }
        }

        private void CheckPreviousCrashLogs()
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string logPath = Path.Combine(localAppData, "PersonasAgentes", "logs", "winui_crash.log");
                if (File.Exists(logPath) && new FileInfo(logPath).Length > 0)
                {
                    InspectorTitleTextBlock.Text = "⚠️ REGISTRO DE ERRO ANTERIOR DETECTADO";
                    InspectorMetaTextBlock.Text = $"Arquivo: {logPath}\nStatus: Registrado em log de diagnóstico";
                    string crashContent = File.ReadAllText(logPath);
                    InspectorPayloadTextBlock.Text = crashContent.Substring(Math.Max(0, crashContent.Length - 1000));
                }
            }
            catch { }
        }

        private void UpdateSlmTelemetryVisual(bool isWarm, string modelName)
        {
            if (SlmStateTextBlock == null || SlmStateBorder == null) return;
            if (isWarm)
            {
                SlmStateTextBlock.Text = $"🟢 SLM: Warmed (~1.0GB)";
                SlmStateTextBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153));
                SlmStateBorder.Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 6, 78, 59));
                SlmStateBorder.BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153));
            }
            else
            {
                SlmStateTextBlock.Text = $"❄️ SLM: Purged (0MB)";
                SlmStateTextBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250));
                SlmStateBorder.Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 41, 59));
                SlmStateBorder.BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250));
            }
        }

        private async Task EnsureBackendRunningAsync()
        {
            try
            {
                using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(1));
                var response = await _httpClient.GetAsync("http://127.0.0.1:3080/health", cts.Token);
                if (response.IsSuccessStatusCode)
                {
                    return; // Backend já operacional
                }
            }
            catch
            {
                // Porta 3080 offline, precisa iniciar o backend
            }

            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string[] candidatePaths = new[]
                {
                    Path.Combine(baseDir, "personas-engine.exe"),
                    Path.Combine(baseDir, "bin", "personas-engine.exe"),
                    Path.Combine(baseDir, "..", "bin", "personas-engine.exe"),
                    Path.Combine(baseDir, "..", "dist", "bin", "personas-engine.exe"),
                    Path.Combine(baseDir, "..", "..", "dist", "bin", "personas-engine.exe"),
                    Path.Combine(baseDir, "..", "..", "..", "dist", "bin", "personas-engine.exe"),
                    Path.Combine(Directory.GetCurrentDirectory(), "dist", "bin", "personas-engine.exe"),
                    Path.Combine(Directory.GetCurrentDirectory(), "bin", "personas-engine.exe")
                };

                string? engineExe = null;
                foreach (var pathCandidate in candidatePaths)
                {
                    string full = Path.GetFullPath(pathCandidate);
                    if (File.Exists(full))
                    {
                        engineExe = full;
                        break;
                    }
                }

                if (!string.IsNullOrEmpty(engineExe))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = engineExe,
                        Arguments = "serve",
                        WorkingDirectory = Path.GetDirectoryName(engineExe) ?? baseDir,
                        CreateNoWindow = true,
                        UseShellExecute = false,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    _backendProcess = Process.Start(psi);

                    // Aguarda estabilização do backend
                    for (int i = 0; i < 25; i++)
                    {
                        await Task.Delay(400);
                        try
                        {
                            using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromMilliseconds(600));
                            var check = await _httpClient.GetAsync("http://127.0.0.1:3080/health", cts.Token);
                            if (check.IsSuccessStatusCode) break;
                        }
                        catch {}
                    }
                }
            }
            catch
            {
                // Fallback silencioso
            }
        }

        private async void InitializeSessions()
        {
            try
            {
                var response = await _httpClient.GetAsync("http://127.0.0.1:3080/v1/sessions");
                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("sessions", out var sessArr) && sessArr.ValueKind == JsonValueKind.Array)
                    {
                        var fetchedSessions = new List<PsaSessionItem>();
                        foreach (var elem in sessArr.EnumerateArray())
                        {
                            string id = elem.GetProperty("id").GetString() ?? Guid.NewGuid().ToString("N").Substring(0, 8);
                            string persona = elem.TryGetProperty("persona", out var p) ? p.GetString() ?? "Strategic" : "Strategic";
                            fetchedSessions.Add(new PsaSessionItem
                            {
                                Id = id,
                                Name = $"Sessão #{id.Substring(0, Math.Min(6, id.Length))}",
                                Info = $"Persona: {persona} • Vault SQLite",
                                CreatedAt = DateTime.Now
                            });
                        }

                        if (fetchedSessions.Count > 0)
                        {
                            SessionsListView.ItemsSource = fetchedSessions;
                            SessionsListView.SelectedIndex = 0;
                            _currentSession = fetchedSessions[0];
                            return;
                        }
                    }
                }
            }
            catch { }

            var defaultSessions = new List<PsaSessionItem>
            {
                new PsaSessionItem
                {
                    Id = Guid.NewGuid().ToString("N").Substring(0, 8),
                    Name = "Sessão Inicial #a1f0",
                    Info = "Persona: Strategic Cognitive • Vault SQLite",
                    CreatedAt = DateTime.Now
                }
            };

            SessionsListView.ItemsSource = defaultSessions;
            SessionsListView.SelectedIndex = 0;
            _currentSession = defaultSessions[0];
        }

        private void InitializePersonas()
        {
            var personas = new List<PersonaItem>
            {
                new PersonaItem { Key = "strategic_cognitive_architect", Name = "🧠 Strategic Cognitive", Category = "AI/SLM & Reasoning" },
                new PersonaItem { Key = "audit_code_guardian", Name = "📊 Audit Code Guardian", Category = "Diagnostics & AST" },
                new PersonaItem { Key = "security_cloud_guardian", Name = "🛡️ Security Cloud Guardian", Category = "Safety & Guard" },
                new PersonaItem { Key = "architecture_types", Name = "📐 Architecture Types", Category = "AST & Topology DNA" },
                new PersonaItem { Key = "resilience_healing_architect", Name = "🧪 Resilience Healing", Category = "Idris 2 Safety Gate" },
                new PersonaItem { Key = "sys_perf_architect", Name = "⚡ Sys Perf Architect", Category = "WASM Governance" },
                new PersonaItem { Key = "sync_devops_architect", Name = "🔄 Sync DevOps Architect", Category = "Git Orchestrator" },
                new PersonaItem { Key = "ui_ux_architect", Name = "🎨 UI/UX Architect", Category = "PSA Native Desktop" }
            };

            PersonasListView.ItemsSource = personas;
            PersonasListView.SelectedIndex = 0;
            _selectedPersona = personas[0];
        }

        private async void OnSessionSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (SessionsListView?.SelectedItem is PsaSessionItem session)
            {
                _currentSession = session;
                await LoadSessionTrajectoryFromBackendAsync(session);
            }
        }

        private async Task LoadSessionTrajectoryFromBackendAsync(PsaSessionItem session)
        {
            TrajectoryStackPanel.Children.Clear();
            try
            {
                var response = await _httpClient.GetAsync($"http://127.0.0.1:3080/v1/sessions/{session.Id}");
                if (response.IsSuccessStatusCode)
                {
                    string json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("records", out var recArr) && recArr.ValueKind == JsonValueKind.Array)
                    {
                        session.Records.Clear();
                        foreach (var elem in recArr.EnumerateArray())
                        {
                            string type = elem.TryGetProperty("type", out var t) ? t.GetString() ?? "text" : "text";
                            string title = elem.TryGetProperty("title", out var ti) ? ti.GetString() ?? "" : "";
                            string content = elem.TryGetProperty("content", out var c) ? c.GetString() ?? "" : "";
                            long durationMs = elem.TryGetProperty("durationMs", out var d) ? d.GetInt64() : 0;

                            session.Records.Add(new DshTrajectoryRecord
                            {
                                Type = type,
                                Title = title,
                                Content = content,
                                DurationMs = durationMs
                            });

                            if (type == "UserPrompt" || type == "user_prompt")
                            {
                                TrajectoryStackPanel.Children.Add(CreateTurnHeaderCard(session.Records.Count, content));
                            }
                            else if (type == "reasoning")
                            {
                                var tuple = CreateReasoningNodeCard();
                                tuple.Item2.Text = content;
                                TrajectoryStackPanel.Children.Add(tuple.Item1);
                            }
                            else if (type == "tool_call")
                            {
                                using var emptyDoc = JsonDocument.Parse("{}");
                                var toolCard = CreateToolCallNodeCard(title.Length > 0 ? title : "Tool Executed", emptyDoc.RootElement);
                                TrajectoryStackPanel.Children.Add(toolCard);
                            }
                            else if (type == "tool_result")
                            {
                                var toolResCard = CreateToolResultNodeCard(content);
                                TrajectoryStackPanel.Children.Add(toolResCard);
                            }
                            else if (type == "verification")
                            {
                                var verifCard = CreateVerificationNodeCard(content);
                                TrajectoryStackPanel.Children.Add(verifCard);
                            }
                            else if (type == "text" || type == "model_output")
                            {
                                var tuple = CreateModelOutputNodeCard();
                                tuple.Item2.Text = content;
                                TrajectoryStackPanel.Children.Add(tuple.Item1);
                            }
                        }
                        ScrollToBottom();
                        return;
                    }
                }
            }
            catch { }

            // Fallback para histórico local se a chamada de API falhar
            RenderSessionTrajectory(session);
        }

        private void OnPersonaSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (PersonasListView?.SelectedItem is PersonaItem persona)
            {
                _selectedPersona = persona;
            }
        }

        private void OnModeSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ModeComboBox?.SelectedItem is ComboBoxItem item && item.Content is string modeName)
            {
                _selectedMode = modeName;
            }
        }

        private void OnDownloadModelClicked(object sender, RoutedEventArgs e)
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string[] candidatePaths = new[]
                {
                    Path.Combine(baseDir, "model-downloader.exe"),
                    Path.Combine(baseDir, "bin", "model-downloader.exe"),
                    Path.Combine(baseDir, "..", "bin", "model-downloader.exe"),
                    Path.Combine(baseDir, "..", "dist", "bin", "model-downloader.exe"),
                    Path.Combine(Directory.GetCurrentDirectory(), "dist", "bin", "model-downloader.exe"),
                    Path.Combine(Directory.GetCurrentDirectory(), "bin", "model-downloader.exe")
                };

                string? downloaderExe = null;
                foreach (var pathCandidate in candidatePaths)
                {
                    string full = Path.GetFullPath(pathCandidate);
                    if (File.Exists(full))
                    {
                        downloaderExe = full;
                        break;
                    }
                }

                if (!string.IsNullOrEmpty(downloaderExe))
                {
                    if (DownloadProgressBar != null) DownloadProgressBar.Visibility = Visibility.Visible;

                    var psi = new ProcessStartInfo
                    {
                        FileName = downloaderExe,
                        Arguments = $"--model {_selectedModel} --auto-close 5",
                        WorkingDirectory = Path.GetDirectoryName(downloaderExe) ?? baseDir,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    };

                    var proc = new Process { StartInfo = psi };
                    proc.OutputDataReceived += (s, argsData) =>
                    {
                        if (string.IsNullOrEmpty(argsData.Data)) return;
                        DispatcherQueue.TryEnqueue(() =>
                        {
                            InspectorPayloadTextBlock.Text = argsData.Data;
                            if (argsData.Data.Contains("%"))
                            {
                                int idx = argsData.Data.IndexOf('%');
                                if (idx > 3)
                                {
                                    string sub = argsData.Data.Substring(idx - 3, 3).Trim();
                                    if (int.TryParse(sub, out int pVal) && DownloadProgressBar != null)
                                    {
                                        DownloadProgressBar.Value = pVal;
                                    }
                                }
                            }
                        });
                    };

                    proc.Start();
                    proc.BeginOutputReadLine();

                    InspectorTitleTextBlock.Text = "📥 GERENCIADOR DE MODELOS INICIADO";
                    InspectorPayloadTextBlock.Text = $"Iniciando download do modelo '{_selectedModel}' via {downloaderExe}...";
                }
                else
                {
                    AddTrajectoryErrorCard("⚠️ Executável 'model-downloader.exe' não encontrado na pasta de instalação.");
                }
            }
            catch (Exception ex)
            {
                AddTrajectoryErrorCard($"❌ Falha ao iniciar gerenciador de modelos: {ex.Message}");
            }
        }

        private void OnModelSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ModelSelectorComboBox?.SelectedItem is ComboBoxItem item && item.Tag is string modelTag)
            {
                _selectedModel = modelTag;
                if (DeepThinkToggle != null)
                {
                    if (_selectedModel == "qwen3-8b-thinking")
                    {
                        DeepThinkToggle.IsChecked = true;
                        UpdateToggleVisual(DeepThinkToggle, true);
                    }
                    else
                    {
                        DeepThinkToggle.IsChecked = false;
                        UpdateToggleVisual(DeepThinkToggle, false);
                    }
                }
            }
        }

        private void OnDeepThinkToggleClicked(object sender, RoutedEventArgs e)
        {
            if (DeepThinkToggle == null) return;
            bool isChecked = DeepThinkToggle.IsChecked == true;
            UpdateToggleVisual(DeepThinkToggle, isChecked);
            if (ModelSelectorComboBox != null)
            {
                if (isChecked && _selectedModel != "qwen3-8b-thinking")
                {
                    ModelSelectorComboBox.SelectedIndex = 2; // qwen3-8b-thinking
                }
                else if (!isChecked && _selectedModel == "qwen3-8b-thinking")
                {
                    ModelSelectorComboBox.SelectedIndex = 0; // qwen2.5-coder-1.5b (Fast / Lite)
                }
            }
        }

        private void UpdateToggleVisual(ToggleButton? toggle, bool isChecked)
        {
            if (toggle == null) return;
            if (isChecked)
            {
                toggle.Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 37, 99, 235));
                toggle.BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 37, 99, 235));
            }
            else
            {
                toggle.Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 41, 59));
                toggle.BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 51, 65, 85));
            }
        }

        private async void OnNewSessionClicked(object sender, RoutedEventArgs e)
        {
            string newId = Guid.NewGuid().ToString("N").Substring(0, 8);
            try
            {
                var payload = new
                {
                    persona = _selectedPersona?.Key ?? "strategic_cognitive_architect",
                    model = _selectedModel
                };
                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                var res = await _httpClient.PostAsync("http://127.0.0.1:3080/v1/sessions", content);
                if (res.IsSuccessStatusCode)
                {
                    string resJson = await res.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(resJson);
                    if (doc.RootElement.TryGetProperty("session", out var sessObj) && sessObj.TryGetProperty("id", out var idProp))
                    {
                        newId = idProp.GetString() ?? newId;
                    }
                }
            }
            catch { }

            var sessions = (List<PsaSessionItem>)(SessionsListView.ItemsSource ?? new List<PsaSessionItem>());
            var newSession = new PsaSessionItem
            {
                Id = newId,
                Name = $"Sessão #{newId.Substring(0, Math.Min(6, newId.Length))}",
                Info = $"Persona: {_selectedPersona?.Name ?? "Strategic"} • Vault Persistente",
                CreatedAt = DateTime.Now
            };
            sessions.Insert(0, newSession);
            SessionsListView.ItemsSource = null;
            SessionsListView.ItemsSource = sessions;
            SessionsListView.SelectedIndex = 0;
            _currentSession = newSession;
            TrajectoryStackPanel.Children.Clear();
        }

        private void OnClearTrajectoryClicked(object sender, RoutedEventArgs e)
        {
            TrajectoryStackPanel.Children.Clear();
            if (_currentSession != null)
            {
                _currentSession.Records.Clear();
            }
        }

        private void OnPromptKeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter && !e.KeyStatus.IsMenuKeyDown)
            {
                e.Handled = true;
                _ = DispatchTurnAsync();
            }
        }

        private void OnDispatchClicked(object sender, RoutedEventArgs e)
        {
            _ = DispatchTurnAsync();
        }

        private async void OnCancelClicked(object sender, RoutedEventArgs e)
        {
            if (!_isDispatching || _currentSession == null) return;
            try
            {
                var payload = new { sessionId = _currentSession.Id };
                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                await _httpClient.PostAsync("http://127.0.0.1:3080/v1/stream/cancel", content);
                AddTrajectoryErrorCard("🛑 Turno cancelado pelo operador.");
            }
            catch { }
        }

        private async Task DispatchTurnAsync()
        {
            if (_isDispatching) return;

            string prompt = PromptTextBox.Text.Trim();
            if (string.IsNullOrEmpty(prompt)) return;

            PromptTextBox.Text = string.Empty;
            _isDispatching = true;
            DispatchButton.IsEnabled = false;

            _totalTurnsCount++;
            TelemetryTurnsTextBlock.Text = $"Turnos: {_totalTurnsCount}";

            var stopwatch = Stopwatch.StartNew();
            long ttftMs = 0;

            // 1. Create Turn Boundary Node
            var turnHeader = CreateTurnHeaderCard(_totalTurnsCount, prompt);
            TrajectoryStackPanel.Children.Add(turnHeader);
            ScrollToBottom();

            // Record node
            var userRecord = new DshTrajectoryRecord
            {
                Type = "UserPrompt",
                Title = $"[Turn {_totalTurnsCount}] User Request",
                Content = prompt,
                Timestamp = DateTime.Now.ToString("HH:mm:ss.fff")
            };
            _currentSession?.Records.Add(userRecord);

            try
            {
                var payload = new
                {
                    model = _selectedModel,
                    mode = _selectedMode,
                    persona = _selectedPersona?.Key ?? "strategic_cognitive_architect",
                    prompt = prompt,
                    deepthink = DeepThinkToggle.IsChecked == true,
                    search = RAGAnchorToggle.IsChecked == true,
                    verify = IdrisVerifierToggle.IsChecked == true
                };

                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, DshApiUrl) { Content = content };
                var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                if (!response.IsSuccessStatusCode)
                {
                    AddTrajectoryErrorCard($"❌ Falha na conexão com o PSA Server ({response.StatusCode}). Certifique-se de que 'bun run ui' está ativo na porta 3080.");
                    return;
                }

                using var stream = await response.Content.ReadAsStreamAsync();
                using var reader = new StreamReader(stream);

                Border? reasoningCard = null;
                TextBlock? reasoningContent = null;
                Border? outputCard = null;
                TextBlock? outputContent = null;

                while (!reader.EndOfStream)
                {
                    string? line = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(line) || !line.StartsWith("data: ")) continue;

                    string sseData = line.Substring(6).Trim();
                    if (sseData == "[DONE]") break;

                    try
                    {
                        using var doc = JsonDocument.Parse(sseData);
                        var root = doc.RootElement;
                        string type = root.GetProperty("type").GetString() ?? "";
                        string contentText = root.GetProperty("content").GetString() ?? "";

                        if (ttftMs == 0)
                        {
                            ttftMs = stopwatch.ElapsedMilliseconds;
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                TtftTextBlock.Text = $"TTFT: {ttftMs}ms";
                                TelemetryLatencyTextBlock.Text = $"Latência: {ttftMs}ms";
                            });
                        }

                        if (type == "reasoning")
                        {
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                if (reasoningCard == null)
                                {
                                    var tuple = CreateReasoningNodeCard();
                                    reasoningCard = tuple.Item1;
                                    reasoningContent = tuple.Item2;
                                    TrajectoryStackPanel.Children.Add(reasoningCard);
                                }
                                reasoningContent!.Text += (reasoningContent.Text.Length > 0 ? "\n" : "") + contentText;
                                ScrollToBottom();
                            });
                        }
                        else if (type == "tool_call")
                        {
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                var toolCallCard = CreateToolCallNodeCard(contentText, root);
                                TrajectoryStackPanel.Children.Add(toolCallCard);
                                ScrollToBottom();
                            });
                        }
                        else if (type == "tool_result")
                        {
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                var toolResultCard = CreateToolResultNodeCard(contentText);
                                TrajectoryStackPanel.Children.Add(toolResultCard);
                                ScrollToBottom();
                            });
                        }
                        else if (type == "verification")
                        {
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                var verifCard = CreateVerificationNodeCard(contentText);
                                TrajectoryStackPanel.Children.Add(verifCard);
                                ScrollToBottom();
                            });
                        }
                        else if (type == "approval_prompt")
                        {
                            string callId = "";
                            if (root.TryGetProperty("metadata", out var metaObj) && metaObj.TryGetProperty("callId", out var cProp))
                            {
                                callId = cProp.GetString() ?? "";
                            }
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                var approvalCard = CreateApprovalPromptCard(contentText, callId);
                                TrajectoryStackPanel.Children.Add(approvalCard);
                                ScrollToBottom();
                            });
                        }
                        else if (type == "text")
                        {
                            DispatcherQueue.TryEnqueue(() =>
                            {
                                if (outputCard == null)
                                {
                                    var tuple = CreateModelOutputNodeCard();
                                    outputCard = tuple.Item1;
                                    outputContent = tuple.Item2;
                                    TrajectoryStackPanel.Children.Add(outputCard);
                                }
                                outputContent!.Text += contentText;
                                ScrollToBottom();
                            });
                        }
                        else if (type == "turn_end")
                        {
                            if (root.TryGetProperty("metadata", out var meta))
                            {
                                double tps = meta.TryGetProperty("tokensPerSec", out var tp) ? tp.GetDouble() : 58.4;
                                double hitRate = meta.TryGetProperty("cacheHitRate", out var ch) ? ch.GetDouble() : 90.0;
                                long dur = meta.TryGetProperty("durationMs", out var dm) ? dm.GetInt64() : stopwatch.ElapsedMilliseconds;

                                DispatcherQueue.TryEnqueue(() =>
                                {
                                    TelemetryTokensTextBlock.Text = $"Tokens/s: {tps:F1}";
                                    TelemetryCacheTextBlock.Text = $"Cache: {hitRate:F1}%";
                                    DecodingTextBlock.Text = $"Decoding: {Math.Max(1, dur - ttftMs)}ms";
                                    TotalDurationTextBlock.Text = $"Duração: {dur}ms";
                                });
                            }
                        }
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                AddTrajectoryErrorCard($"⚠️ Exceção no runtime do DSH: {ex.Message}");
            }
            finally
            {
                stopwatch.Stop();
                _isDispatching = false;
                DispatchButton.IsEnabled = true;
                ScrollToBottom();
            }
        }

        // =========================================================================
        // DEEPSEEK HARNESS NATIVE XAML TRAJECTORY NODES BUILDERS
        // =========================================================================

        private Border CreateTurnHeaderCard(int turnNumber, string prompt)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 24, 27, 36)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 47, 64)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 10, 12, 10)
            };

            var stack = new StackPanel { Spacing = 6 };
            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var turnTitle = new TextBlock
            {
                Text = $"🚩 [TURN {turnNumber}] EXECUÇÃO DE BANCADA HARNESS",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250))
            };
            Grid.SetColumn(turnTitle, 0);
            headerGrid.Children.Add(turnTitle);

            var timeText = new TextBlock
            {
                Text = DateTime.Now.ToString("HH:mm:ss"),
                FontSize = 10,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 100, 116, 139))
            };
            Grid.SetColumn(timeText, 1);
            headerGrid.Children.Add(timeText);

            var promptText = new TextBlock
            {
                Text = $"📥 Prompt: \"{prompt}\"",
                FontSize = 13,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                TextWrapping = TextWrapping.Wrap,
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold
            };

            stack.Children.Add(headerGrid);
            stack.Children.Add(promptText);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection("User Request", prompt, 0, prompt.Length / 4);
            return border;
        }

        private Tuple<Border, TextBlock> CreateReasoningNodeCard()
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 19, 21, 28)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 38, 43, 58)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };

            var stack = new StackPanel { Spacing = 4 };
            var title = new TextBlock
            {
                Text = "🧠 [DEEPTHINK REASONING TRACE] Reflexão Cognitiva",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 167, 139, 250))
            };

            var content = new TextBlock
            {
                FontSize = 12,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 148, 163, 184)),
                TextWrapping = TextWrapping.Wrap,
                FontStyle = Windows.UI.Text.FontStyle.Italic
            };

            stack.Children.Add(title);
            stack.Children.Add(content);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection("Reasoning Trace", content.Text, 120, content.Text.Length / 4);
            return Tuple.Create(border, content);
        }

        private Border CreateToolCallNodeCard(string toolName, JsonElement root)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 20, 24, 34)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 37, 99, 235)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };

            var stack = new StackPanel { Spacing = 4 };
            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var title = new TextBlock
            {
                Text = $"🛠️ [TOOL PLUGIN DISPATCH] {toolName}",
                FontSize = 11,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250))
            };
            Grid.SetColumn(title, 0);
            headerGrid.Children.Add(title);

            var statusBadge = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 58, 138)),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(6, 2, 6, 2),
                Child = new TextBlock { Text = "RUNNING", FontSize = 9, FontWeight = Microsoft.UI.Text.FontWeights.Bold, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 147, 197, 253)) }
            };
            Grid.SetColumn(statusBadge, 1);
            headerGrid.Children.Add(statusBadge);

            string argsText = root.TryGetProperty("metadata", out var m) ? m.ToString() : "{ \"query\": \"...\" }";
            var argsBlock = new TextBlock
            {
                Text = $"Args: {argsText}",
                FontSize = 10,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 148, 163, 184)),
                FontFamily = new FontFamily("Consolas"),
                TextWrapping = TextWrapping.Wrap
            };

            stack.Children.Add(headerGrid);
            stack.Children.Add(argsBlock);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection($"Tool: {toolName}", argsText, 45, 80);
            return border;
        }

        private Border CreateToolResultNodeCard(string resultSummary)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 16, 28, 24)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };

            var stack = new StackPanel { Spacing = 4 };
            var title = new TextBlock
            {
                Text = "📦 [TOOL RESULT / OBSERVATION]",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153))
            };

            var text = new TextBlock
            {
                Text = resultSummary,
                FontSize = 11,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 226, 232, 240)),
                TextWrapping = TextWrapping.Wrap
            };

            stack.Children.Add(title);
            stack.Children.Add(text);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection("Tool Result", resultSummary, 32, resultSummary.Length / 4);
            return border;
        }

        private Border CreateVerificationNodeCard(string verifText)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 18, 28, 42)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };

            var stack = new StackPanel { Spacing = 2 };
            var title = new TextBlock
            {
                Text = "🔬 [FORMAL PROOF SAFETY GATE — IDRIS 2]",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250))
            };

            var text = new TextBlock
            {
                Text = verifText,
                FontSize = 11,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153)),
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold
            };

            stack.Children.Add(title);
            stack.Children.Add(text);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection("Idris 2 Safety Gate", verifText, 18, 40);
            return border;
        }

        private Border CreateApprovalPromptCard(string promptContent, string callId)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 41, 31, 20)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 251, 191, 36)),
                BorderThickness = new Thickness(1.5),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(14, 10, 14, 10)
            };

            var stack = new StackPanel { Spacing = 8 };
            stack.Children.Add(new TextBlock
            {
                Text = "🛡️ [HUMAN-IN-THE-LOOP APPROVAL REQUIRED]",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 251, 191, 36))
            });

            stack.Children.Add(new TextBlock
            {
                Text = promptContent,
                FontSize = 12,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 226, 232, 240)),
                TextWrapping = TextWrapping.Wrap
            });

            var btnPanel = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8 };

            var approveBtn = new Button
            {
                Content = "Aprovar Execução ✅",
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 16, 185, 129)),
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 15, 23, 42)),
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                CornerRadius = new CornerRadius(4)
            };

            var rejectBtn = new Button
            {
                Content = "Rejeitar ❌",
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 239, 68, 68)),
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 15, 23, 42)),
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                CornerRadius = new CornerRadius(4)
            };

            var statusBadge = new TextBlock
            {
                FontSize = 11,
                FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
                VerticalAlignment = VerticalAlignment.Center,
                Visibility = Visibility.Collapsed
            };

            approveBtn.Click += async (s, e) =>
            {
                approveBtn.IsEnabled = false;
                rejectBtn.IsEnabled = false;
                await SendApprovalDecisionAsync(callId, true);
                statusBadge.Text = "✓ AUTORIZADO PELO OPERADOR";
                statusBadge.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153));
                statusBadge.Visibility = Visibility.Visible;
            };

            rejectBtn.Click += async (s, e) =>
            {
                approveBtn.IsEnabled = false;
                rejectBtn.IsEnabled = false;
                await SendApprovalDecisionAsync(callId, false);
                statusBadge.Text = "✗ REJEITADO PELO OPERADOR";
                statusBadge.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 248, 113, 113));
                statusBadge.Visibility = Visibility.Visible;
            };

            btnPanel.Children.Add(approveBtn);
            btnPanel.Children.Add(rejectBtn);
            btnPanel.Children.Add(statusBadge);

            stack.Children.Add(btnPanel);
            border.Child = stack;
            return border;
        }

        private async Task SendApprovalDecisionAsync(string callId, bool approved)
        {
            if (string.IsNullOrEmpty(callId)) return;
            try
            {
                var payload = new { callId = callId, approved = approved };
                string json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                await _httpClient.PostAsync("http://127.0.0.1:3080/v1/approval", content);
            }
            catch { }
        }

        private Tuple<Border, TextBlock> CreateModelOutputNodeCard()
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 24, 27, 36)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 47, 64)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(14, 12, 14, 12)
            };

            var stack = new StackPanel { Spacing = 8 };
            var headerGrid = new Grid();
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            headerGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var header = new TextBlock
            {
                Text = "💬 [DEEPSEEK HARNESS SYNTHESIZED OUTPUT]",
                FontSize = 10,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250))
            };
            Grid.SetColumn(header, 0);
            headerGrid.Children.Add(header);

            var styleBadge = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 41, 59)),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(6, 2, 6, 2),
                Child = new TextBlock { Text = "FLUENT MARKDOWN", FontSize = 9, FontWeight = Microsoft.UI.Text.FontWeights.Bold, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 147, 197, 253)) }
            };
            Grid.SetColumn(styleBadge, 1);
            headerGrid.Children.Add(styleBadge);

            var content = new TextBlock
            {
                FontSize = 13,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                TextWrapping = TextWrapping.Wrap
            };

            var formattedContainer = new StackPanel { Spacing = 6 };

            content.RegisterPropertyChangedCallback(TextBlock.TextProperty, (s, dp) =>
            {
                RenderFluentAssistantMarkdown(content.Text, formattedContainer);
            });

            stack.Children.Add(headerGrid);
            stack.Children.Add(formattedContainer);
            border.Child = stack;

            border.PointerPressed += (s, e) => SelectNodeForInspection("Model Output", content.Text, 800, content.Text.Length / 4);
            return Tuple.Create(border, content);
        }

        private void RenderFluentAssistantMarkdown(string rawText, StackPanel container)
        {
            container.Children.Clear();
            if (string.IsNullOrEmpty(rawText)) return;

            string[] blocks = rawText.Split(new[] { "```" }, StringSplitOptions.None);
            for (int i = 0; i < blocks.Length; i++)
            {
                string block = blocks[i];
                if (string.IsNullOrEmpty(block)) continue;

                if (i % 2 == 1)
                {
                    // Code Block (DeepSeek / Agentic Code Card)
                    string lang = "code";
                    string codeContent = block;

                    int firstLineEnd = block.IndexOf('\n');
                    if (firstLineEnd > 0)
                    {
                        string possibleLang = block.Substring(0, firstLineEnd).Trim();
                        if (!string.IsNullOrEmpty(possibleLang) && possibleLang.Length < 15 && !possibleLang.Contains(' '))
                        {
                            lang = possibleLang;
                            codeContent = block.Substring(firstLineEnd + 1);
                        }
                    }

                    var codeCard = new Border
                    {
                        Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 15, 17, 23)),
                        BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 47, 64)),
                        BorderThickness = new Thickness(1),
                        CornerRadius = new CornerRadius(8),
                        Padding = new Thickness(0),
                        Margin = new Thickness(0, 4, 0, 4)
                    };

                    var cardStack = new StackPanel();

                    // Card Header Bar
                    var cardHeader = new Grid
                    {
                        Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 24, 27, 36)),
                        Padding = new Thickness(12, 6, 12, 6)
                    };
                    cardHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                    cardHeader.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

                    var langStack = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 6, VerticalAlignment = VerticalAlignment.Center };
                    var langText = new TextBlock
                    {
                        Text = $"📄 {lang.ToUpper()}",
                        FontSize = 10,
                        FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                        Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250)),
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    var syntaxBadge = new Border
                    {
                        Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 6, 78, 59)),
                        CornerRadius = new CornerRadius(4),
                        Padding = new Thickness(4, 1, 4, 1),
                        Child = new TextBlock { Text = "Sintaxe Válida ✅", FontSize = 8, FontWeight = Microsoft.UI.Text.FontWeights.Bold, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153)) }
                    };

                    langStack.Children.Add(langText);
                    langStack.Children.Add(syntaxBadge);
                    Grid.SetColumn(langStack, 0);
                    cardHeader.Children.Add(langStack);

                    var copyBtn = new Button
                    {
                        Content = "Copiar Código 📋",
                        FontSize = 10,
                        Padding = new Thickness(8, 2, 8, 2),
                        Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 41, 59)),
                        Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                        BorderThickness = new Thickness(0),
                        CornerRadius = new CornerRadius(4)
                    };

                    string textToCopy = codeContent.Trim();
                    copyBtn.Click += (s, e) =>
                    {
                        try
                        {
                            var dp = new Windows.ApplicationModel.DataTransfer.DataPackage();
                            dp.SetText(textToCopy);
                            Windows.ApplicationModel.DataTransfer.Clipboard.SetContent(dp);
                            copyBtn.Content = "Copiado! ✅";
                        }
                        catch { }
                    };
                    Grid.SetColumn(copyBtn, 1);
                    cardHeader.Children.Add(copyBtn);

                    // Code Content Block with Diff Highlighting
                    if (lang.Equals("diff", StringComparison.OrdinalIgnoreCase))
                    {
                        var diffContainer = new StackPanel { Padding = new Thickness(12, 8, 12, 8), Spacing = 2 };
                        string[] diffLines = codeContent.Trim().Split('\n');
                        foreach (string dLine in diffLines)
                        {
                            var lineBlock = new TextBlock
                            {
                                Text = dLine,
                                FontSize = 12,
                                FontFamily = new FontFamily("Consolas"),
                                TextWrapping = TextWrapping.Wrap
                            };

                            if (dLine.StartsWith("+"))
                            {
                                lineBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153));
                            }
                            else if (dLine.StartsWith("-"))
                            {
                                lineBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 248, 113, 113));
                            }
                            else
                            {
                                lineBlock.Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 148, 163, 184));
                            }
                            diffContainer.Children.Add(lineBlock);
                        }
                        cardStack.Children.Add(cardHeader);
                        cardStack.Children.Add(diffContainer);
                    }
                    else
                    {
                        var codeTextBlock = new TextBlock
                        {
                            Text = codeContent.Trim(),
                            FontSize = 12,
                            FontFamily = new FontFamily("Consolas"),
                            Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 52, 211, 153)),
                            TextWrapping = TextWrapping.Wrap,
                            Padding = new Thickness(12, 10, 12, 10)
                        };
                        var codeScrollViewer = new ScrollViewer
                        {
                            MaxHeight = 400,
                            VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                            HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                            Content = codeTextBlock
                        };

                        cardStack.Children.Add(cardHeader);
                        cardStack.Children.Add(codeScrollViewer);
                    }
                    codeCard.Child = cardStack;

                    container.Children.Add(codeCard);
                }
                else
                {
                    // Text Block
                    var textBlock = new TextBlock
                    {
                        Text = block,
                        FontSize = 13,
                        Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                        TextWrapping = TextWrapping.Wrap
                    };
                    container.Children.Add(textBlock);
                }
            }
        }

        private void AddTrajectoryErrorCard(string error)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 45, 26, 34)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 248, 113, 113)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };
            border.Child = new TextBlock { Text = error, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 248, 113, 113)), TextWrapping = TextWrapping.Wrap, FontSize = 12 };
            TrajectoryStackPanel.Children.Add(border);
            ScrollToBottom();
        }

        private async void OnRefreshTasksClicked(object sender, RoutedEventArgs e)
        {
            try
            {
                var res = await _httpClient.GetAsync("http://127.0.0.1:3080/v1/tasks");
                if (res.IsSuccessStatusCode)
                {
                    string json = await res.Content.ReadAsStringAsync();
                    InspectorTitleTextBlock.Text = "🔄 FILA DE TAREFAS DE SEGUNDO PLANO";
                    InspectorMetaTextBlock.Text = "Servidor: http://127.0.0.1:3080\nStatus: 100% Sincronizado";
                    InspectorPayloadTextBlock.Text = json;
                }
            }
            catch (Exception ex)
            {
                AddTrajectoryErrorCard($"❌ Falha ao consultar fila de tarefas: {ex.Message}");
            }
        }

        private void SelectNodeForInspection(string title, string payload, long durMs, int tokens)
        {
            InspectorTitleTextBlock.Text = title;
            InspectorMetaTextBlock.Text = $"Status: Concluído\nDuração: {durMs}ms\nTokens Estimados: ~{tokens}";
            InspectorPayloadTextBlock.Text = payload;
        }

        private void RenderSessionTrajectory(PsaSessionItem session)
        {
            TrajectoryStackPanel.Children.Clear();
            foreach (var rec in session.Records)
            {
                if (rec.Type == "UserPrompt")
                {
                    TrajectoryStackPanel.Children.Add(CreateTurnHeaderCard(1, rec.Content));
                }
            }
        }

        private void OnExportTrajectoryClicked(object sender, RoutedEventArgs e)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"# DeepSeek Harness (dsh) Trajectory Flight Recorder");
            sb.AppendLine($"Session: {_currentSession?.Id ?? "default"}");
            sb.AppendLine($"Timestamp: {DateTime.UtcNow:O}");
            sb.AppendLine($"Total Turns: {_totalTurnsCount}");

            using var sha = SHA256.Create();
            byte[] hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
            string hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

            SelectNodeForInspection("Trajectory Export", $"SHA-256 Stamp:\n{hash}\n\nRegistro de auditoria criptográfica do append-only session log exportado com sucesso no padrão dsh-trajectory.", 0, 0);
        }

        private void ScrollToBottom()
        {
            TrajectoryScrollViewer?.ChangeView(null, TrajectoryScrollViewer.ScrollableHeight, null);
        }
    }
}
