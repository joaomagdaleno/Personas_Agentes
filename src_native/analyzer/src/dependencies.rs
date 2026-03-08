use serde::{Serialize, Deserialize};
use tree_sitter::{Node, Parser};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct DependencyInfo {
    pub imports: Vec<String>,
    pub exports: Vec<String>,
}

pub fn extract_dependencies(source: &str, extension: &str) -> DependencyInfo {
    let mut parser = Parser::new();
    let mut deps = DependencyInfo::default();

    let lang = match extension {
        "ts" | "tsx" => Some(tree_sitter_typescript::language_typescript()),
        "js" | "jsx" => Some(tree_sitter_typescript::language_tsx()), // Use TSX for JS/JSX for better compatibility
        "py" => Some(tree_sitter_python::language()),
        "go" => Some(tree_sitter_go::language()),
        _ => None,
    };

    if let Some(language) = lang {
        if parser.set_language(language).is_ok() {
            if let Some(tree) = parser.parse(source, None) {
                match extension {
                    "ts" | "tsx" | "js" | "jsx" => walk_ts(tree.root_node(), source, &mut deps),
                    "py" => walk_py(tree.root_node(), source, &mut deps),
                    "go" => walk_go(tree.root_node(), source, &mut deps),
                    _ => {}
                }
            }
        }
    }

    // Deduplicate and clean
    deps.imports.sort();
    deps.imports.dedup();
    deps.exports.sort();
    deps.exports.dedup();

    deps
}

fn walk_ts(node: Node, source: &str, deps: &mut DependencyInfo) {
    let kind = node.kind();
    let source_bytes = source.as_bytes();

    match kind {
        "import_statement" => {
            // import { x } from "module"
            if let Some(source_node) = node.child_by_field_name("source") {
                let path = source_node.utf8_text(source_bytes).unwrap_or("").trim_matches('"').trim_matches('\'');
                if !path.is_empty() {
                    deps.imports.push(path.to_string());
                }
            }
        }
        "export_statement" => {
            // export { x } ... or export * from "module"
            if let Some(source_node) = node.child_by_field_name("source") {
                let path = source_node.utf8_text(source_bytes).unwrap_or("").trim_matches('"').trim_matches('\'');
                if !path.is_empty() {
                    deps.imports.push(path.to_string()); // re-exports are also imports
                }
            }
            
            // Collect exported names if visible in this node
            // This is complex for "export const x", but usually we care about the fact that it exports
            // For now, let's mark it as an export.
            deps.exports.push(node.utf8_text(source_bytes).unwrap_or("").to_string());
        }
        "call_expression" => {
            let function = node.child_by_field_name("function").map(|n| n.kind()).unwrap_or("");
            if function == "require" || function == "import" {
                if let Some(args) = node.child_by_field_name("arguments") {
                    if let Some(first_arg) = args.named_child(0) {
                        if first_arg.kind() == "string" || first_arg.kind() == "string_fragment" {
                            let path = first_arg.utf8_text(source_bytes).unwrap_or("").trim_matches('"').trim_matches('\'');
                            if !path.is_empty() {
                                deps.imports.push(path.to_string());
                            }
                        }
                    }
                }
            }
        }
        _ => {}
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            walk_ts(cursor.node(), source, deps);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}

fn walk_py(node: Node, source: &str, deps: &mut DependencyInfo) {
    let kind = node.kind();
    let source_bytes = source.as_bytes();

    match kind {
        "import_statement" => {
            // import x, y as z
            // Iterate over children to find dotted_name
            let mut cursor = node.walk();
            if cursor.goto_first_child() {
                loop {
                    if cursor.node().kind() == "dotted_name" {
                        deps.imports.push(cursor.node().utf8_text(source_bytes).unwrap_or("").to_string());
                    } else if cursor.node().kind() == "aliased_import" {
                        if let Some(name) = cursor.node().child_by_field_name("name") {
                             deps.imports.push(name.utf8_text(source_bytes).unwrap_or("").to_string());
                        }
                    }
                    if !cursor.goto_next_sibling() { break; }
                }
            }
        }
        "import_from_statement" => {
            // from x import y
            if let Some(module) = node.child_by_field_name("module_name") {
                deps.imports.push(module.utf8_text(source_bytes).unwrap_or("").to_string());
            } else {
                // Handle relative imports like "from .. import x"
                // The relative part is usually in nodes like "relative_import"
                let text = node.utf8_text(source_bytes).unwrap_or("");
                if let Some(idx) = text.find("import") {
                    let part = text[..idx].replace("from", "").trim().to_string();
                    if !part.is_empty() {
                        deps.imports.push(part);
                    }
                }
            }
        }
        _ => {}
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            walk_py(cursor.node(), source, deps);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}

fn walk_go(node: Node, source: &str, deps: &mut DependencyInfo) {
    let kind = node.kind();
    let source_bytes = source.as_bytes();

    match kind {
        "import_spec" => {
            if let Some(path_node) = node.child_by_field_name("path") {
                let path = path_node.utf8_text(source_bytes).unwrap_or("").trim_matches('"');
                if !path.is_empty() {
                    deps.imports.push(path.to_string());
                }
            }
        }
        _ => {}
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            walk_go(cursor.node(), source, deps);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}
