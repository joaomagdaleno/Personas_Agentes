#![allow(dead_code)]
use tree_sitter::{Parser, Node};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PruneRequest {
    pub source: String,
    pub target_functions: Vec<String>, // Functions to KEEP body for. Others will be pruned.
}

#[derive(Serialize)]
pub struct PruneResponse {
    pub pruned_source: String,
    pub savings: f32, // Percentage of characters removed
}

pub fn prune_context(request: PruneRequest) -> PruneResponse {
    let mut parser = Parser::new();
    let language = tree_sitter_typescript::language_typescript();
    parser.set_language(language).expect("Error loading TS grammar");

    let tree = parser.parse(&request.source, None).unwrap();
    let root_node = tree.root_node();

    let mut edits = Vec::new();
    find_prunable_nodes(root_node, &request.target_functions, &mut edits);

    // Apply edits in reverse to keep indices valid
    edits.sort_by(|a, b| b.0.cmp(&a.0));
    
    let mut result = request.source.clone();
    for (start, end) in edits {
        result.replace_range(start..end, "{ /* [Pru] */ }");
    }

    let original_len = request.source.len() as f32;
    let pruned_len = result.len() as f32;
    let savings = if original_len > 0.0 { (original_len - pruned_len) / original_len } else { 0.0 };

    PruneResponse {
        pruned_source: result,
        savings,
    }
}

fn find_prunable_nodes(node: Node, targets: &[String], edits: &mut Vec<(usize, usize)>) {
    let kind = node.kind();
    
    if kind == "method_definition" || kind == "function_declaration" {
        let name_node = node.child_by_field_name("name");
        if let Some(n) = name_node {
            let name = n.utf8_text(b"").unwrap_or("");
            if !targets.contains(&name.to_string()) {
                if let Some(body) = node.child_by_field_name("body") {
                    // Only prune if it's not a tiny body
                    if body.end_byte() - body.start_byte() > 20 {
                        edits.push((body.start_byte(), body.end_byte()));
                    }
                }
            }
        }
    }

    for i in 0..node.child_count() {
        find_prunable_nodes(node.child(i).unwrap(), targets, edits);
    }
}
