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
        pass

    def run_audit_async(self):
        """Dispara o ciclo de auditoria do orquestrador."""
        if not self.orc: return
        self.status_label.configure(text="Status: Analisando...", text_color="yellow")
        
        def job():
            try:
                # Simula o fluxo do DiagnosticPipeline
                ctx = self.orc.context_engine.analyze_project()
                findings = self.orc.run_strategic_audit(ctx)
                # O on_health_update será chamado internamente pelo orquestrador
                self.after(0, lambda: self.status_label.configure(text="Status: Protegido", text_color="green"))
            except Exception as e:
                logger.error(f"Erro na auditoria UI: {e}")
                self.after(0, lambda: self.status_label.configure(text="Status: Erro", text_color="red"))

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

if __name__ == "__main__":
    # Teste isolado
    app = NativeGUI(None)
    app.mainloop()
