"""
📊 View de Dashboard Sistêmico.
Centraliza a visualização dos sinais vitais e telemetria de saúde.
"""
import customtkinter as ctk
import logging
from src_local.interface.components.health_gauge import HealthGauge

logger = logging.getLogger(__name__)

class DashboardView(ctk.CTkFrame):
    """View soberana para monitoramento de saúde do projeto."""
    def __init__(self, master):
        super().__init__(master, fg_color="transparent")
        logger.info("📊 [Dashboard] Inicializando interface de telemetria...")
        self.setup_ui()

    def setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        header = ctk.CTkLabel(self, text="DASHBOARD DE SOBERANIA", font=ctk.CTkFont(size=24, weight="bold"))
        header.grid(row=0, column=0, pady=(0, 20))

        gauge_frame = ctk.CTkFrame(self, fg_color="#1a1a1a", corner_radius=15)
        gauge_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        gauge_frame.grid_columnconfigure(0, weight=1)
        
        self.health_gauge = HealthGauge(gauge_frame, size=250)
        self.health_gauge.grid(row=0, column=0, pady=30)
        
        self.health_desc = ctk.CTkLabel(gauge_frame, text="Integridade: 100%", font=ctk.CTkFont(size=18, weight="bold"), text_color="#00ffcc")
        self.health_desc.grid(row=1, column=0, pady=(0, 20))

        self.findings_label = ctk.CTkLabel(gauge_frame, text="Problemas Detectados: 0", font=ctk.CTkFont(size=14))
        self.findings_label.grid(row=2, column=0, pady=(0, 20))

        # Log Area (Console)
        self.log_textbox = ctk.CTkTextbox(self, height=150, font=("Consolas", 12))
        self.log_textbox.grid(row=2, column=0, sticky="ew", padx=10, pady=10)
        self.log_textbox.insert("0.0", "--- Console de Orquestração PhD ---\n")
        self.log_textbox.configure(state="disabled")

    def update_health(self, score):
        logger.debug(f"📊 [Dashboard] Atualizando score de saúde: {score}")
        self.health_gauge.set_health(score)
        self.health_desc.configure(text=f"Integridade: {score}%")

    def update_findings_count(self, count):
        self.findings_label.configure(text=f"Problemas Detectados: {count}")

    def log(self, msg, level="INFO"):
        self.log_textbox.configure(state="normal")
        self.log_textbox.insert("end", f"[{level}] {msg}\n")
        self.log_textbox.configure(state="disabled")
        self.log_textbox.see("end")

    def log_findings(self, findings):
        self.log_textbox.configure(state="normal")
        for f in findings:
            msg = f"[{f.get('severity', 'INFO')}] {f.get('file', 'Global')}: {f.get('issue')}\n"
            self.log_textbox.insert("end", msg)
        self.log_textbox.configure(state="disabled")
        self.log_textbox.see("end")
