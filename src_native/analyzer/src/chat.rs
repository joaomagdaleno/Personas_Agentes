use std::io::{self, Write};
use crate::brain::Brain;

pub fn start_chat() {
    let mut brain = match Brain::new() {
        Some(b) => b,
        None => {
            eprintln!("❌ Falha ao inicializar o Cérebro Soberano.");
            return;
        }
    };

    println!("======================================");
    println!("   Sovereign AI Chat (Qwen 2.5 0.5B)  ");
    println!("     100% Rust | Zero Dependência      ");
    println!("======================================");
    println!("(Digite 'sair' para encerrar)\n");

    let mut input = String::new();
    loop {
        print!("👤 Usuário: ");
        io::stdout().flush().unwrap();
        input.clear();
        io::stdin().read_line(&mut input).unwrap();
        let prompt = input.trim();

        if prompt == "sair" || prompt == "exit" {
            break;
        }

        if prompt.starts_with("contexto ") {
            let path = &prompt[9..];
            let context = brain.get_context_for(path);
            if context.is_empty() {
                println!("🌐 [Graph]: Sem conexões diretas mapeadas para '{}'.", path);
            } else {
                println!("🌐 [Knowledge Graph Context for {}]:", path);
                for rel in context { println!("  - {}", rel); }
            }
            println!();
            continue;
        }

        if prompt.is_empty() {
            continue;
        }

        print!("🤖 Assistente: ");
        io::stdout().flush().unwrap();

        if let Some(answer) = brain.reason(prompt, 200) {
            println!("{}", answer);
            println!();
        } else {
            println!("❌ Ocorreu um erro ao processar o raciocínio.");
        }
    }
}
