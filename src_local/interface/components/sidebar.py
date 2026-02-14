"""
🏛️ Componente de Sidebar Soberano.
Gerencia a navegação principal e o status vital do sistema em tempo real.
"""
import customtkinter as ctk
import logging

logger = logging.getLogger(__name__)

class SidebarComponent(ctk.CTkFrame):
    def __init__(self, master, callbacks):
        super().__init__(master, width=200, corner_radius=0)
        logger.info("🎨 [Sidebar] Inicializando navegação lateral...")
        self.callbacks = callbacks
        self._setup_ui()

    def _setup_ui(self):
        self.grid(row=0, column=0, sticky="nsew", padx=0, pady=0)
        self.grid_rowconfigure(7, weight=1)

        self.logo_label = ctk.CTkLabel(self, text="AGENTES PhD", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        self.run_button = ctk.CTkButton(self, text="🚀 Executar Auditoria", command=self.callbacks['run_audit'])
        self.run_button.grid(row=1, column=0, padx=20, pady=10)

        self.report_button = ctk.CTkButton(self, text="📂 Abrir Relatório", fg_color="transparent", border_width=2, command=self.callbacks['open_report'])
        self.report_button.grid(row=2, column=0, padx=20, pady=10)

        self.heal_button = ctk.CTkButton(self, text="🩹 Auto-Cura Total", fg_color="#cf6679", hover_color="#b00020", command=self.callbacks['auto_heal'])
        self.heal_button.grid(row=3, column=0, padx=20, pady=10)

        self.sidebar_button_1 = ctk.CTkButton(self, text="Dashboard", command=self.callbacks['show_dashboard'])
        self.sidebar_button_1.grid(row=4, column=0, padx=20, pady=10)

        self.sidebar_button_findings = ctk.CTkButton(self, text="Prontuário", command=self.callbacks['show_findings'])
        self.sidebar_button_findings.grid(row=5, column=0, padx=20, pady=10)

        self.sidebar_button_chat = ctk.CTkButton(self, text="Brain Chat", command=self.callbacks['show_chat'])
        self.sidebar_button_chat.grid(row=6, column=0, padx=20, pady=10)

        self.status_label = ctk.CTkLabel(self, text="Status: Monitorando", text_color="#00ffcc")
        self.status_label.grid(row=8, column=0, padx=20, pady=20)

    def update_status(self, text, color):
        self.status_label.configure(text=text, text_color=color)

    def set_running_state(self, is_running):
        state = "disabled" if is_running else "normal"
        self.run_button.configure(state=state)

    def set_healing_state(self, is_healing):
        state = "disabled" if is_healing else "normal"
        self.heal_button.configure(state=state)
