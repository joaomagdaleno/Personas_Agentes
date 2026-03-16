#![windows_subsystem = "windows"]

use std::sync::atomic::{AtomicI32, Ordering};
use std::thread;
use std::path::Path;
use std::time::{Duration, Instant};

use tao::event_loop::{ControlFlow, EventLoopBuilder};
use tray_icon::{
    menu::{Menu, MenuItem, PredefinedMenuItem, MenuEvent},
    TrayIconBuilder,
};
use reqwest::blocking::Client;
use rfd::MessageDialog;
use serde::Deserialize;
use notify::{RecommendedWatcher, RecursiveMode, Watcher, Config as NotifyConfig};

// ==========================================
// GLOBAIS
// ==========================================
static PENDING_ANALYSIS: AtomicI32 = AtomicI32::new(0);

#[derive(Deserialize, Debug)]
struct AiTask {
    task_type: Option<String>,
    target_file: Option<String>,
    status: Option<String>,
}

// ==========================================
// WINAPI: Idle Time & Active Window (Windows)
// ==========================================
#[cfg(target_os = "windows")]
mod winapi_helpers {
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId,
    };
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
    use windows::Win32::System::ProcessStatus::GetModuleBaseNameW;
    use windows::Win32::Foundation::CloseHandle;

    /// Returns system idle time in seconds.
    pub fn get_idle_time() -> f64 {
        unsafe {
            let mut lii = LASTINPUTINFO {
                cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
                dwTime: 0,
            };
            let result = GetLastInputInfo(&mut lii);
            if result.as_bool() {
                let tick_count = windows::Win32::System::SystemInformation::GetTickCount();
                return (tick_count - lii.dwTime) as f64 / 1000.0;
            }
        }
        0.0
    }

    /// Returns (process_name, window_title) of the foreground window.
    pub fn get_active_window_info() -> (String, String) {
        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd.0 == 0 {
                return ("Unknown".into(), "Unknown".into());
            }

            // Window title
            let mut buf = [0u16; 256];
            let len = GetWindowTextW(hwnd, &mut buf);
            let title = String::from_utf16_lossy(&buf[..len as usize]);

            // PID
            let mut pid: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));

            // Process name from PID
            let proc_name = if pid > 0 {
                if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
                    let mut name_buf = [0u16; 256];
                    let name_len = GetModuleBaseNameW(handle, None, &mut name_buf);
                    let _ = CloseHandle(handle);
                    if name_len > 0 {
                        String::from_utf16_lossy(&name_buf[..name_len as usize])
                    } else {
                        format!("PID:{}", pid)
                    }
                } else {
                    format!("PID:{}", pid)
                }
            } else {
                "Unknown".into()
            };

            (proc_name, title)
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod winapi_helpers {
    pub fn get_idle_time() -> f64 { 0.0 }
    pub fn get_active_window_info() -> (String, String) { ("N/A".into(), "N/A".into()) }
}

// ==========================================
// FILE WATCHER
// ==========================================
fn start_file_watcher(project_root: String) {
    thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = match RecommendedWatcher::new(tx, NotifyConfig::default()) {
            Ok(w) => w,
            Err(e) => { eprintln!("Erro ao criar file watcher: {}", e); return; }
        };

        let src_path = Path::new(&project_root).join("src_local");
        if src_path.exists() {
            if let Err(e) = watcher.watch(&src_path, RecursiveMode::Recursive) {
                eprintln!("Erro ao monitorar src_local: {}", e);
            }
        }

        println!("👁️ File watcher ativo em: {}", src_path.display());

        for event in rx {
            if let Ok(event) = event {
                for path in &event.paths {
                    if let Some(ext) = path.extension() {
                        let ext_str = ext.to_string_lossy();
                        if ext_str == "ts" || ext_str == "py" || ext_str == "go" || ext_str == "rs" {
                            PENDING_ANALYSIS.store(1, Ordering::Relaxed);
                        }
                    }
                }
            }
        }
    });
}

