use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tree_sitter::{Node, Parser};
use rayon::prelude::*;
use walkdir::WalkDir;

// ─── Output Structures ──────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AtomicFingerprint {
    pub name: String,
    pub emoji: String,
    pub role: String,
    pub stack: String,
    pub rules_count: usize,
    pub rule_issues: Vec<String>,
    pub rule_severities: Vec<String>,
    pub file_extensions: Vec<String>,
    pub has_reasoning: bool,
    pub system_prompt: String,
    pub methods: Vec<String>,
    pub extra_methods: Vec<String>,
    pub dynamic_findings_count: usize,
    // Halstead Metrics
    pub halstead_volume: f64,
    pub halstead_difficulty: f64,
    pub halstead_effort: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgentEntry {
    pub agent: String,
    pub stack: String,
    pub category: String,
    pub path: String,
    pub fingerprint: AtomicFingerprint,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FingerprintReport {
    pub total: usize,
    pub entries: Vec<AgentEntry>,
}

// ─── Internal AST Collection ────────────────────────────────────────────────

#[derive(Default)]
struct ASTCollector {
    rules: Vec<(String, String)>,         // (issue, severity) from declared arrays
    dynamic_findings: usize,              // push() injections count
    assignments: Vec<(String, String)>,   // (prop_name, value) from constructor
    methods: Vec<String>,
    has_reasoning: bool,
    file_extensions: Vec<String>,
    system_prompt: String,
    class_name: String,
    // Halstead
    unique_operators: std::collections::HashSet<String>,
    unique_operands: std::collections::HashSet<String>,
    total_operators: usize,
    total_operands: usize,
}

// ─── Core AST Extraction ────────────────────────────────────────────────────

pub fn extract_fingerprint(source: &str, agent_name: &str, ext: &str) -> AtomicFingerprint {
    let mut parser = Parser::new();
    
    let language = match ext {
        "ts" | "tsx" | "js" | "jsx" => tree_sitter_typescript::language_typescript(),
        "py" => tree_sitter_python::language(),
        "go" => tree_sitter_go::language(),
        "rs" => tree_sitter_rust::language(),
        _ => tree_sitter_typescript::language_typescript(), // Fallback
    };
    
    parser.set_language(language).unwrap_or_else(|_| {
        eprintln!("Error loading grammar for extension: {}", ext);
    });

    let tree = match parser.parse(source, None) {
        Some(t) => t,
        None => return empty_fingerprint(agent_name),
    };

    let mut collector = ASTCollector::default();
    walk_node(tree.root_node(), source, &mut collector, 0);

    let base_methods = [
        "performAudit", "performActiveHealing", "reasonAboutObjective",
        "selfDiagnostic", "getSystemPrompt", "constructor",
    ];

    // Deduplicate rules by issue text
    let mut seen_issues = std::collections::HashSet::new();
    let mut unique_rules: Vec<(String, String)> = Vec::new();
    for (issue, severity) in &collector.rules {
        if seen_issues.insert(issue.clone()) {
            unique_rules.push((issue.clone(), severity.clone()));
        }
    }

    let assign = |key: &str| -> String {
        collector.assignments.iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v.clone())
            .unwrap_or_default()
    };

    // Calculate Halstead
    let n1 = collector.unique_operators.len() as f64;
    let n2 = collector.unique_operands.len() as f64;
    let _n1_total = collector.total_operators as f64;
    let n2_total = collector.total_operands as f64;
    
    let total_unique = n1 + n2;
    let volume = if total_unique > 0.0 { total_unique * total_unique.log2() } else { 0.0 };
    let difficulty = if n2 > 0.0 { (n1 / 2.0) * (n2_total / n2) } else { 0.0 };

    AtomicFingerprint {
        name: {
            let n = assign("name");
            if n.is_empty() { agent_name.to_string() } else { n }
        },
        emoji: {
            let e = assign("emoji");
            if e.is_empty() { "👤".to_string() } else { e }
        },
        role: {
            let r = assign("role");
            if r.is_empty() { "PhD Agent".to_string() } else { r }
        },
        stack: {
            let s = assign("stack");
            if s.is_empty() { "TypeScript".to_string() } else { s }
        },
        rules_count: unique_rules.len(),
        rule_issues: unique_rules.iter().map(|(i, _)| truncate(i, 60)).collect(),
        rule_severities: unique_rules.iter().map(|(_, s)| s.clone()).collect(),
        file_extensions: collector.file_extensions,
        has_reasoning: collector.has_reasoning,
        system_prompt: collector.system_prompt,
        methods: collector.methods.clone(),
        extra_methods: collector.methods.iter()
            .filter(|m| !base_methods.contains(&m.as_str()))
            .cloned()
            .collect(),
        dynamic_findings_count: collector.dynamic_findings,
        halstead_volume: volume,
        halstead_difficulty: difficulty,
        halstead_effort: volume * difficulty,
    }
}

