import customtkinter as ctk
import tkinter as tk

class FindingsView(ctk.CTkFrame):
    def __init__(self, master, callbacks):
        super().__init__(master, fg_color="transparent")
        self.callbacks = callbacks
        self.finding_widgets = []
        self._setup_ui()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        ctk.CTkLabel(self, text="🏥 PRONTUÁRIO TÉCNICO", font=ctk.CTkFont(size=24, weight="bold")).grid(row=0, column=0, pady=(0, 20))
        
        # Lista de achados (usando scrollable frame)
        self.findings_scroll = ctk.CTkScrollableFrame(self, label_text="Fragilidades Sistêmicas")
        self.findings_scroll.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        
        self.btn_copy_fix = ctk.CTkButton(self, text="📋 Copiar Prompt de Correção", command=self.callbacks['copy_fix'])
        self.btn_copy_fix.grid(row=2, column=0, pady=10)

    def refresh_findings(self, findings):
        for widget in self.finding_widgets:
            widget.destroy()
        self.finding_widgets = []
        
        for i, f in enumerate(findings):
            color = "#cf6679" if f.get('severity') == 'CRITICAL' else "#ffb74d"
            # Variable is needed for radio button group behavior, but we might just want a list visualization.
            # Keeping original logic of RadioButton for now.
            btn = ctk.CTkRadioButton(self.findings_scroll, text=f"[{f.get('severity', 'M')}] {f.get('file')}: {f.get('issue')}", 
                                   text_color=color, value=i, variable=tk.IntVar())
            btn.pack(fill="x", pady=5, padx=5)
            self.finding_widgets.append(btn)
            btn.choice_id = i