// ==========================================
// ACTIVITY MONITOR (Background Loop)
// ==========================================
fn start_activity_monitor() {
    thread::spawn(|| {
        loop {
            let idle = winapi_helpers::get_idle_time();
            let (app_name, title) = winapi_helpers::get_active_window_info();
            let category = classify_activity(&app_name, &title);

            if idle > 300.0 {
                println!("🌙 [Idle] Sistema ocioso há {:.0}s. Modo Deep.", idle);
                if PENDING_ANALYSIS.load(Ordering::Relaxed) == 1 {
                    println!("🚀 Acionando diagnóstico de fundo inteligente via Hub...");
                    thread::spawn(|| {
                        let client = Client::new();
                        if let Ok(_) = client.get("http://localhost:8080/scan?dir=./src_local").send() {
                            println!("✅ Diagnóstico Hub assíncrono concluído silenciosamente.");
                            PENDING_ANALYSIS.store(0, Ordering::Relaxed);
                        }
                    });
                }
            } else {
                println!("👀 [Active] {} ({}) - Contexto: {}", app_name, title, category);
            }

            thread::sleep(Duration::from_secs(10));
        }
    });
}

fn classify_activity(app: &str, title: &str) -> &'static str {
    let app_l = app.to_lowercase();
    let title_l = title.to_lowercase();

    let dev_apps = ["code", "powershell", "cmd", "wt", "pycharm", "cursor", "gh"];
    for a in &dev_apps {
        if app_l.contains(a) { return "DEV"; }
    }

    let browsers = ["chrome", "msedge", "firefox", "brave"];
    for b in &browsers {
        if app_l.contains(b) {
            if title_l.contains("youtube") || title_l.contains("netflix") { return "MEDIA"; }
            return "BROWSING";
        }
    }

    let games = ["steam", "valorant", "cs2", "minecraft"];
    for g in &games {
        if app_l.contains(g) { return "GAMING"; }
    }

    "GENERAL"
}

// ==========================================
// QA TEST COUNTER (Background Loop)
// ==========================================
fn start_qa_counter(qa_id: tray_icon::menu::MenuId, project_root: String) {
    thread::spawn(move || {
        loop {
            let src_dir = Path::new(&project_root).join("src_local");
            let (tested, untested) = count_test_coverage(&src_dir);
            let _title = format!("📊 QA: {} testados / {} sem teste", tested, untested);
            // Note: MenuItem is not Send+Sync, so we log the QA status to stdout.
            // The menu item text is set from the event loop if needed.
            println!("📊 [QA Counter] {} testados / {} sem teste", tested, untested);
            thread::sleep(Duration::from_secs(30));
        }
    });
}

fn count_test_coverage(dir: &Path) -> (usize, usize) {
    let mut tested = 0usize;
    let mut untested = 0usize;

    fn walk(dir: &Path, tested: &mut usize, untested: &mut usize) {
        let entries = match std::fs::read_dir(dir) {
            Ok(e) => e,
            Err(_) => return,
        };
        for entry in entries.flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if name == "node_modules" || name.starts_with('.') || name == "target" || name == "build" {
                    continue;
                }
                walk(&path, tested, untested);
            } else if name.ends_with(".ts") && !name.ends_with(".test.ts") {
                let test_path = path.with_extension("").with_extension("test.ts");
                if test_path.exists() {
                    *tested += 1;
                } else {
                    *untested += 1;
                }
            }
        }
    }

    walk(dir, &mut tested, &mut untested);
    (tested, untested)
}

// ==========================================
// SQLITE PROJECT MANAGER
// ==========================================
fn get_projects_string(db_path: &str) -> String {
    match rusqlite::Connection::open(db_path) {
        Ok(conn) => {
            let mut stmt = match conn.prepare("SELECT name, health_score FROM projects") {
                Ok(s) => s,
                Err(_) => return "Nenhum projeto encontrado ou erro na query.".into(),
            };
            let mut result = String::from("Projetos Ativos:\n\n");
            let rows = stmt.query_map([], |row| {
                let name: String = row.get(0)?;
                let score: f64 = row.get(1)?;
                Ok(format!("📂 {} - Saúde: {:.0}%\n", name, score))
            });
            if let Ok(rows) = rows {
                for row in rows.flatten() {
                    result.push_str(&row);
                }
            }
            result
        }
        Err(e) => format!("Erro ao abrir banco de dados: {}", e),
    }
}

