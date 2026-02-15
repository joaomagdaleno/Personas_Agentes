"""
🧠 View de Chat Cognitivo.
Interface de interação direta com o Cérebro Local (SLM).
"""
import customtkinter as ctk
import logging

logger = logging.getLogger(__name__)

class ChatView(ctk.CTkFrame):
    """View soberana para raciocínio e RAG (Retrieval-Augmented Generation)."""
    def __init__(self, master, callbacks=None):
        super().__init__(master, fg_color="transparent")
        logger.info("🧠 [ChatView] Inicializando interface cognitiva...")
        self.callbacks = callbacks or {}
        self.setup_ui()

    def setup_ui(self):
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.chat_history = ctk.CTkTextbox(self, font=("Consolas", 12))
        self.chat_history.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        self.chat_history.insert("0.0", "🤖 Sistema: Cérebro Online. Como posso ajudar?\n\n")
        self.chat_history.configure(state="disabled")

        input_frame = ctk.CTkFrame(self, fg_color="transparent")
        input_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=10)
        input_frame.grid_columnconfigure(0, weight=1)

        self.input_entry = ctk.CTkEntry(input_frame, placeholder_text="Pergunte algo sobre o projeto...")
        self.input_entry.grid(row=0, column=0, sticky="ew", padx=(0, 10))
        self.input_entry.bind("<Return>", lambda e: self._on_send())

        send_btn = ctk.CTkButton(input_frame, text="Pensar", width=100, command=self._on_send)
        send_btn.grid(row=0, column=1)

    def _on_send(self):
        query = self.input_entry.get()
        if not query: return
        
        logger.debug(f"🧠 [Chat] Usuário: {query}")
        self.add_message(f"👤 Você: {query}\n")
        self.input_entry.delete(0, "end")
        
        if 'send_chat' in self.callbacks:
            self.callbacks['send_chat'](query)

    def add_message(self, msg):
        self.chat_history.configure(state="normal")
        self.chat_history.insert("end", msg)
        self.chat_history.configure(state="disabled")
        self.chat_history.see("end")
