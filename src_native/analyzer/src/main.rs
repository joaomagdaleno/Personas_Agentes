use std::env;
use std::fs;
use tree_sitter::{Parser, Node};
use tree_sitter_typescript;
use serde::Serialize;

#[derive(Serialize)]
struct AnalysisResult {
    path: String,
    complexity: i32,
    cognitive_complexity: i32,
    loc: usize,
    sloc: usize,
    comments: usize,
}

fn walk_ast(node: Node, depth: i32, results: &mut AnalysisResult) {
    let kind = node.kind();
    
    // Simple Cyclomatic Complexity increment
    if ["if_statement", "for_statement", "while_statement", "case_clause"].contains(&kind) {
        results.complexity += 1;
        results.cognitive_complexity += 1 + depth;
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            let mut next_depth = depth;
            if ["if_statement", "for_statement", "while_statement"].contains(&kind) {
                next_depth += 1;
            }
            walk_ast(child, next_depth, results);
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: analyzer <file_path>");
        std::process::exit(1);
    }

    let path = &args[1];
    let source_code = fs::read_to_string(path).expect("Unable to read file");
    
    let loc = source_code.lines().count();
    let mut sloc = 0;
    let mut comments = 0;

    for line in source_code.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") {
            comments += 1;
        } else {
            sloc += 1;
        }
    }

    let mut parser = Parser::new();
    let language = tree_sitter_typescript::language_typescript();
    parser.set_language(language).expect("Error loading TypeScript grammar");

    let tree = parser.parse(&source_code, None).expect("Error parsing file");
    let root_node = tree.root_node();

    let mut result = AnalysisResult {
        path: path.clone(),
        complexity: 1,
        cognitive_complexity: 1,
        loc,
        sloc,
        comments,
    };

    walk_ast(root_node, 0, &mut result);

    println!("{}", serde_json::to_string(&result).unwrap());
}
