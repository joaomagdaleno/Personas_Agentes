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
            this.UnhandledException += (sender, e) =>
            {
                try
                {
                    var logPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "winui_crash.log");
                    System.IO.File.AppendAllText(logPath, $"[UnhandledException] {DateTime.Now}: {e.Message}\n{e.Exception}\n{e.Exception?.StackTrace}\nInner: {e.Exception?.InnerException}\n\n");
                }
                catch { }
            };

            try
            {
                this.InitializeComponent();
            }
            catch (System.Exception ex)
            {
                var logPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "winui_crash.log");
                System.IO.File.AppendAllText(logPath, $"[InitializeComponent Exception] {DateTime.Now}: {ex.Message}\n{ex.StackTrace}\nInner: {ex.InnerException}\n\n");
                throw;
            }
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
