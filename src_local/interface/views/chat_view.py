import customtkinter as ctk

class ChatView(ctk.CTkFrame):
    def __init__(self, master, callbacks):
        super().__init__(master, fg_color="transparent")
        self.callbacks = callbacks
        self._setup_ui()

    def _setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        ctk.CTkLabel(self, text="🧠 BRAIN CHAT (COGNITIVE)", font=ctk.CTkFont(size=24, weight="bold")).grid(row=0, column=0, pady=(0, 20))
        
        self.chat_history = ctk.CTkTextbox(self, font=("Segoe UI", 12))
        self.chat_history.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        self.chat_history.insert("0.0", "Arquiteto, o que deseja analisar hoje?\n\n")
        
        input_frame = ctk.CTkFrame(self, fg_color="transparent")
        input_frame.grid(row=2, column=0, sticky="ew", padx=10, pady=10)
        input_frame.grid_columnconfigure(0, weight=1)
        
        self.chat_input = ctk.CTkEntry(input_frame, placeholder_text="Digite seu objetivo estratégico...")
        self.chat_input.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        self.chat_input.bind("<Return>", lambda e: self._on_send())
        
        ctk.CTkButton(input_frame, text="Enviar", width=100, command=self._on_send).grid(row=0, column=1)

    def _on_send(self):
        query = self.chat_input.get()
        if not query: return
        self.chat_history.insert("end", f"\n👤 Arquiteto: {query}\n")
        self.chat_input.delete(0, "end")
        self.callbacks['send_chat'](query)

    def add_message(self, text):
        self.chat_history.insert("end", text)
        self.chat_history.see("end")
