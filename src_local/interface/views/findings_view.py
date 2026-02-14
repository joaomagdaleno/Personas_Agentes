"""
🔍 View de Achados e Fragilidades.
Lista detalhada de problemas detectados durante a auditoria cirúrgica.
"""
import customtkinter as ctk
import logging

logger = logging.getLogger(__name__)

class FindingsView(ctk.CTkFrame):
    """View especializada em exibição e correção de fragilidades."""
    def __init__(self, master, callbacks=None):
        super().__init__(master, fg_color="transparent")
        logger.info("🔍 [FindingsView] Inicializando central de achados...")
        self.callbacks = callbacks or {}
        self.setup_ui()

    def setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        header = ctk.CTkLabel(self, text="CENTRAL DE ACHADOS", font=ctk.CTkFont(size=24, weight="bold"))
        header.grid(row=0, column=0, pady=(0, 20))

        self.scrollable_frame = ctk.CTkScrollableFrame(self, label_text="Fragilidades Sistêmicas")
        self.scrollable_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        self.scrollable_frame.grid_columnconfigure(0, weight=1)

    def refresh_findings(self, findings):
        """Atualiza a lista de achados na interface."""
        logger.debug(f"🔍 [FindingsView] Atualizando lista com {len(findings)} itens.")
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()

        for i, f in enumerate(findings):
            self._render_finding(f, i)

    def _render_finding(self, f, idx):
        from src_local.interface.controllers.ui_controller import UIController
        color = UIController.get_severity_color(f.get("severity", "INFO"))
        text = UIController.format_finding_text(f)
        
        frame = ctk.CTkFrame(self.scrollable_frame, fg_color="#2b2b2b")
        frame.grid(row=idx, column=0, sticky="ew", padx=5, pady=5)
        
        label = ctk.CTkLabel(frame, text=text, text_color=color, font=ctk.CTkFont(size=12))
        label.pack(side="left", padx=10, pady=10)
