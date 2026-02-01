import tkinter as tk
from tkinter import filedialog, ttk, messagebox
import sys
import threading
import logging
from pathlib import Path
from src.utils.logging_config import setup_logging
from src.core.orchestrator import Orchestrator

# Configura o logging
setup_logging()
logger = logging.getLogger(__name__)

class OficinaApp:
    """Interface Gráfica da Oficina de Software Autônoma 🏛️."""
    
    def __init__(self, root):
        """Inicializa a aplicação GUI e os componentes principais."""
        self.root = root
        self.root.title("Oficina de Software Autônoma 🏛️")
        self.root.geometry("1100x800")
        self.root.configure(bg="#121212")

        self.project_root = None
        self.orchestrator = None
        self.current_issues = []
        
        self.setup_styles()
        self.setup_ui()
        logger.info("GUI da Oficina carregada.")

    def setup_styles(self):
        """Configura os estilos visuais (Material Design Dark)."""
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TFrame", background="#121212")
        style.configure("TLabel", background="#121212", foreground="#e0e0e0", font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 18, "bold"), foreground="#bb86fc")
        style.configure("Action.TButton", font=("Segoe UI", 11, "bold"), padding=10)
        style.configure("Healing.TButton", font=("Segoe UI", 11, "bold"), padding=10, background="#cf6679")
        style.configure("TLabelFrame", background="#121212", foreground="#bb86fc", font=("Segoe UI", 10, "bold"))

    def setup_ui(self):
        """Monta a hierarquia de componentes da interface."""
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        header = ttk.Label(main_frame, text="🏛️ DIRETOR: GESTÃO AUTÔNOMA DE QUALIDADE", style="Header.TLabel")
        header.pack(pady=(0, 20))

        # Project Selection
        proj_frame = ttk.LabelFrame(main_frame, text=" 📂 VEÍCULO EM MANUTENÇÃO (REPOSITÓRIO) ", padding="15")
        proj_frame.pack(fill=tk.X, pady=10)

        self.path_var = tk.StringVar(value="Selecione um projeto para iniciar...")
        ttk.Label(proj_frame, textvariable=self.path_var, font=("Segoe UI", 11)).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(proj_frame, text="ABRIR OFICINA", command=self.browse_folder).pack(side=tk.RIGHT, padx=5)

        # Dashboard
        content_frame = ttk.Frame(main_frame)
        content_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Left: Status & Actions
        left_pane = ttk.Frame(content_frame)
        left_pane.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        self.btn_audit = ttk.Button(left_pane, text="🔍 DIAGNÓSTICO TÉCNICO", style="Action.TButton", command=self.start_diagnostic, state=tk.DISABLED)
        self.btn_audit.pack(fill=tk.X, pady=(0, 5))

        # Novo: Campo de Objetivo
        obj_frame = ttk.LabelFrame(left_pane, text=" 🎯 OBJETIVO ESTRATÉGICO ", padding="5")
        obj_frame.pack(fill=tk.X, pady=5)
        self.obj_var = tk.StringVar(value="Ex: Por que o login falha?")
        ttk.Entry(obj_frame, textvariable=self.obj_var).pack(fill=tk.X, padx=2, pady=2)
        
        self.btn_strategic = ttk.Button(left_pane, text="🧠 ANÁLISE DE CAUSA RAIZ", style="Action.TButton", command=self.start_strategic_audit, state=tk.DISABLED)
        self.btn_strategic.pack(fill=tk.X, pady=5)

        self.btn_fix = ttk.Button(left_pane, text="📝 GERAR PLANO DE REPARO", style="Action.TButton", command=self.dispatch_fix, state=tk.DISABLED)
        self.btn_fix.pack(fill=tk.X, pady=5)

        self.btn_copy_prompt = ttk.Button(left_pane, text="📋 COPIAR PROMPT LLM", style="Action.TButton", command=self.copy_selected_issue_prompt, state=tk.DISABLED)
        self.btn_copy_prompt.pack(fill=tk.X, pady=5)

        ttk.Separator(left_pane, orient='horizontal').pack(fill=tk.X, pady=15)

        self.btn_auto_heal = ttk.Button(left_pane, text="🩹 INICIAR AUTO-CURA TOTAL", style="Healing.TButton", command=self.start_auto_healing, state=tk.DISABLED)
        self.btn_auto_heal.pack(fill=tk.X, pady=5)
        
        ttk.Label(left_pane, text="Ciclo: Diagnóstico -> Missão -> Reparo", font=("Segoe UI", 8, "italic")).pack()

        # Right: Issues List
        right_pane = ttk.LabelFrame(content_frame, text=" 🏥 PRONTUÁRIO TÉCNICO (PROBLEMAS DETECTADOS) ", padding="10")
        right_pane.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.issues_tree = ttk.Treeview(right_pane, columns=("Severity", "Persona", "Issue"), show='headings')
        self.issues_tree.heading("Severity", text="GRAVIDADE")
        self.issues_tree.heading("Persona", text="AGENTE")
        self.issues_tree.heading("Issue", text="DESCRIÇÃO DO PROBLEMA")
        self.issues_tree.column("Severity", width=100)
        self.issues_tree.column("Persona", width=120)
        self.issues_tree.column("Issue", width=400)
        self.issues_tree.pack(fill=tk.BOTH, expand=True)

        # Log Output
        log_frame = ttk.LabelFrame(main_frame, text=" ⌨️ TERMINAL DO DIRETOR ", padding="10")
        log_frame.pack(fill=tk.X, side=tk.BOTTOM, pady=10)
        
        self.log_output = tk.Text(log_frame, height=10, bg="#000", fg="#00ff00", font=("Consolas", 10))
        self.log_output.pack(fill=tk.X)

    def browse_folder(self):
        """Abre diálogo para seleção de pasta do projeto."""
        folder = filedialog.askdirectory()
        if folder:
            path = Path(folder)
            self.project_root = path
            self.path_var.set(str(path))
            self.orchestrator = Orchestrator(path)
            
            self.btn_audit.config(state=tk.NORMAL)
            self.btn_strategic.config(state=tk.NORMAL)
            self.btn_auto_heal.config(state=tk.NORMAL)
            self.log_message(f"Oficina pronta. {len(self.orchestrator.personas)} agentes mobilizados.")
            logger.info(f"Projeto carregado: {path}")

    def start_strategic_audit(self):
        """Inicia análise focada em um objetivo de negócio."""
        objective = self.obj_var.get()
        self.issues_tree.delete(*self.issues_tree.get_children())
        self.log_message(f"🎯 Analisando falha funcional: {objective}")
        
        def run():
            try:
                # O Orquestrador precisa do contexto atual para rodar a auditoria estratégica
                from src.utils.context_engine import ContextEngine
                engine = ContextEngine(self.project_root)
                context = engine.analyze_project()
                
                issues = self.orchestrator.run_strategic_audit(context, objective)
                
                def update_ui():
                    for i, issue in enumerate(issues):
                        self.issues_tree.insert("", tk.END, iid=str(i), values=(
                            issue.get('severity', 'STRATEGIC'), 
                            issue.get('context', 'PhD'), 
                            f"[{issue.get('file', 'DNA')}] {issue.get('issue', issue)}"
                        ))
                    self.current_issues = issues
                    self.log_message(f"Análise de causa raiz concluída. {len(issues)} pontos identificados.")
                
                self.root.after(0, update_ui)
            except Exception as e:
                logger.exception("Falha na auditoria estratégica.")
                self.root.after(0, lambda: messagebox.showerror("Erro Estratégico", str(e)))

        threading.Thread(target=run, daemon=True).start()

    def log_message(self, msg):
        """Adiciona mensagem ao terminal interno e ao log do sistema."""
        self.log_output.insert(tk.END, f"> {msg}\n")
        self.log_output.see(tk.END)
        logger.debug(msg)

    def start_diagnostic(self):
        """Inicia o diagnóstico de auditoria em uma thread separada."""
        self.issues_tree.delete(*self.issues_tree.get_children())
        self.log_message("Iniciando diagnóstico profundo...")
        
        def run():
            try:
                # O Orquestrador gera o relatório absoluto
                report_path = self.orchestrator.generate_full_diagnostic()
                
                # Para a interface, mantemos uma versão simplificada da visualização
                # Mas o relatório real está no markdown gerado.
                self.root.after(0, lambda: self.log_message(f"✅ Diagnóstico concluído. Relatório: {report_path.name}"))
                self.root.after(0, lambda: messagebox.showinfo("Sucesso", f"O diagnóstico foi consolidado em:\n{report_path}"))
            except Exception as e:
                logger.exception("Falha durante o diagnóstico.")
                self.root.after(0, lambda: messagebox.showerror("Erro de Diagnóstico", str(e)))

        threading.Thread(target=run, daemon=True).start()

    def copy_selected_issue_prompt(self):
        """Gera um prompt focado no problema selecionado e copia para o clipboard."""
        selected = self.issues_tree.selection()
        if not selected:
            messagebox.showwarning("Aviso", "Selecione um problema na lista primeiro.")
            return
        
        issue_index = int(selected[0])
        issue = self.current_issues[issue_index]
        
        prompt = f"""
### 📋 INSTRUÇÃO TÉCNICA (OFICINA DE SOFTWARE)
Você é um desenvolvedor sênior especialista em {issue.get('context', 'Desenvolvimento')}.
Por favor, corrija o seguinte problema detectado no arquivo: `{issue.get('file')}`

**PROBLEMA:** {issue.get('issue')}
**GRAVIDADE:** {issue.get('severity').upper()}
"""
        if 'line' in issue:
            prompt += f"**LINHA:** {issue.get('line')}\n"
        if 'snippet' in issue:
            prompt += f"**CÓDIGO AFETADO:**\n```\n{issue.get('snippet')}\n```\n"

        prompt += "\n**REQUISITO:** Forneça apenas o código corrigido e uma breve explicação do porquê da mudança."
        
        self.root.clipboard_clear()
        self.root.clipboard_append(prompt)
        self.log_message(f"✅ Prompt para o problema {issue_index + 1} copiado!")
        messagebox.showinfo("Copiado", "O prompt focado foi copiado para o clipboard. Cole no Gemini/ChatGPT.")

    def start_auto_healing(self):
        """Inicia o ciclo completo de auto-cura técnica."""
        self.log_message("⚡ INICIANDO CICLO DE AUTO-CURA PROFUNDA...")
        messagebox.showinfo("Auto-Cura", "Esta funcionalidade executa refatoração automática via Personas. Verifique os backups antes de prosseguir.")
        # Lógica de cura delegada ao orquestrador (em expansão)
        self.log_message("⚠️ Protocolo de Cura em ambiente de validação.")

    def dispatch_fix(self):
        """Gera e salva o relatório de missão na raiz do projeto."""
        try:
            report_path = self.orchestrator.generate_full_diagnostic()
            self.log_message(f"✅ Missão gerada: {report_path.name}")
            messagebox.showinfo("Missão Pronta", f"O plano foi salvo em:\n{report_path}")
        except Exception as e:
            logger.error(f"Erro ao gerar missão: {e}")
            messagebox.showerror("Erro de I/O", str(e))

    def log_message(self, msg):
        """Adiciona mensagem ao terminal interno e ao log do sistema."""
        self.log_output.insert(tk.END, f"> {msg}\n")
        self.log_output.see(tk.END)
        logger.debug(msg)

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app = OficinaApp(root)
        root.mainloop()
    except Exception as e:
        logger.critical(f"Falha ao iniciar aplicação: {e}")