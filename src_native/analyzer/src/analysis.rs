use std::path::Path;
use tree_sitter::{Parser, Node};
use serde::{Serialize, Deserialize};
use crate::{cache, dependencies, fingerprint};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ParameterInfo {
    pub name: String,
    pub param_type: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FunctionMetric {
    pub name: String,
    pub cyclomatic_complexity: i32,
    pub cognitive_complexity: i32,
    pub nesting: i32,
    pub line: usize,
    pub params: Vec<ParameterInfo>,
    pub return_type: String,
    pub is_async: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LogicalFinding {
    pub category: String, // "SILENT_ERROR", "DANGEROUS_CALL", "COMPLEXITY", "SECURITY"
    pub message: String,
    pub severity: String,
    pub line: usize,
    pub snippet: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SymbolInfo {
    pub name: String,
    pub kind: String, // "class", "function", "interface"
    pub line: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AnalysisResult {
    pub path: String,
    pub cyclomatic_complexity: i32,
    pub cognitive_complexity: i32,
    pub functions: Vec<FunctionMetric>,
    pub symbols: Vec<SymbolInfo>,
    pub findings: Vec<LogicalFinding>,
    pub dependencies: dependencies::DependencyInfo,
    pub loc: usize,
    pub sloc: usize,
    pub comments: usize,
}

pub fn run_analyze_core(path: &str, source_code: String) -> AnalysisResult {
    let mut cache_mgr = cache::CacheManager::new();
    let file_hash = cache::CacheManager::compute_hash(&source_code);

    // Return cached result if hash matches
    if let Some(cached_value) = cache_mgr.get_analysis(path, &file_hash) {
        if let Ok(cached_result) = serde_json::from_value::<AnalysisResult>(cached_value) {
            return cached_result;
        }
    }

    let source_bytes = source_code.as_bytes();
    
    let loc = source_code.lines().count();

    let mut parser = Parser::new();
    let extension = Path::new(path).extension().and_then(|s| s.to_str()).unwrap_or("");
    
    let language = match extension {
        "py" => tree_sitter_python::language(),
        "go" => tree_sitter_go::language(),
        "rs" => tree_sitter_rust::language(),
        _ => tree_sitter_typescript::language_typescript(),
    };
    parser.set_language(language).expect("Error loading grammar");

    let tree = parser.parse(&source_code, None).expect("Error parsing file");
    let root_node = tree.root_node();

    // AST-based comment counting
    let mut comments = 0;
    count_comments_ast(&mut root_node.walk(), &mut comments);
    let non_empty = source_code.lines().filter(|l| !l.trim().is_empty()).count();
    let sloc = non_empty.saturating_sub(comments);

    let mut functions = Vec::new();
    let mut symbols = Vec::new();
    let mut findings = Vec::new();
    
    // Process AST for Symbols and Findings
    let mut stack = vec![root_node];
    while let Some(node) = stack.pop() {
        let kind = node.kind();
        
        // --- 1. Symbol Extraction ---
        if ["class_declaration", "interface_declaration", "enum_declaration", "function_declaration", "method_definition"].contains(&kind) {
            if let Some(name_node) = node.child_by_field_name("name") {
                if let Ok(name) = name_node.utf8_text(source_bytes) {
                    symbols.push(SymbolInfo {
                        name: name.to_string(),
                        kind: kind.replace("_declaration", "").replace("_definition", ""),
                        line: node.start_position().row + 1,
                    });
                }
            }
        }

        // --- 2. Logical Findings (Deep Analysis) ---
        match kind {
            "catch_clause" => {
               if let Some(body) = node.child_by_field_name("body") {
                   if body.child_count() <= 2 { 
                       findings.push(LogicalFinding {
                           category: "SILENT_ERROR".to_string(),
                           message: "Try-catch vazio detectado. Erro pode estar sendo silenciado.".to_string(),
                           severity: "WARNING".to_string(),
                           line: node.start_position().row + 1,
                           snippet: node.utf8_text(source_bytes).unwrap_or("").chars().take(100).collect(),
                       });
                   }
               }
            }
            "call_expression" => {
                if let Some(func_node) = node.child_by_field_name("function") {
                    if let Ok(func_text) = func_node.utf8_text(source_bytes) {
                        let dangerous = ["eval", "exec", "execSync", "spawnSync", "String.fromCharCode"];
                        if dangerous.contains(&func_text) {
                            findings.push(LogicalFinding {
                                category: "SECURITY".to_string(),
                                message: format!("Uso de função perigosa ou potencialmente ofuscada: {}", func_text),
                                severity: "CRITICAL".to_string(),
                                line: node.start_position().row + 1,
                                snippet: node.utf8_text(source_bytes).unwrap_or("").chars().take(100).collect(),
                            });
                        }
                    }
                }
            }
            "string" | "string_fragment" => {
                if let Ok(text) = node.utf8_text(source_bytes) {
                    if text.contains("\\x") || (text.len() > 50 && is_likely_base64(text)) {
                         findings.push(LogicalFinding {
                            category: "OBFUSCATION".to_string(),
                            message: "String potencialmente ofuscada (Hex ou Base64) detectada.".to_string(),
                            severity: "WARNING".to_string(),
                            line: node.start_position().row + 1,
                            snippet: text.chars().take(50).collect(),
                        });
                    }
                }
            }
            _ => {}
        }

        // --- 3. Function Metrics (Existing flow) ---
        if ["function_declaration", "method_definition", "arrow_function", "function"].contains(&kind) {
            let mut name = "anonymous".to_string();
            if let Some(n) = node.child_by_field_name("name") {
                name = n.utf8_text(source_bytes).unwrap_or("anonymous").to_string();
            } else if kind == "arrow_function" {
                if let Some(parent) = node.parent() {
                    if parent.kind() == "variable_declarator" {
                        if let Some(n) = parent.child_by_field_name("name") {
                            name = n.utf8_text(source_bytes).unwrap_or("anonymous").to_string();
                        }
                    }
                }
            }

            let mut cyclomatic = 1;
            let mut cognitive = 0;
            let mut nesting = 0;
            collect_metrics(node, 0, &mut cyclomatic, &mut cognitive, &mut nesting);

            let mut params = Vec::new();
            let mut return_type = "any".to_string();
            let mut is_async = false;

            if node.child_by_field_name("async").is_some() || node.utf8_text(source_bytes).unwrap_or("").starts_with("async") {
                is_async = true;
            }

            if let Some(params_node) = node.child_by_field_name("parameters") {
                let mut p_cursor = params_node.walk();
                if p_cursor.goto_first_child() {
                    loop {
                        let p_node = p_cursor.node();
                        if ["required_parameter", "optional_parameter", "parameter"].contains(&p_node.kind()) {
                            let mut p_name = p_node.utf8_text(source_bytes).unwrap_or("param").to_string();
                            let mut p_type = "any".to_string();
                            
                            if let Some(name_node) = p_node.child_by_field_name("pattern") {
                                p_name = name_node.utf8_text(source_bytes).unwrap_or("param").to_string();
                            }
                            
                            if let Some(type_node) = p_node.child_by_field_name("type") {
                                p_type = type_node.utf8_text(source_bytes).unwrap_or("any").to_string();
                            }

                            params.push(ParameterInfo { name: p_name, param_type: p_type });
                        }
                        if !p_cursor.goto_next_sibling() { break; }
                    }
                }
            }

            if let Some(ret_node) = node.child_by_field_name("return_type") {
                return_type = ret_node.utf8_text(source_bytes).unwrap_or("any").to_string();
            }

            functions.push(FunctionMetric {
                name,
                cyclomatic_complexity: cyclomatic,
                cognitive_complexity: cognitive,
                nesting,
                line: node.start_position().row + 1,
                params,
                return_type,
                is_async,
            });
        }
        
        let mut child_cursor = node.walk();
        if child_cursor.goto_first_child() {
            loop {
                stack.push(child_cursor.node());
                if !child_cursor.goto_next_sibling() { break; }
            }
        }
    }

    let cyclomatic_complexity: i32 = functions.iter().map(|f| f.cyclomatic_complexity).sum();
    let cognitive_complexity: i32 = functions.iter().map(|f| f.cognitive_complexity).sum();

    let deps = dependencies::extract_dependencies(&source_code, extension);

    let result = AnalysisResult {
        path: path.to_string(),
        cyclomatic_complexity,
        cognitive_complexity,
        functions,
        symbols,
        findings,
        dependencies: deps,
        loc,
        sloc,
        comments,
    };

    let result_json = serde_json::to_value(&result).unwrap();
    cache_mgr.set_analysis(path, &file_hash, result_json.clone());
    cache_mgr.save();

    result
}

pub fn run_fingerprint_core(path_str: &str, source: String) -> fingerprint::FingerprintReport {
    let path = Path::new(path_str);
    let mut cache_mgr = cache::CacheManager::new();
    let file_hash = cache::CacheManager::compute_hash(&source);

    if let Some(cached_value) = cache_mgr.get_fingerprint(path_str, &file_hash) {
        if let Ok(cached_result) = serde_json::from_value::<fingerprint::FingerprintReport>(cached_value) {
            return cached_result;
        }
    }

    let stem = path.file_stem().and_then(|s| s.to_str()).unwrap_or("unknown");
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
    let agent_name = stem.to_string();
    
    let fp = fingerprint::extract_fingerprint(&source, &agent_name, ext);
    let entry = fingerprint::AgentEntry {
        agent: agent_name,
        stack: "Unknown".to_string(),
        category: "Direct".to_string(),
        path: path_str.to_string(),
        fingerprint: fp,
    };
    
    let report = fingerprint::FingerprintReport {
        total: 1,
        entries: vec![entry],
    };
    
    let report_json = serde_json::to_value(&report).unwrap();
    cache_mgr.set_fingerprint(path_str, &file_hash, report_json.clone());
    cache_mgr.save();
    
    report
}

fn collect_metrics(node: Node, depth: i32, cyclomatic: &mut i32, cognitive: &mut i32, max_nesting: &mut i32) {
    let kind = node.kind();
    
    let is_branch = ["if_statement", "for_statement", "while_statement", "do_statement", "for_in_statement", "case_clause", "catch_clause", "conditional_expression", "ternary_expression", "&&", "||", "??"].contains(&kind);
    
    if is_branch {
        *cyclomatic += 1;
    }

    let is_nestable = ["if_statement", "for_statement", "while_statement", "do_statement", "for_in_statement", "catch_clause", "switch_statement"].contains(&kind);
    
    let mut current_depth = depth;
    
    if is_nestable {
        *cognitive += 1 + depth;
        current_depth += 1;
        if current_depth > *max_nesting {
            *max_nesting = current_depth;
        }
    } else if ["conditional_expression", "ternary_expression"].contains(&kind) {
        *cognitive += 1 + depth;
    } else if ["arrow_function", "function_declaration", "method_definition", "function"].contains(&kind) {
        current_depth += 1;
        if current_depth > *max_nesting {
            *max_nesting = current_depth;
        }
    }

    let mut cursor = node.walk();
    if cursor.goto_first_child() {
        loop {
            collect_metrics(cursor.node(), current_depth, cyclomatic, cognitive, max_nesting);
            if !cursor.goto_next_sibling() { break; }
        }
    }
}

fn count_comments_ast(cursor: &mut tree_sitter::TreeCursor, count: &mut usize) {
    let node = cursor.node();
    let kind = node.kind();
    
    if kind == "comment" || kind == "line_comment" || kind == "block_comment" {
        let start_row = node.start_position().row;
        let end_row = node.end_position().row;
        *count += (end_row - start_row) + 1;
    }
    
    if cursor.goto_first_child() {
        loop {
            count_comments_ast(cursor, count);
            if !cursor.goto_next_sibling() { break; }
        }
        cursor.goto_parent();
    }
}
fn is_likely_base64(s: &str) -> bool {
    if s.is_empty() || s.contains(' ') || s.contains('\n') || s.contains('\r') {
        return false;
    }
    
    // Check characters
    for c in s.chars() {
        if !c.is_ascii_alphanumeric() && c != '+' && c != '/' && c != '=' {
            return false;
        }
    }
    
    // Heuristic: high entropy or suspicious length
    s.len() > 16 && (s.len() % 4 == 0 || s.ends_with('='))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fingerprint_core() {
        let code = "function test() { return 1; }".to_string();
        let report = run_fingerprint_core("test.ts", code);
        assert_eq!(report.total, 1);
        assert_eq!(report.entries[0].agent, "test");
    }
}
