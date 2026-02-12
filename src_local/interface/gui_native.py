import customtkinter as ctk
import logging
import threading
from typing import Optional

logger = logging.getLogger(__name__)

class NativeGUI(ctk.CTk):
    """
    💎 Dashboard Sincronizado 2026.
    Interface nativa de baixo consumo para monitoramento de saúde sistêmica.
    """
    def __init__(self, orchestrator):
        super().__init__()
        self.orc = orchestrator
        if self.orc:
            self.orc.on_health_update = self._update_health_ui
            self.orc.on_findings_update = self._update_findings_ui
            
        self.title("🏛️ Persona Agent: Soberania Sistêmica 2026")
        self.geometry("1100x700")
        
        # Tema Soberano: Dark Tech
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._setup_sidebar()
        self._setup_main_dashboard()
        
        logger.info("🎨 Interface Nativa Inicializada.")

    def _update_health_ui(self, health_data):
        """Atualiza o medidor de saúde via thread main."""
        score = health_data.get("health_score", 100)
        self.after(0, lambda: self.health_gauge.set_health(score))
        self.after(0, lambda: self.health_desc.configure(text=f"Integridade: {score}%"))

    def _update_findings_ui(self, findings):
        """Atualiza a lista de alertas."""
        count = len(findings)
        self.after(0, lambda: self.findings_label.configure(text=f"Problemas Detectados: {count}"))
        # Se houver uma área de log, podemos injetar os achados nela também
        self.after(0, lambda: self._log_findings(findings))

    def _log_findings(self, findings):
        if hasattr(self, "log_textbox"):
            self.log_textbox.configure(state="normal")
            for f in findings:
                msg = f"[{f.get('severity', 'INFO')}] {f.get('file', 'Global')}: {f.get('issue')}\n"
                self.log_textbox.insert("end", msg)
            self.log_textbox.configure(state="disabled")
            self.log_textbox.see("end")

    def run_audit_async(self):
        """Dispara o ciclo de auditoria do orquestrador real."""
        if not self.orc: return
        self.status_label.configure(text="Status: Analisando...", text_color="yellow")
        self.run_button.configure(state="disabled")
        
        def job():
            try:
                # Executa o pipeline real
                report_path = self.orc.generate_full_diagnostic()
                self.after(0, lambda: self.status_label.configure(text="Status: Protegido", text_color="#00ffcc"))
                self.after(0, lambda: self.run_button.configure(state="normal"))
                logger.info(f"Auditoria concluída. Relatório em: {report_path}")
            except Exception as e:
                logger.error(f"Erro na auditoria UI: {e}", exc_info=True)
                self.after(0, lambda: self.status_label.configure(text="Status: Erro", text_color="red"))
                self.after(0, lambda: self.run_button.configure(state="normal"))

        threading.Thread(target=job, daemon=True).start()

    def _setup_sidebar(self):
        self.sidebar_frame = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew", padx=0, pady=0)
        self.sidebar_frame.grid_rowconfigure(4, weight=1)

        self.logo_label = ctk.CTkLabel(self.sidebar_frame, text="AGENTES PhD", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        self.run_button = ctk.CTkButton(self.sidebar_frame, text="🚀 Executar Auditoria", command=self.run_audit_async)
        self.run_button.grid(row=1, column=0, padx=20, pady=10)

        self.sidebar_button_1 = ctk.CTkButton(self.sidebar_frame, text="Dashboard", command=self._show_dashboard)
        self.sidebar_button_1.grid(row=2, column=0, padx=20, pady=10)

        self.sidebar_button_2 = ctk.CTkButton(self.sidebar_frame, text="Plano de Batalha", command=self._show_battle_plan)
        self.sidebar_button_2.grid(row=3, column=0, padx=20, pady=10)

        self.status_label = ctk.CTkLabel(self.sidebar_frame, text="Status: Monitorando", text_color="#00ffcc")
        self.status_label.grid(row=5, column=0, padx=20, pady=20)

    def _setup_main_dashboard(self):
        """Configura a área principal: Dashboard com HealthGauge."""
        from src_local.interface.components.health_gauge import HealthGauge
        
        self.main_container = ctk.CTkFrame(self, corner_radius=10, fg_color="transparent")
        self.main_container.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(1, weight=1)

        # Header
        self.header_label = ctk.CTkLabel(self.main_container, text="DASHBOARD DE SOBERANIA", font=ctk.CTkFont(size=24, weight="bold"))
        self.header_label.grid(row=0, column=0, pady=(0, 20))

        # Gauge Center
        self.gauge_frame = ctk.CTkFrame(self.main_container, fg_color="#1a1a1a", corner_radius=15)
        self.gauge_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        self.gauge_frame.grid_columnconfigure(0, weight=1)
        
        self.health_gauge = HealthGauge(self.gauge_frame, size=250)
        self.health_gauge.grid(row=0, column=0, pady=30)
        
        self.health_desc = ctk.CTkLabel(self.gauge_frame, text="Integridade: 100%", font=ctk.CTkFont(size=18, weight="bold"), text_color="#00ffcc")
        self.health_desc.grid(row=1, column=0, pady=(0, 20))

        self.findings_label = ctk.CTkLabel(self.gauge_frame, text="Problemas Detectados: 0", font=ctk.CTkFont(size=14))
        self.findings_label.grid(row=2, column=0, pady=(0, 20))

        # Log Area (Console)
        self.log_textbox = ctk.CTkTextbox(self.main_container, height=150, font=("Consolas", 12))
        self.log_textbox.grid(row=2, column=0, sticky="ew", padx=10, pady=10)
        self.log_textbox.insert("0.0", "--- Console de Orquestração PhD ---\n")
        self.log_textbox.configure(state="disabled")

    def _show_dashboard(self):
        """Switch to Dashboard view (default)."""
        logger.info("Exibindo Dashboard.")

    def _show_battle_plan(self):
        """Switch to Battle Plan view."""
        logger.info("Exibindo Plano de Batalha.")

if __name__ == "__main__":
    # Teste isolado
    from src_local.core.orchestrator import Orchestrator
    orc = Orchestrator(".") # Contexto dummy para teste
    app = NativeGUI(orc)
    app.mainloop()
