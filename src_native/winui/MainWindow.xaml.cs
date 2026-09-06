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
        private string _selectedMode = "Standard mode";
        private bool _isDispatching = false;
        private int _totalTurnsCount = 0;
        private bool _isSidebarCollapsed = false;
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

        // =========================================================================
        // SIDEBAR & SETTINGS TOGGLES
        // =========================================================================

        private void OnToggleSidebarClicked(object sender, RoutedEventArgs e)
        {
            _isSidebarCollapsed = !_isSidebarCollapsed;
            if (SidebarColumn != null)
            {
                SidebarColumn.Width = _isSidebarCollapsed ? new GridLength(0) : new GridLength(220);
            }
        }

        private void OnOpenSettingsClicked(object sender, RoutedEventArgs e)
        {
            if (SettingsOverlayView != null) SettingsOverlayView.Visibility = Visibility.Visible;
            if (MainWorkbenchView != null) MainWorkbenchView.Visibility = Visibility.Collapsed;
        }

        private void OnCloseSettingsClicked(object sender, RoutedEventArgs e)
        {
            if (SettingsOverlayView != null) SettingsOverlayView.Visibility = Visibility.Collapsed;
            if (MainWorkbenchView != null) MainWorkbenchView.Visibility = Visibility.Visible;
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
                    string crashContent = File.ReadAllText(logPath);
                }
            }
            catch { }
        }

        private async Task EnsureBackendRunningAsync()
        {
            try
            {
                using var cts = new System.Threading.CancellationTokenSource(TimeSpan.FromSeconds(1));
                var response = await _httpClient.GetAsync("http://127.0.0.1:3080/health", cts.Token);
                if (response.IsSuccessStatusCode) return;
            }
            catch { }

            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string[] candidatePaths = new[]
                {
                    Path.Combine(baseDir, "personas-engine.exe"),
                    Path.Combine(baseDir, "bin", "personas-engine.exe"),
                    Path.Combine(Directory.GetCurrentDirectory(), "bin", "personas-engine.exe")
                };

                string? engineExe = null;
                foreach (var pathCandidate in candidatePaths)
                {
                    string full = Path.GetFullPath(pathCandidate);
                    if (File.Exists(full)) { engineExe = full; break; }
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
                }
            }
            catch { }
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
                                Name = $"Personas_Agentes #{id.Substring(0, Math.Min(4, id.Length))}",
                                Info = $"Persona: {persona}",
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
                    Name = "Personas_Agentes",
                    Info = "Persona: Strategic Cognitive",
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

                            if (type == "UserPrompt" || type == "user_prompt")
                            {
                                TrajectoryStackPanel.Children.Add(CreateTurnHeaderCard(session.Records.Count + 1, content));
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
                            else if (type == "text" || type == "model_output")
                            {
                                var tuple = CreateModelOutputNodeCard();
                                tuple.Item2.Text = content;
                                TrajectoryStackPanel.Children.Add(tuple.Item1);
                            }
                        }

                        if (session.Records.Count > 0 && HeroStackPanel != null)
                        {
                            HeroStackPanel.Visibility = Visibility.Collapsed;
                        }
                        ScrollToBottom();
                        return;
                    }
                }
            }
            catch { }
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

        private void OnModelSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (ModelSelectorComboBox?.SelectedItem is ComboBoxItem item && item.Tag is string modelTag)
            {
                _selectedModel = modelTag;
            }
        }

        private void OnDownloadModelClicked(object sender, RoutedEventArgs e)
        {
            if (DownloadProgressBar != null) DownloadProgressBar.Visibility = Visibility.Visible;
        }

        private async void OnNewSessionClicked(object sender, RoutedEventArgs e)
        {
            string newId = Guid.NewGuid().ToString("N").Substring(0, 8);
            var sessions = (List<PsaSessionItem>)(SessionsListView.ItemsSource ?? new List<PsaSessionItem>());
            var newSession = new PsaSessionItem
            {
                Id = newId,
                Name = $"Personas_Agentes #{newId.Substring(0, Math.Min(4, newId.Length))}",
                Info = "Persona: Strategic Cognitive",
                CreatedAt = DateTime.Now
            };
            sessions.Insert(0, newSession);
            SessionsListView.ItemsSource = null;
            SessionsListView.ItemsSource = sessions;
            SessionsListView.SelectedIndex = 0;
            _currentSession = newSession;
            TrajectoryStackPanel.Children.Clear();
            if (HeroStackPanel != null) HeroStackPanel.Visibility = Visibility.Visible;
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

        private async Task DispatchTurnAsync()
        {
            if (_isDispatching) return;

            string prompt = PromptTextBox.Text.Trim();
            if (string.IsNullOrEmpty(prompt)) return;

            PromptTextBox.Text = string.Empty;
            _isDispatching = true;
            DispatchButton.IsEnabled = false;

            if (HeroStackPanel != null) HeroStackPanel.Visibility = Visibility.Collapsed;

            _totalTurnsCount++;
            var turnHeader = CreateTurnHeaderCard(_totalTurnsCount, prompt);
            TrajectoryStackPanel.Children.Add(turnHeader);
            ScrollToBottom();

            try
            {
                var payload = new
                {
                    model = _selectedModel,
                    mode = _selectedMode,
                    persona = _selectedPersona?.Key ?? "strategic_cognitive_architect",
                    prompt = prompt,
                    deepthink = true,
                    search = true,
                    verify = true
                };

                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, DshApiUrl) { Content = content };
                var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                if (!response.IsSuccessStatusCode)
                {
                    AddTrajectoryErrorCard($"❌ Connection failed to local harness server ({response.StatusCode}).");
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
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                AddTrajectoryErrorCard($"⚠️ Harness execution error: {ex.Message}");
            }
            finally
            {
                _isDispatching = false;
                DispatchButton.IsEnabled = true;
                ScrollToBottom();
            }
        }

        // =========================================================================
        // TRAJECTORY CARD BUILDERS
        // =========================================================================

        private Border CreateTurnHeaderCard(int turnNumber, string prompt)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 27, 28, 34)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 42, 44, 54)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(14, 12, 14, 12)
            };

            var stack = new StackPanel { Spacing = 6 };
            var promptText = new TextBlock
            {
                Text = prompt,
                FontSize = 14,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                TextWrapping = TextWrapping.Wrap,
                FontWeight = Microsoft.UI.Text.FontWeights.Medium
            };

            stack.Children.Add(promptText);
            border.Child = stack;
            return border;
        }

        private Tuple<Border, TextBlock> CreateReasoningNodeCard()
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 20, 21, 26)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 38, 40, 50)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(14, 10, 14, 10)
            };

            var stack = new StackPanel { Spacing = 4 };
            var title = new TextBlock
            {
                Text = "🧠 Thinking",
                FontSize = 11,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 148, 163, 184))
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

            return Tuple.Create(border, content);
        }

        private Border CreateToolCallNodeCard(string toolName, JsonElement root)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 22, 24, 32)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 37, 99, 235)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 8, 12, 8)
            };

            var stack = new StackPanel { Spacing = 4 };
            var title = new TextBlock
            {
                Text = $"🛠️ Tool: {toolName}",
                FontSize = 11,
                FontWeight = Microsoft.UI.Text.FontWeights.Bold,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 96, 165, 250))
            };

            stack.Children.Add(title);
            border.Child = stack;
            return border;
        }

        private Tuple<Border, TextBlock> CreateModelOutputNodeCard()
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 24, 25, 32)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 40, 42, 54)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(16, 14, 16, 14)
            };

            var content = new TextBlock
            {
                FontSize = 13,
                Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 241, 245, 249)),
                TextWrapping = TextWrapping.Wrap
            };

            border.Child = content;
            return Tuple.Create(border, content);
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

        private void OnRefreshTasksClicked(object sender, RoutedEventArgs e) {}

        private void ScrollToBottom()
        {
            TrajectoryScrollViewer?.ChangeView(null, TrajectoryScrollViewer.ScrollableHeight, null);
        }
    }
}
