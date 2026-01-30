import tkinter as tk
from tkinter import filedialog, ttk, messagebox
import os
import sys
import threading
import importlib.util
from orchestrator import ProjectOrchestrator

class OficinaApp:
    """Especialista técnico do ecossistema Personas Agentes."""
    def __init__(self, root):
        """Executa funcionalidade da persona."""
        self.root = root
        self.root.title("Oficina de Software Autônoma 🏛️")
        self.root.geometry("1100x800")
        self.root.configure(bg="#121212")

        self.project_root = None
        self.orchestrator = None
        self.setup_styles()
        self.setup_ui()

    def setup_styles(self):
        """Executa funcionalidade da persona."""
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TFrame", background="#121212")
        style.configure("TLabel", background="#121212", foreground="#e0e0e0", font=("Segoe UI", 10))
        style.configure("Header.TLabel", font=("Segoe UI", 16, "bold"), foreground="#bb86fc")
        style.configure("Action.TButton", font=("Segoe UI", 11, "bold"), padding=10, background="#03dac6", foreground="#000")
        style.configure("Healing.TButton", font=("Segoe UI", 11, "bold"), padding=10, background="#cf6679", foreground="#000")
        style.configure("TLabelFrame", background="#121212", foreground="#bb86fc", font=("Segoe UI", 10, "bold"))

    def setup_ui(self):
        """Executa funcionalidade da persona."""
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header
        header = ttk.Label(main_frame, text="🏛️ DIRETOR: GESTÃO AUTÔNOMA DE QUALIDADE", style="Header.TLabel")
        header.pack(pady=(0, 20))

        # Project Selection
        proj_frame = ttk.LabelFrame(main_frame, text=" VEÍCULO EM MANUTENÇÃO (REPOSITÓRIO) ", padding="15")
        proj_frame.pack(fill=tk.X, pady=10)

        self.path_var = tk.StringVar(value="Selecione um projeto para iniciar a auditoria...")
        ttk.Label(proj_frame, textvariable=self.path_var, font=("Segoe UI", 11)).pack(side=tk.LEFT, padx=5, fill=tk.X, expand=True)
        
        ttk.Button(proj_frame, text="ABRIR OFICINA", command=self.browse_folder).pack(side=tk.RIGHT, padx=5)

        # Dashboard
        content_frame = ttk.Frame(main_frame)
        content_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        # Left: Status & Actions
        left_pane = ttk.Frame(content_frame)
        left_pane.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        self.btn_audit = ttk.Button(left_pane, text="🔍 INICIAR DIAGNÓSTICO", style="Action.TButton", command=self.start_diagnostic, state=tk.DISABLED)
        self.btn_audit.pack(fill=tk.X, pady=(0, 5))

        self.btn_fix = ttk.Button(left_pane, text="📝 GERAR PLANO DE REPARO", style="Action.TButton", command=self.dispatch_fix, state=tk.DISABLED)
        self.btn_fix.pack(fill=tk.X, pady=5)

        ttk.Separator(left_pane, orient='horizontal').pack(fill=tk.X, pady=15)

        self.btn_auto_heal = ttk.Button(left_pane, text="🩹 INICIAR AUTO-CURA TOTAL", style="Healing.TButton", command=self.start_auto_healing, state=tk.DISABLED)
        self.btn_auto_heal.pack(fill=tk.X, pady=5)
        ttk.Label(left_pane, text="Ciclo completo: Diagnóstico -> Missão -> Reparo", font=("Segoe UI", 8, "italic")).pack()

        # Right: Issues List
        right_pane = ttk.LabelFrame(content_frame, text=" PRONTUÁRIO TÉCNICO (PROBLEMAS DETECTADOS) ", padding="10")
        right_pane.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        self.issues_tree = ttk.Treeview(right_pane, columns=("Severity", "Persona", "Issue"), show='headings')
        self.issues_tree.heading("Severity", text="GRAVIDADE")
        self.issues_tree.heading("Persona", text="ESPECIALISTA")
        self.issues_tree.heading("Issue", text="PROBLEMA DETECTADO")
        self.issues_tree.column("Severity", width=100)
        self.issues_tree.column("Persona", width=120)
        self.issues_tree.column("Issue", width=400)
        self.issues_tree.pack(fill=tk.BOTH, expand=True)

        # Log Output
        log_frame = ttk.LabelFrame(main_frame, text=" TERMINAL DO DIRETOR ", padding="10")
        log_frame.pack(fill=tk.X, side=tk.BOTTOM, pady=10)
        
        self.log_output = tk.Text(log_frame, height=10, bg="#000", fg="#00ff00", font=("Consolas", 10))
        self.log_output.pack(fill=tk.X)

    def browse_folder(self):
        """Executa funcionalidade da persona."""
        folder = filedialog.askdirectory()
        if folder:
            self.project_root = folder
            self.path_var.set(folder)
            self.orchestrator = ProjectOrchestrator(folder)
            self.load_active_personas()
            self.btn_audit.config(state=tk.NORMAL)
            self.btn_auto_heal.config(state=tk.NORMAL)
            self.log_message(f"Oficina pronta em {folder}. {len(self.orchestrator.personas)} especialistas ativos.")

    def log_message(self, msg):
        """Executa funcionalidade da persona."""
        self.log_output.insert(tk.END, f"> {msg}\n")
        self.log_output.see(tk.END)

    def load_active_personas(self):
        """Carrega dinamicamente as personas Python para o orquestrador."""
        base_path = os.path.dirname(os.path.abspath(__file__))
        
        if os.path.exists(os.path.join(self.project_root, 'pubspec.yaml')):
            stack = "Flutter"
        elif os.path.exists(os.path.join(self.project_root, 'build.gradle')) or os.path.exists(os.path.join(self.project_root, 'build.gradle.kts')):
            stack = "Kotlin"
        else:
            has_py = any(f.endswith('.py') for f in os.listdir(self.project_root))
            if has_py or os.path.exists(os.path.join(self.project_root, 'main_gui.py')):
                stack = "Python"
            else:
                stack = "Unknown"

        self.log_message(f"Ambiente identificado: {stack.upper()}")
        
        if stack == "Unknown":
            return

        stack_path = os.path.join(base_path, stack)
        if os.path.exists(stack_path):
            for filename in os.listdir(stack_path):
                if filename.endswith(".py") and "__init__" not in filename:
                    f_path = os.path.join(stack_path, filename)
                    persona = self.import_persona(f_path)
                    if persona:
                        self.orchestrator.add_persona(persona)

    def import_persona(self, file_path):
        """Executa funcionalidade da persona."""
        module_name = os.path.basename(file_path).replace(".py", "")
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        for attr in dir(module):
            if attr.endswith("Persona") and attr != "BaseActivePersona":
                return getattr(module, attr)(self.project_root)
        return None

    def start_diagnostic(self):
        """Executa funcionalidade da persona."""
        self.issues_tree.delete(*self.issues_tree.get_children())
        self.log_message("Iniciando varredura profunda...")
        
        def run():
            """Executa funcionalidade da persona."""
            issues = self.orchestrator.run_full_diagnostic()
            for issue in issues:
                self.issues_tree.insert("", tk.END, values=(issue['severity'].upper(), "Auditoria", issue['issue']))
            
            self.root.after(0, lambda: self.btn_fix.config(state=tk.NORMAL if issues else tk.DISABLED))
            self.root.after(0, lambda: self.log_message(f"Diagnóstico concluído. {len(issues)} problemas detectados."))

        threading.Thread(target=run).start()

    def start_auto_healing(self):
        """Executa funcionalidade da persona."""
        self.issues_tree.delete(*self.issues_tree.get_children())
        self.log_message("⚡ INICIANDO CICLO DE AUTO-CURA TOTAL...")
        
        def run_cycle():
            """Executa funcionalidade da persona."""
            self.log_message("Passo 1/3: Realizando diagnóstico...")
            issues = self.orchestrator.run_full_diagnostic()
            
            if not issues:
                self.log_message("✅ Projeto saudável. Auto-cura não necessária.")
                return

            for issue in issues:
                self.issues_tree.insert("", tk.END, values=(issue['severity'].upper(), "Auto-Cura", issue['issue']))

            self.log_message(f"Passo 2/3: Gerando plano de reparo para {len(issues)} ocorrências...")
            mission = self.orchestrator.prepare_mission_package()

            self.log_message("Passo 3/3: Despachando Gemini CLI para reparo...")
            self.root.after(0, lambda: self.dispatch_fix(mission))

        threading.Thread(target=run_cycle).start()

    def dispatch_fix(self, mission=None):
        """Gera o arquivo de missão para reparo manual ou via CLI."""
        if not mission:
            mission = self.orchestrator.prepare_mission_package()
        
        if not mission:
            messagebox.showwarning("Aviso", "Nenhuma missão para gerar.")
            return

        # Caminho na raiz do projeto
        mission_file = os.path.join(self.project_root, 'auto_healing_mission.md')
        
        try:
            with open(mission_file, 'w', encoding='utf-8') as f:
                f.write(mission)
            
            self.log_message(f"✅ Missão gerada com sucesso: {mission_file}")
            messagebox.showinfo("Sucesso", f"O plano de reparo foi salvo em:\n{mission_file}\n\nVocê pode agora copiar o conteúdo deste arquivo e colar para o Gemini.")
        except Exception as e:
            messagebox.showerror("Erro ao salvar missão", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = OficinaApp(root)
    root.mainloop()