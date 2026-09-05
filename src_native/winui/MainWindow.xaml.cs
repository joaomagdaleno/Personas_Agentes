using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PersonasAgentes.WinUI
{
    public class PersonaItem
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public sealed partial class MainWindow : Window
    {
        private const string DshApiUrl = "http://127.0.0.1:3080/v1/stream";
        private readonly HttpClient _httpClient = new HttpClient();
        private PersonaItem _selectedPersona;

        public MainWindow()
        {
            this.InitializeComponent();
            InitializePersonas();
        }

        private void InitializePersonas()
        {
            var personas = new List<PersonaItem>
            {
                new PersonaItem { Key = "strategic_cognitive_architect", Name = "🧠 Strategic Cognitive Architect", Category = "AI/SLM & Reasoning" },
                new PersonaItem { Key = "audit_code_guardian", Name = "📊 Audit Code Guardian", Category = "Diagnostics & AST" },
                new PersonaItem { Key = "security_cloud_guardian", Name = "🛡️ Security Cloud Guardian", Category = "Vulnerabilities & Safety" },
                new PersonaItem { Key = "architecture_types", Name = "📐 Architecture Types", Category = "AST & Topology" },
                new PersonaItem { Key = "resilience_healing_architect", Name = "🧪 Resilience Healing Architect", Category = "Auto-Healing & Idris 2" },
                new PersonaItem { Key = "sys_perf_architect", Name = "⚡ Sys Perf Architect", Category = "Resource & WASM" },
                new PersonaItem { Key = "sync_devops_architect", Name = "🔄 Sync DevOps Architect", Category = "Git & Automation" },
                new PersonaItem { Key = "ui_ux_architect", Name = "🎨 UI/UX Architect", Category = "Native Desktop & Formatters" }
            };

            PersonasListView.ItemsSource = personas;
            PersonasListView.SelectedIndex = 0;
            _selectedPersona = personas[0];
        }

        private void OnPersonaSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (PersonasListView.SelectedItem is PersonaItem item)
            {
                _selectedPersona = item;
                ActivePersonaTitle.Text = item.Name;
            }
        }

        private async void OnSendClicked(object sender, RoutedEventArgs e)
        {
            await SendPromptAsync();
        }

        private async void OnPromptKeyDown(object sender, KeyRoutedEventArgs e)
        {
            if (e.Key == Windows.System.VirtualKey.Enter && !e.KeyStatus.IsMenuKeyDown)
            {
                e.Handled = true;
                await SendPromptAsync();
            }
        }

        private async Task SendPromptAsync()
        {
            string prompt = PromptTextBox.Text.Trim();
            if (string.IsNullOrEmpty(prompt)) return;

            PromptTextBox.Text = string.Empty;
            AddUserMessageCard(prompt);

            try
            {
                var payload = new
                {
                    model = _selectedPersona.Key,
                    prompt = prompt
                };

                string jsonJson = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonJson, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage(HttpMethod.Post, DshApiUrl) { Content = content };
                var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                if (!response.IsSuccessStatusCode)
                {
                    AddAssistantMessageCard("❌ Erro ao conectar ao servidor DSH local Bun.", "Error");
                    return;
                }

                using var stream = await response.ContentReadAsStreamAsync();
                using var reader = new StreamReader(stream);

                Expander reasoningExpander = null;
                TextBlock responseTextBlock = null;

                while (!reader.EndOfStream)
                {
                    string line = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(line) || !line.StartsWith("data: ")) continue;

                    string sseData = line.Substring(6).Trim();
                    if (sseData == "[DONE]") break;

                    try {
                        using var doc = JsonDocument.Parse(sseData);
                        var root = doc.RootElement;
                        string type = root.GetProperty("type").GetString();
                        string contentText = root.GetProperty("content").GetString();

                        if (type == "reasoning")
                        {
                            DispatcherQueue.TryEnqueue(() => {
                                if (reasoningExpander == null) {
                                    reasoningExpander = CreateReasoningExpander();
                                    MessagesStackPanel.Children.Add(reasoningExpander);
                                }
                                var tb = (TextBlock)((StackPanel)reasoningExpander.Content).Children[0];
                                tb.Text += (tb.Text.Length > 0 ? "\n" : "") + contentText;
                            });
                        }
                        else if (type == "approval_prompt")
                        {
                            DispatcherQueue.TryEnqueue(() => {
                                var approvalCard = CreateApprovalCard(contentText);
                                MessagesStackPanel.Children.Add(approvalCard);
                            });
                        }
                        else if (type == "text")
                        {
                            DispatcherQueue.TryEnqueue(() => {
                                if (responseTextBlock == null) {
                                    responseTextBlock = CreateResponseCard();
                                    MessagesStackPanel.Children.Add(responseTextBlock);
                                }
                                responseTextBlock.Text += contentText;
                            });
                        }
                    } catch {}
                }
            }
            catch (Exception ex)
            {
                AddAssistantMessageCard($"⚠️ Falha no streaming DSH: {ex.Message}", "Error");
            }
        }

        private void AddUserMessageCard(string text)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 49, 50, 68)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 10, 12, 10),
                HorizontalAlignment = HorizontalAlignment.Right,
                MaxWidth = 600
            };
            border.Child = new TextBlock { Text = text, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 205, 214, 244)), TextWrapping = TextWrapping.Wrap };
            MessagesStackPanel.Children.Add(border);
        }

        private Expander CreateReasoningExpander()
        {
            var expander = new Expander
            {
                Header = "🧠 Pensamento Transparente da Persona (Collapsible Reasoning)",
                IsExpanded = false,
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = 650,
                Margin = new Thickness(0, 4, 0, 4)
            };
            var stack = new StackPanel();
            stack.Children.Add(new TextBlock { Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 166, 173, 200)), TextWrapping = TextWrapping.Wrap, FontSize = 12 });
            expander.Content = stack;
            return expander;
        }

        private Border CreateApprovalCard(string content)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 30, 30, 46)),
                BorderBrush = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 137, 180, 250)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12),
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = 650,
                Margin = new Thickness(0, 4, 0, 4)
            };
            var stack = new StackPanel { Spacing = 8 };
            stack.Children.Add(new TextBlock { Text = content, Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 205, 214, 244)), FontWeight = Microsoft.UI.Text.FontWeights.Bold });
            var btn = new Button { Content = "Aprovar Patch & Auto-Cura 🔬", Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 166, 227, 161)), Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 17, 11, 27)) };
            stack.Children.Add(btn);
            border.Child = stack;
            return border;
        }

        private TextBlock CreateResponseCard()
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 24, 24, 37)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(12, 10, 12, 10),
                HorizontalAlignment = HorizontalAlignment.Left,
                MaxWidth = 650
            };
            var tb = new TextBlock { Foreground = new SolidColorBrush(Microsoft.UI.ColorHelper.FromArgb(255, 205, 214, 244)), TextWrapping = TextWrapping.Wrap, FontSize = 13 };
            border.Child = tb;
            MessagesStackPanel.Children.Add(border);
            return tb;
        }

        private void AddAssistantMessageCard(string text, string type)
        {
            var tb = CreateResponseCard();
            tb.Text = text;
        }

        private void OnClearChatClicked(object sender, RoutedEventArgs e)
        {
            MessagesStackPanel.Children.Clear();
        }
    }
}