// ==========================================
// MAIN
// ==========================================
fn main() {
    let cwd = std::env::current_dir().unwrap_or_default();
    let project_root = cwd.join("..").join("..");
    let project_root_str = project_root.to_string_lossy().to_string();
    let db_path = project_root.join("system_vault.db").to_string_lossy().to_string();

    // Start background services
    start_file_watcher(project_root_str.clone());
    start_activity_monitor();

    let event_loop = EventLoopBuilder::new().build();

    // Menu items
    let m_qa_status = MenuItem::new("📊 QA: Calculando...", false, None);
    let m_gen_tests = MenuItem::new("🧪 Iniciar Geração de Testes (Auto-PhD)", true, None);
    let m_test_tasks = MenuItem::new("📋 Ver Tarefas de Testes (Fila)", true, None);

    let m_health = MenuItem::new("Vitalidade (Health 360)", true, None);
    let m_audit = MenuItem::new("Forçar Auditoria Global", true, None);
    let m_heal = MenuItem::new("Acionar Auto-Cura (Healer)", true, None);

    let m_dash = MenuItem::new("🌐 Abrir Governance Portal", true, None);
    let m_dir = MenuItem::new("📂 Abrir Diretório Fonte", true, None);
    let m_sync_task = MenuItem::new("⏱️ Última Ação Executada", true, None);

    let m_projects = MenuItem::new("Gerir Projetos", true, None);
    let m_quit = MenuItem::new("Sair", true, None);

    let menu = Menu::new();
    let _ = menu.append_items(&[
        &m_qa_status,
        &m_gen_tests,
        &m_test_tasks,
        &PredefinedMenuItem::separator(),
        &m_health,
        &m_audit,
        &m_heal,
        &PredefinedMenuItem::separator(),
        &m_dash,
        &m_dir,
        &m_sync_task,
        &PredefinedMenuItem::separator(),
        &m_projects,
        &PredefinedMenuItem::separator(),
        &m_quit,
    ]);

    // Icon (magenta placeholder 32x32)
    let icon_pixels = vec![255, 0, 255, 255].repeat(32 * 32);
    let icon = tray_icon::Icon::from_rgba(icon_pixels, 32, 32).unwrap();

    let _tray_icon = TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_tooltip("🏛️ Persona Agent (Sovereign Rust)")
        .with_icon(icon)
        .build()
        .unwrap();

    let menu_channel = MenuEvent::receiver();

    println!("🏛️ Tray iniciado com sucesso (Rust Unificado).");

    // Start QA counter (logs to stdout since MenuItem is not thread-safe)
    start_qa_counter(m_qa_status.id().clone(), project_root_str.clone());

    let db_path_clone = db_path.clone();
    let project_root_for_loop = project_root_str.clone();

    event_loop.run(move |_event, _, control_flow| {
        *control_flow = ControlFlow::WaitUntil(
            Instant::now() + Duration::from_millis(50),
        );

        if let Ok(event) = menu_channel.try_recv() {
            let id = event.id;

            if id == m_quit.id() {
                *control_flow = ControlFlow::Exit;
            } else if id == m_dash.id() {
                open_url("http://localhost:5173");
            } else if id == m_dir.id() {
                let _ = std::process::Command::new("explorer").arg(&project_root_for_loop).spawn();
            } else if id == m_sync_task.id() {
                thread::spawn(fetch_last_task);
            } else if id == m_test_tasks.id() {
                thread::spawn(fetch_test_tasks);
            } else if id == m_health.id() {
                thread::spawn(fetch_health);
            } else if id == m_audit.id() {
                thread::spawn(|| {
                    trigger_action("audit", "🚀 Auditoria Acionada", "A varredura foi acionada em background.");
                });
            } else if id == m_heal.id() {
                thread::spawn(|| {
                    trigger_action("heal", "💉 Auto-Cura Acionada", "A Persona Healer está trabalhando silenciosamente.");
                });
            } else if id == m_gen_tests.id() {
                let root = project_root_for_loop.clone();
                thread::spawn(move || {
                    show_dialog("🧪 Geração Iniciada", "O Orchestrator começará a gerar os testes em background.", rfd::MessageLevel::Info);
                    let _ = std::process::Command::new("bun")
                        .arg("run")
                        .arg("verify_p12.ts")
                        .current_dir(&root)
                        .spawn();
                });
            } else if id == m_projects.id() {
                let db = db_path_clone.clone();
                thread::spawn(move || {
                    let projects = get_projects_string(&db);
                    show_dialog("🏛️ Gestor de Projetos", &projects, rfd::MessageLevel::Info);
                });
            }
        }
    });
}

