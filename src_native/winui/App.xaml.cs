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
                var logPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "winui_crash.log");
                string detail = $"[{source}] {DateTime.Now}: {ex?.Message}\n{ex}\n{ex?.StackTrace}\nInner: {ex?.InnerException}\n\n";
                System.IO.File.AppendAllText(logPath, detail);
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