// ─── AST Walker ─────────────────────────────────────────────────────────────

fn walk_node(node: Node, source: &str, col: &mut ASTCollector, depth: usize) {
    let kind = node.kind();

    // Halstead Classification
    match kind {
        "+" | "-" | "*" | "/" | "%" | "=" | "==" | "===" | "!=" | "!==" | "<" | ">" | "<=" | ">=" | 
        "&&" | "||" | "!" | "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>" | "+=" | "-=" | "*=" | "/=" | 
        "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=" | ">>>=" | "++" | "--" | "?" | ":" | "?." | "..." => {
            col.unique_operators.insert(kind.to_string());
            col.total_operators += 1;
        }
        "identifier" | "number" | "string" | "template_string" | "true" | "false" | "null" | "undefined" => {
            let text = node_text(node, source).to_string();
            col.unique_operands.insert(text);
            col.total_operands += 1;
        }
        _ => {}
    }

    match kind {
        // Class declaration → extract name
        "class_declaration" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                col.class_name = node_text(name_node, source).to_string();
            }
        }

        // Method definition → collect method names
        "method_definition" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = node_text(name_node, source).to_string();
                if name == "reasonAboutObjective" {
                    col.has_reasoning = true;
                }
                if name == "getSystemPrompt" {
                    // Extract return string from body
                    if let Some(body) = node.child_by_field_name("body") {
                        extract_system_prompt(body, source, col);
                    }
                }
                col.methods.push(name);
            }
        }

        // Variable declarator → const rules/checks/auditRules = [...]
        "variable_declarator" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = node_text(name_node, source);
                if matches!(name, "rules" | "auditRules" | "checks") {
                    if let Some(value) = node.child_by_field_name("value") {
                        if value.kind() == "array" {
                            collect_rules_from_array(value, source, col);
                        }
                    }
                }
            }
        }

        // Public field definition → auditRules = [...]
        "public_field_definition" => {
            if let Some(name_node) = node.child_by_field_name("name") {
                let name = node_text(name_node, source);
                if name == "auditRules" {
                    if let Some(value) = node.child_by_field_name("value") {
                        if value.kind() == "array" {
                            collect_rules_from_array(value, source, col);
                        }
                    }
                }
            }
        }

        // Expression statement → this.name = "value" in constructor
        "expression_statement" => {
            try_extract_this_assignment(node, source, col);
        }

        // Call expression → findPatterns([exts], [rules]) or results.push({...})
        "call_expression" => {
            handle_call_expression(node, source, col);
        }

        _ => {}
    }

    // Recurse into children
    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            walk_node(cursor.node(), source, col, depth + 1);
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
}

// ─── Specific AST Handlers ──────────────────────────────────────────────────

fn try_extract_this_assignment(node: Node, source: &str, col: &mut ASTCollector) {
    // Looking for: this.name = "value"
    let child = match node.named_child(0) {
        Some(c) if c.kind() == "assignment_expression" => c,
        _ => return,
    };

    let left = match child.child_by_field_name("left") {
        Some(l) if l.kind() == "member_expression" => l,
        _ => return,
    };

    // Check it's this.X
    let obj = match left.child_by_field_name("object") {
        Some(o) if node_text(o, source) == "this" => o,
        _ => return,
    };

    let _ = obj; // used for validation above
    let prop_name = match left.child_by_field_name("property") {
        Some(p) => node_text(p, source).to_string(),
        None => return,
    };

    let known_props = ["name", "emoji", "role", "stack"];
    if !known_props.contains(&prop_name.as_str()) {
        return;
    }

    let right = match child.child_by_field_name("right") {
        Some(r) if r.kind() == "string" => extract_string_content(r, source),
        _ => return,
    };

    col.assignments.push((prop_name, right));
}

