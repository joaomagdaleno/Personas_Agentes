use serde::{Serialize, Deserialize};
use tree_sitter::{Node, Parser};

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct DependencyInfo {
    pub imports: Vec<String>,
    pub exports: Vec<String>,
    pub defined_symbols: Vec<String>,
    pub calls: Vec<String>,
}
pub fn extract_dependencies_from_node(root_node: Node, source: &str, extension: &str) -> DependencyInfo {
    let mut deps = DependencyInfo::default();

    match extension {
        "ts" | "tsx" | "js" | "jsx" => walk_ts(root_node, source, &mut deps),
        "py" => walk_py(root_node, source, &mut deps),
        "go" => walk_go(root_node, source, &mut deps),
        "rs" => walk_rust(root_node, source, &mut deps),
        _ => {}
    }

    // Deduplicate and clean
    deps.imports.sort();
    deps.imports.dedup();
    deps.exports.sort();
    deps.exports.dedup();
    deps.defined_symbols.sort();
    deps.defined_symbols.dedup();
    deps.calls.sort();
    deps.calls.dedup();

    deps
}

pub fn extract_dependencies(source: &str, extension: &str) -> DependencyInfo {
    let mut parser = Parser::new();
    let mut deps = DependencyInfo::default();

    let lang = match extension {
        "ts" | "tsx" => Some(tree_sitter_typescript::language_typescript()),
        "js" | "jsx" => Some(tree_sitter_typescript::language_tsx()), // Use TSX for JS/JSX for better compatibility
        "py" => Some(tree_sitter_python::language()),
        "go" => Some(tree_sitter_go::language()),
        "rs" => Some(tree_sitter_rust::language()),
        _ => None,
    };

    if let Some(language) = lang {
        if parser.set_language(language).is_ok() {
            if let Some(tree) = parser.parse(source, None) {
                match extension {
                    "ts" | "tsx" | "js" | "jsx" => walk_ts(tree.root_node(), source, &mut deps),
                    "py" => walk_py(tree.root_node(), source, &mut deps),
                    "go" => walk_go(tree.root_node(), source, &mut deps),
                    "rs" => walk_rust(tree.root_node(), source, &mut deps),
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
    deps.defined_symbols.sort();
    deps.defined_symbols.dedup();
    deps.calls.sort();
    deps.calls.dedup();

    deps
}

fn walk_ts(node: Node, source: &str, deps: &mut DependencyInfo) {
    let kind = node.kind();
    let source_bytes = source.as_bytes();

    match kind {
        "import_statement" => {
            if let Some(source_node) = node.child_by_field_name("source") {
                let path = source_node.utf8_text(source_bytes).unwrap_or("").trim_matches('"').trim_matches('\'');
                if !path.is_empty() {
                    deps.imports.push(path.to_string());
                }
            }
        }
        "export_statement" => {
            if let Some(source_node) = node.child_by_field_name("source") {
                let path = source_node.utf8_text(source_bytes).unwrap_or("").trim_matches('"').trim_matches('\'');
                if !path.is_empty() {
                    deps.imports.push(path.to_string());
                }
            }
            deps.exports.push(node.utf8_text(source_bytes).unwrap_or("").to_string());
        }
        "function_declaration" | "class_declaration" | "method_definition" | "interface_declaration" | "enum_declaration" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = name_node.utf8_text(source_bytes).unwrap_or("");
                if !name.is_empty() {
                    deps.defined_symbols.push(name.to_string());
                }
            }
        }
        "call_expression" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                let func_text = func_node.utf8_text(source_bytes).unwrap_or("");
                let call_name = func_text.split('.').last().unwrap_or("").to_string();
                if !call_name.is_empty() {
                    deps.calls.push(call_name);
                }
                
                let function = func_node.kind();
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
            if let Some(module) = node.child_by_field_name("module_name") {
                deps.imports.push(module.utf8_text(source_bytes).unwrap_or("").to_string());
            } else {
                let text = node.utf8_text(source_bytes).unwrap_or("");
                if let Some(idx) = text.find("import") {
                    let part = text[..idx].replace("from", "").trim().to_string();
                    if !part.is_empty() {
                        deps.imports.push(part);
                    }
                }
            }
        }
        "function_definition" | "class_definition" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = name_node.utf8_text(source_bytes).unwrap_or("");
                if !name.is_empty() {
                    deps.defined_symbols.push(name.to_string());
                }
            }
        }
        "call" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                let func_text = func_node.utf8_text(source_bytes).unwrap_or("");
                let call_name = func_text.split('.').last().unwrap_or("").to_string();
                if !call_name.is_empty() {
                    deps.calls.push(call_name);
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
        "function_declaration" | "method_declaration" | "type_declaration" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = name_node.utf8_text(source_bytes).unwrap_or("");
                if !name.is_empty() {
                    deps.defined_symbols.push(name.to_string());
                }
            }
        }
        "call_expression" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                let func_text = func_node.utf8_text(source_bytes).unwrap_or("");
                let call_name = func_text.split('.').last().unwrap_or("").to_string();
                if !call_name.is_empty() {
                    deps.calls.push(call_name);
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

fn walk_rust(node: Node, source: &str, deps: &mut DependencyInfo) {
    let kind = node.kind();
    let source_bytes = source.as_bytes();

    match kind {
        "use_declaration" => {
            // Navigate AST children to extract the path
            let mut cursor = node.walk();
            if cursor.goto_first_child() {
                loop {
                    let child = cursor.node();
                    let ck = child.kind();
                    if ck == "scoped_identifier" || ck == "identifier" || ck == "use_wildcard" || ck == "scoped_use_list" {
                        let text = child.utf8_text(source_bytes).unwrap_or("");
                        let main_mod = text.split("::").next().unwrap_or("").to_string();
                        if !main_mod.is_empty() {
                            deps.imports.push(main_mod);
                        }
                        break;
                    }
                    if !cursor.goto_next_sibling() { break; }
                }
            }
        }
        "function_item" | "struct_item" | "enum_item" | "trait_item" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = name_node.utf8_text(source_bytes).unwrap_or("");
                if !name.is_empty() {
                    deps.defined_symbols.push(name.to_string());
                }
            }
        }
        "call_expression" => {
            if let Some(func_node) = node.child_by_field_name("function") {
                let func_text = func_node.utf8_text(source_bytes).unwrap_or("");
                let call_name = func_text.split("::").last().unwrap_or("").to_string();
                let call_name = call_name.split('.').last().unwrap_or("").to_string();
                if !call_name.is_empty() {
                    deps.calls.push(call_name);
                }
            }
        }
        _ => {}
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            walk_rust(cursor.node(), source, deps);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}