// ==========================================
// FUNÇÕES AUXILIARES DE WORKFLOW & HTTP
// ==========================================

fn open_url(url: &str) {
    let _ = std::process::Command::new("rundll32")
        .args(["url.dll,FileProtocolHandler", url])
        .spawn();
}

fn fetch_health() {
    let client = Client::new();
    match client.get("http://localhost:8080/health").send() {
        Ok(resp) => {
            if let Ok(data) = resp.json::<serde_json::Value>() {
                if let (Some(cpu), Some(mem), Some(grts), Some(status)) = (
                    data.get("cpu").and_then(|v| v.as_f64()),
                    data.get("memory").and_then(|v| v.as_f64()),
                    data.get("goroutines").and_then(|v| v.as_f64()),
                    data.get("status").and_then(|v| v.as_str()),
                ) {
                    let msg = format!("🌟 Status: {}\n\n🧠 CPU Load: {:.1}%\n💾 RAM Em Uso: {:.1}%\n🧬 Threads Ativas: {:.0}", status, cpu, mem, grts);
                    show_dialog("📊 Sovereign Health 360", &msg, rfd::MessageLevel::Info);
                    return;
                }
            }
            show_dialog("⚠️ Erro", "Falha ao decodificar telemetria.", rfd::MessageLevel::Error);
        }
        Err(_) => {
            show_dialog("❌ Erro de Conexão", "O Hub local não está respondendo.", rfd::MessageLevel::Error);
        }
    }
}

fn trigger_action(endpoint: &str, title: &str, desc: &str) {
    let client = Client::new();
    let url = format!("http://localhost:8080/{}", endpoint);
    if let Ok(resp) = client.get(&url).send() {
        if let Ok(data) = resp.json::<serde_json::Value>() {
            if let Some(true) = data.get("success").and_then(|v| v.as_bool()) {
                show_dialog(title, desc, rfd::MessageLevel::Info);
                return;
            }
        }
    }
    show_dialog("❌ Erro", "Ocorreu um erro ao disparar a ação ou Hub offline.", rfd::MessageLevel::Error);
}

fn fetch_last_task() {
    let client = Client::new();
    if let Ok(resp) = client.get("http://localhost:8080/intelligence/tasks").send() {
        if let Ok(tasks) = resp.json::<Vec<AiTask>>() {
            if let Some(t) = tasks.first() {
                let r_type = t.task_type.as_deref().unwrap_or("Desconhecido");
                let r_target = t.target_file.as_deref().unwrap_or("N/A");
                let r_status = t.status.as_deref().unwrap_or("N/A");
                let msg = format!("Tarefa: {}\nAlvo: {}\nStatus: {}", r_type, r_target, r_status);
                show_dialog("⏱️ Última Ação da IA", &msg, rfd::MessageLevel::Info);
                return;
            }
        }
    }
    show_dialog("⏱️ Info", "Nenhuma tarefa recente encontrada.", rfd::MessageLevel::Info);
}

fn fetch_test_tasks() {
    let client = Client::new();
    if let Ok(resp) = client.get("http://localhost:8080/intelligence/tasks").send() {
        if let Ok(tasks) = resp.json::<Vec<AiTask>>() {
            let mut list = String::from("Últimas tarefas da fila de Testes e QA:\n\n");
            let mut count = 0;

            for t in &tasks {
                let r_type = t.task_type.as_deref().unwrap_or("");
                let r_target = t.target_file.as_deref().unwrap_or("");
                let r_status = t.status.as_deref().unwrap_or("");

                let lower_type = r_type.to_lowercase();
                if lower_type.contains("test") || lower_type.contains("qa") || r_type.is_empty() {
                    let basename = Path::new(r_target)
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or(r_target);
                    list.push_str(&format!("- [{}] {} ({})\n", r_status, basename, r_type));
                    count += 1;
                    if count >= 10 { break; }
                }
            }

            if count > 0 {
                show_dialog("📋 Histórico de Tarefas QA", &list, rfd::MessageLevel::Info);
                return;
            }
        }
    }
    show_dialog("⚠️ Erro", "Falha ao ler o histórico das tarefas QA.", rfd::MessageLevel::Error);
}

fn show_dialog(title: &str, desc: &str, level: rfd::MessageLevel) {
    MessageDialog::new()
        .set_title(title)
        .set_description(desc)
        .set_level(level)
        .show();
}
