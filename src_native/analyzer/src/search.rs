use std::collections::HashMap;
use std::fs;
use serde::{Deserialize, Serialize};
use tree_sitter::{Parser, Node};

use crate::brain::Brain;

// --- Search Engine ---

#[derive(Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub files: HashMap<String, String>, // path -> content
}

#[derive(Serialize)]
pub struct SearchHit {
    pub path: String,
    pub score: f32,
    pub snippet: String,
    pub method: String,
}

pub fn semantic_search(request: SearchRequest) -> Vec<SearchHit> {
    let query_terms: Vec<String> = request.query.to_lowercase()
        .split_whitespace()
        .map(|s| s.to_string())
        .collect();

    // --- Pass 1: VSM Filter (Always works) ---
    let mut candidates: Vec<SearchHit> = request.files.iter()
        .map(|(path, content)| {
            let score = calculate_vsm_score(&query_terms, content);
            SearchHit {
                path: path.clone(),
                score,
                snippet: get_snippet(content, &query_terms),
                method: "VSM".to_string(),
            }
        })
        .filter(|h| h.score > 0.0)
        .collect();

    candidates.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    candidates.truncate(50); 

    // --- Pass 2: Unified Brain Intelligence ---
    let mut cache = load_embedding_cache();
    let brain = Brain::new();
    let brain_available = brain.is_loaded();

    let query_vec = if let Some(cached) = cache.get(&format!("query:{}", request.query)) {
        Some(cached.clone())
    } else if brain_available {
        if let Some(vec) = brain.embed(&request.query) {
            cache.insert(format!("query:{}", request.query), vec.clone());
            Some(vec)
        } else { None }
    } else { None };

    if let Some(q_vec) = query_vec {
        for hit in &mut candidates {
            if let Some(content) = request.files.get(&hit.path) {
                let text_to_embed = if content.len() > 1000 { &content[..1000] } else { content };
                let doc_key = format!("doc:{}", hit.path);
                
                let doc_vec = if let Some(cached) = cache.get(&doc_key) {
                    Some(cached.clone())
                } else if brain_available {
                    if let Some(vec) = brain.embed(text_to_embed) {
                        cache.insert(doc_key, vec.clone());
                        Some(vec)
                    } else { None }
                } else { None };

                if let Some(d_vec) = doc_vec {
                    let sim = cosine_similarity(&q_vec, &d_vec);
                    // Hybrid Score: 30% VSM + 70% Neural
                    hit.score = hit.score * 0.3 + sim * 0.7;
                    hit.method = "Hybrid (Unified Brain)".to_string();
                }
            }
        }
        save_embedding_cache(&cache);
    } else {
        // Fallback: Structural AST (Nível 3)
        for hit in &mut candidates {
            if let Some(content) = request.files.get(&hit.path) {
                let structural_boost = calculate_structural_boost(&query_terms, content);
                if structural_boost > 1.0 {
                    hit.score *= structural_boost;
                    hit.method = "Structural (Fallback)".to_string();
                }
            }
        }
    }

    candidates.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    candidates.truncate(10);
    candidates
}

// --- Utils ---

fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    if v1.len() != v2.len() || v1.is_empty() { return 0.0; }
    let dot: f32 = v1.iter().zip(v2.iter()).map(|(a, b)| a * b).sum();
    let m1: f32 = v1.iter().map(|a| a * a).sum::<f32>().sqrt();
    let m2: f32 = v2.iter().map(|a| a * a).sum::<f32>().sqrt();
    if m1 * m2 == 0.0 { 0.0 } else { dot / (m1 * m2) }
}

fn calculate_vsm_score(query_terms: &[String], content: &str) -> f32 {
    let content_lower = content.to_lowercase();
    let mut score = 0.0;
    for term in query_terms {
        let count = content_lower.matches(term).count();
        if count > 0 {
            score += 1.0 + (count as f32).ln();
        }
    }
    let len_factor = (content.len() as f32).sqrt();
    if len_factor > 0.0 { score / len_factor } else { 0.0 }
}

fn calculate_structural_boost(query_terms: &[String], content: &str) -> f32 {
    let mut parser = Parser::new();
    let language = tree_sitter_typescript::language_typescript();
    parser.set_language(language).expect("Error loading TS grammar");
    let tree = parser.parse(content, None).unwrap();
    let mut boost = 1.0;
    walk_for_boost(tree.root_node(), query_terms, &mut boost);
    boost
}

fn walk_for_boost(node: Node, query_terms: &[String], boost: &mut f32) {
    let kind = node.kind();
    if ["method_definition", "function_declaration", "class_declaration", "decorator"].contains(&kind) {
        let text = node.utf8_text(b"").unwrap_or("").to_lowercase();
        for term in query_terms {
            if text.contains(term) {
                *boost += 0.5;
            }
        }
    }
    if node.child_count() > 0 && node.start_byte() < 5000 {
        for i in 0..node.child_count() {
            walk_for_boost(node.child(i).unwrap(), query_terms, boost);
        }
    }
}

fn get_snippet(content: &str, query_terms: &[String]) -> String {
    let content_lower = content.to_lowercase();
    for term in query_terms {
        if let Some(pos) = content_lower.find(term) {
            let start = pos.saturating_sub(40);
            let end = (pos + term.len() + 40).min(content.len());
            return format!("...{}...", &content[start..end].replace("\n", " "));
        }
    }
    content.chars().take(80).collect()
}

// --- Cache ---

fn load_embedding_cache() -> HashMap<String, Vec<f32>> {
    let cache_path = ".gemini/cache/embeddings.bin";
    if let Ok(data) = fs::read(cache_path) {
        if let Ok(cache) = bincode::deserialize(&data) {
            return cache;
        }
    }
    HashMap::new()
}

fn save_embedding_cache(cache: &HashMap<String, Vec<f32>>) {
    let cache_dir = ".gemini/cache";
    let _ = fs::create_dir_all(cache_dir);
    let cache_path = format!("{}/embeddings.bin", cache_dir);
    if let Ok(data) = bincode::serialize(cache) {
        let _ = fs::write(cache_path, data);
    }
}