fn handle_call_expression(node: Node, source: &str, col: &mut ASTCollector) {
    let func = match node.child_by_field_name("function") {
        Some(f) => f,
        None => return,
    };

    let func_text = node_text(func, source);

    // this.findPatterns([exts], [rules])
    if func_text.ends_with("findPatterns") {
        let args = match node.child_by_field_name("arguments") {
            Some(a) => a,
            None => return,
        };

        let mut arg_idx = 0;
        let mut cursor = args.walk();
        if cursor.goto_first_child() {
            loop {
                let child = cursor.node();
                if child.is_named() {
                    if arg_idx == 0 && child.kind() == "array" {
                        // First arg: file extensions
                        extract_string_array(child, source, &mut col.file_extensions);
                    } else if arg_idx == 1 && child.kind() == "array" {
                        // Second arg: rules array
                        collect_rules_from_array(child, source, col);
                    }
                    arg_idx += 1;
                }
                if !cursor.goto_next_sibling() {
                    break;
                }
            }
        }
    }

    // results.push({ issue: ..., severity: ... })
    if func_text.ends_with(".push") {
        let args = match node.child_by_field_name("arguments") {
            Some(a) => a,
            None => return,
        };

        let mut cursor = args.walk();
        if cursor.goto_first_child() {
            loop {
                let child = cursor.node();
                if child.kind() == "object" {
                    if is_rule_object(child, source) {
                        col.dynamic_findings += 1;
                    }
                }
                if !cursor.goto_next_sibling() {
                    break;
                }
            }
        }
    }
}

fn collect_rules_from_array(array_node: Node, source: &str, col: &mut ASTCollector) {
    let mut cursor = array_node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            if child.kind() == "object" && is_rule_object(child, source) {
                let issue = get_object_string_prop(child, source, "issue")
                    .unwrap_or_else(|| "dynamic".to_string());
                let severity = get_object_string_prop(child, source, "severity")
                    .unwrap_or_else(|| "unknown".to_string());
                col.rules.push((issue, severity));
            }
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
}

fn extract_system_prompt(body: Node, source: &str, col: &mut ASTCollector) {
    // Walk body looking for a return statement with a template_string or string
    let mut cursor = body.walk();
    walk_for_string_return(&mut cursor, source, col);
}

fn walk_for_string_return(cursor: &mut tree_sitter::TreeCursor, source: &str, col: &mut ASTCollector) {
    if cursor.goto_first_child() {
        loop {
            let node = cursor.node();
            if node.kind() == "return_statement" {
                // Get the returned expression
                if let Some(expr) = node.named_child(0) {
                    let text = node_text(expr, source);
                    if text.len() > 10 {
                        col.system_prompt = truncate(text, 120).to_string();
                    }
                }
            }
            walk_for_string_return(cursor, source, col);
            if !cursor.goto_next_sibling() {
                break;
            }
        }
        cursor.goto_parent();
    }
}

// ─── Object Literal Helpers ─────────────────────────────────────────────────

fn is_rule_object(node: Node, source: &str) -> bool {
    // An object literal is a "rule" if it has both `issue` and `severity` properties
    let mut has_issue = false;
    let mut has_severity = false;

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            if child.kind() == "pair" {
                if let Some(key) = child.child_by_field_name("key") {
                    let key_text = node_text(key, source);
                    // Strip quotes if present
                    let key_clean = key_text.trim_matches(|c| c == '\'' || c == '"');
                    if key_clean == "issue" { has_issue = true; }
                    if key_clean == "severity" { has_severity = true; }
                }
            }
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }

    has_issue && has_severity
}

