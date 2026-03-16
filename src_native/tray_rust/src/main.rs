#![windows_subsystem = "windows"]

use std::sync::atomic::AtomicI32;
use std::thread;
use tao::event_loop::{ControlFlow, EventLoopBuilder};
use tray_icon::{
    menu::{Menu, MenuItem, PredefinedMenuItem, MenuEvent},
    TrayIconBuilder,
};
use reqwest::blocking::Client;
use rfd::MessageDialog;
use serde::Deserialize;

// --- GLOBAIS ---
static PENDING_ANALYSIS: AtomicI32 = AtomicI32::new(0);

// Struct para desserializar as tarefas da API local
#[derive(Deserialize, Debug)]
struct AiTask {
    task_type: Option<String>,
    target_file: Option<String>,
    status: Option<String>,
}

fn main() {
    let event_loop = EventLoopBuilder::new().build();

    // Cria os itens de menu
    let m_qa_status = MenuItem::new("📊 QA: Calculando...", false, None);
    let m_gen_tests = MenuItem::new("🧪 Iniciar Geração de Testes (Auto-PhD)", true, None);
    let m_test_tasks = MenuItem::new("📋 Ver Tarefas de Testes (Fila)", true, None);
    
    let m_health = MenuItem::new("Vitalidade (Health 360)", true, None);
    let m_audit = MenuItem::new("Forçar Auditoria Global", true, None);
    let m_heal = MenuItem::new("Acionar Auto-Cura (Healer)", true, None);
    
    let m_dash = MenuItem::new("🌐 Abrir Governance Portal", true, None);
    let m_dir = MenuItem::new("📂 Abrir Diretório Fonte", true, None);
    let m_sync_task = MenuItem::new("⏱️ Última Ação Executada", true, None);
    
    let m_quit = MenuItem::new("Sair", true, None);

    // Constrói o menu
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
        &m_quit,
    ]);

    // Cria um ícone RGB em memória de placeholder colorido (magenta) já que não temos .ico fácil lido
    let icon_pixels = vec![255, 0, 255, 255].repeat(32 * 32); 
    let icon = tray_icon::Icon::from_rgba(icon_pixels, 32, 32).unwrap();

    let _tray_icon = TrayIconBuilder::new()
        .with_menu(Box::new(menu))
        .with_tooltip("🏛️ Persona Agent (Rust Edition)")
        .with_icon(icon)
        .build()
        .unwrap();

    let menu_channel = MenuEvent::receiver();

    println!("Tray iniciado com sucesso (Rust).");

    event_loop.run(move |_event, _, control_flow| {
        *control_flow = ControlFlow::WaitUntil(
            std::time::Instant::now() + std::time::Duration::from_millis(50),
        );

        // Processa cliques no menu
        if let Ok(event) = menu_channel.try_recv() {
            let id = event.id;

            if id == m_quit.id() {
                *control_flow = ControlFlow::Exit;
            } else if id == m_dash.id() {
                open_url("http://localhost:5173".to_string());
            } else if id == m_dir.id() {
                let _ = std::process::Command::new("explorer").arg("../..").spawn();
            } else if id == m_sync_task.id() {
                thread::spawn(fetch_last_task);
            } else if id == m_test_tasks.id() {
                thread::spawn(fetch_test_tasks);
            } else if id == m_health.id() {
                thread::spawn(fetch_health);
            } else if id == m_audit.id() {
                thread::spawn(|| {
                    trigger_action("audit", "🚀 Auditoria Acionada", "A varredura foi acionada.");
                });
            } else if id == m_heal.id() {
                thread::spawn(|| {
                    trigger_action("heal", "💉 Auto-Cura Acionada", "A Persona Healer está trabalhando silenciosamente.");
                });
            } else if id == m_gen_tests.id() {
                thread::spawn(|| {
                    MessageDialog::new()
                        .set_title("🧪 Geração Iniciada")
                        .set_description("O Orchestrator começará a gerar os testes para os arquivos pendentes em background.")
                        .set_level(rfd::MessageLevel::Info)
                        .show();
                        
                    let _ = std::process::Command::new("bun")
                        .arg("run")
                        .arg("verify_p12.ts")
                        .current_dir("../../")
                        .spawn();
                });
            }
        }
    });
}

// ==========================================
// FUNÇÕES AUXILIARES DE WORKFLOW & HTTP
// ==========================================

fn open_url(url: String) {
    let _ = std::process::Command::new("rundll32")
        .args(["url.dll,FileProtocolHandler", &url])
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
                    let msg = format!("🌟 Status: {}\n\n🧠 CPU Load: {:.1}%\n💾 RAM Em Uso: {:.1}%\n🧬 GoRoutines Ativas: {:.0}", status, cpu, mem, grts);
                    show_dialog("📊 Sovereign Health 360", &msg, rfd::MessageLevel::Info);
                }
            } else {
                show_dialog("⚠️ Erro", "Falha ao decodificar telemetria.", rfd::MessageLevel::Error);
            }
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
            if let Some(success) = data.get("success").and_then(|v| v.as_bool()) {
                if success {
                    show_dialog(title, desc, rfd::MessageLevel::Info);
                    return;
                }
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
    show_dialog("⏱️ Info", "Nenhuma tarefa recente encontrada ou histórico vazio.", rfd::MessageLevel::Info);
}

fn fetch_test_tasks() {
    let client = Client::new();
    if let Ok(resp) = client.get("http://localhost:8080/intelligence/tasks").send() {
        if let Ok(tasks) = resp.json::<Vec<AiTask>>() {
            let mut list = String::from("Últimas tarefas da fila de Testes e QA:\n\n");
            let mut count = 0;
            
            for t in tasks {
                let r_type = t.task_type.as_deref().unwrap_or("");
                let r_target = t.target_file.as_deref().unwrap_or("");
                let r_status = t.status.as_deref().unwrap_or("");
                
                let lower_type = r_type.to_lowercase();
                if lower_type.contains("test") || lower_type.contains("qa") || r_type.is_empty() {
                    let basename = std::path::Path::new(r_target)
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
