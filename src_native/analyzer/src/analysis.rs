use std::path::Path;
use tree_sitter::{Parser, Node};
use serde::{Serialize, Deserialize};
use crate::{cache, dependencies, fingerprint};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FunctionMetric {
    pub name: String,
    pub cyclomatic_complexity: i32,
    pub cognitive_complexity: i32,
    pub nesting: i32,
    pub line: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AnalysisResult {
    pub path: String,
    pub cyclomatic_complexity: i32,
    pub cognitive_complexity: i32,
    pub functions: Vec<FunctionMetric>,
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
    let mut sloc = 0;
    let mut comments = 0;

    for line in source_code.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() { continue; }
        if trimmed.starts_with("//") || trimmed.starts_with("/*") || trimmed.starts_with("*") {
            comments += 1;
        } else {
            sloc += 1;
        }
    }

    let mut parser = Parser::new();
    let extension = Path::new(path).extension().and_then(|s| s.to_str()).unwrap_or("");
    
    match extension {
        "py" => {
            let language = tree_sitter_python::language();
            parser.set_language(language).expect("Error loading Python grammar");
        }
        "go" => {
            let language = tree_sitter_go::language();
            parser.set_language(language).expect("Error loading Go grammar");
        }
        _ => {
            let language = tree_sitter_typescript::language_typescript();
            parser.set_language(language).expect("Error loading TypeScript grammar");
        }
    }

    let tree = parser.parse(&source_code, None).expect("Error parsing file");
    let root_node = tree.root_node();

    let mut functions = Vec::new();
    
    // Find all functions
    let _cursor = root_node.walk();
    let mut stack = vec![root_node];
    while let Some(node) = stack.pop() {
        let kind = node.kind();
        if ["function_declaration", "method_definition", "arrow_function", "function"].contains(&kind) {
            let mut name = "anonymous".to_string();
            if let Some(n) = node.child_by_field_name("name") {
                name = n.utf8_text(source_bytes).unwrap_or("anonymous").to_string();
            } else if kind == "arrow_function" {
                // Look for variable name in parent
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

            functions.push(FunctionMetric {
                name,
                cyclomatic_complexity: cyclomatic,
                cognitive_complexity: cognitive,
                nesting,
                line: node.start_position().row + 1,
            });
        }
        
        // Push children to stack
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
    let agent_name = stem.to_string();
    
    let fp = fingerprint::extract_fingerprint(&source, &agent_name);
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
        }
    }
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