fn get_object_string_prop(node: Node, source: &str, prop_name: &str) -> Option<String> {
    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            if child.kind() == "pair" {
                if let Some(key) = child.child_by_field_name("key") {
                    let key_text = node_text(key, source);
                    let key_clean = key_text.trim_matches(|c| c == '\'' || c == '"');
                    if key_clean == prop_name {
                        if let Some(value) = child.child_by_field_name("value") {
                            if value.kind() == "string" {
                                return Some(extract_string_content(value, source));
                            }
                            // Template literal
                            if value.kind() == "template_string" {
                                return Some(truncate(node_text(value, source), 80).to_string());
                            }
                        }
                    }
                }
            }
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
    None
}

fn extract_string_array(array_node: Node, source: &str, out: &mut Vec<String>) {
    let mut cursor = array_node.walk();
    if cursor.goto_first_child() {
        loop {
            let child = cursor.node();
            if child.kind() == "string" {
                let val = extract_string_content(child, source);
                if !out.contains(&val) {
                    out.push(val);
                }
            }
            if !cursor.goto_next_sibling() {
                break;
            }
        }
    }
}

// ─── Text Helpers ───────────────────────────────────────────────────────────

fn node_text<'a>(node: Node<'a>, source: &'a str) -> &'a str {
    &source[node.byte_range()]
}

fn extract_string_content(node: Node, source: &str) -> String {
    let text = node_text(node, source);
    // Remove surrounding quotes: 'x', "x", `x`
    if text.len() >= 2 {
        text[1..text.len()-1].to_string()
    } else {
        text.to_string()
    }
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        let mut end = max;
        while !s.is_char_boundary(end) {
            end -= 1;
        }
        format!("{}…", &s[..end])
    }
}

fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
    }
}

fn empty_fingerprint(name: &str) -> AtomicFingerprint {
    AtomicFingerprint {
        name: name.to_string(),
        emoji: "👤".to_string(),
        role: "PhD Agent".to_string(),
        stack: "Unknown".to_string(),
        rules_count: 0,
        rule_issues: vec![],
        rule_severities: vec![],
        file_extensions: vec![],
        has_reasoning: false,
        system_prompt: String::new(),
        methods: vec![],
        extra_methods: vec![],
        dynamic_findings_count: 0,
        halstead_volume: 0.0,
        halstead_difficulty: 0.0,
        halstead_effort: 0.0,
    }
}

// ─── Parallel Batch Extraction ──────────────────────────────────────────────

pub fn extract_all(agents_root: &Path) -> FingerprintReport {
    let stacks = ["TypeScript", "Bun", "Flutter", "Go", "Kotlin", "Python"];
    let categories = ["Audit", "Content", "Strategic", "System"];

    // Collect all file paths first
    let mut file_entries: Vec<(PathBuf, String, String, String, String)> = Vec::new();

    for stack in &stacks {
        for cat in &categories {
            let dir = agents_root.join(stack).join(cat);
            if !dir.exists() { continue; }

            for entry in WalkDir::new(&dir).max_depth(1).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path().to_path_buf();
                if let Some(ext_os) = path.extension() {
                    let ext = ext_os.to_str().unwrap_or("").to_string();
                    if matches!(ext.as_str(), "ts" | "tsx" | "go" | "kt" | "py" | "dart" | "rs") {
                        let stem = path.file_stem()
                            .and_then(|s| s.to_str())
                            .unwrap_or("unknown")
                            .to_string();
                        
                        if stem == "__init__" { continue; }
                        
                        let agent_name = capitalize(&stem);
                        
                        file_entries.push((
                            path,
                            stack.to_string(),
                            cat.to_string(),
                            agent_name,
                            ext,
                        ));
                    }
                }
            }
        }
    }

    // Process all files in parallel with rayon
    let entries: Vec<AgentEntry> = file_entries
        .par_iter()
        .filter_map(|(path, stack, cat, agent, ext)| {
            let source = fs::read_to_string(path).ok()?;
            let fp = extract_fingerprint(&source, agent, ext);
            Some(AgentEntry {
                agent: agent.clone(),
                stack: stack.clone(),
                category: cat.clone(),
                path: path.to_string_lossy().to_string(),
                fingerprint: fp,
            })
        })
        .collect();

    FingerprintReport {
        total: entries.len(),
        entries,
    }
}
