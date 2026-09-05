#nullable enable
using System;
using Microsoft.UI.Xaml;

namespace PersonasAgentes.WinUI
{
    public partial class App : Application
    {
        private Window? m_window;

        public App()
        {
            AppDomain.CurrentDomain.UnhandledException += (s, args) =>
            {
                LogAndShowFatalError("AppDomain.UnhandledException", args.ExceptionObject as Exception);
            };

            this.UnhandledException += (sender, e) =>
            {
                e.Handled = true;
                LogAndShowFatalError("Xaml.UnhandledException", e.Exception);
            };

            try
            {
                this.InitializeComponent();
            }
            catch (System.Exception ex)
            {
                LogAndShowFatalError("InitializeComponent Exception", ex);
                throw;
            }
        }

        private static void LogAndShowFatalError(string source, Exception? ex)
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string logDir = System.IO.Path.Combine(localAppData, "PersonasAgentes", "logs");
                if (!System.IO.Directory.Exists(logDir))
                {
                    System.IO.Directory.CreateDirectory(logDir);
                }

                string logPath = System.IO.Path.Combine(logDir, "winui_crash.log");
                string detail = $"==================================================================\n" +
                                $"[{source}] {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n" +
                                $"Mensagem: {ex?.Message}\n" +
                                $"Stack Trace:\n{ex}\n" +
                                $"Inner Exception: {ex?.InnerException}\n" +
                                $"==================================================================\n\n";

                System.IO.File.AppendAllText(logPath, detail, System.Text.Encoding.UTF8);

                // Cópias redundantes em locais fáceis de encontrar (%TEMP% e BaseDirectory)
                try
                {
                    string tempLog = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "PersonasAgentes_winui_crash.log");
                    System.IO.File.AppendAllText(tempLog, detail, System.Text.Encoding.UTF8);

                    string baseLog = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "winui_crash.log");
                    System.IO.File.AppendAllText(baseLog, detail, System.Text.Encoding.UTF8);
                }
                catch { }
            }
            catch { }
        }

        protected override void OnLaunched(Microsoft.UI.Xaml.LaunchActivatedEventArgs args)
        {
            try
            {
                m_window = new MainWindow();
                m_window.Activate();
            }
            catch (System.Exception ex)
            {
                var logPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "winui_crash.log");
                System.IO.File.AppendAllText(logPath, $"[OnLaunched Exception] {DateTime.Now}: {ex.Message}\n{ex.StackTrace}\nInner: {ex.InnerException}\n\n");
                throw;
            }
        }
    }
}
