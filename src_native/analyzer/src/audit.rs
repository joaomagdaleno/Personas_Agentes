use std::path::Path;
use regex::{Regex, RegexSet};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Rule {
    pub regex: String,
    pub issue: String,
    pub severity: String,
}

#[derive(Deserialize)]
pub struct PersonaRuleSet {
    pub agent: String,
    pub role: String,
    pub emoji: String,
    pub stack: String,
    pub extensions: Vec<String>,
    pub rules: Vec<Rule>,
}

#[derive(Deserialize)]
pub struct FileEntry {
    pub path: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct BulkAuditRequest {
    pub files: Vec<FileEntry>,
    pub persona_rules: Vec<PersonaRuleSet>,
}

#[derive(Serialize)]
pub struct AuditFinding {
    pub file: String,
    pub agent: String,
    pub role: String,
    pub emoji: String,
    pub issue: String,
    pub severity: String,
    pub stack: String,
    pub evidence: String,
}

/// RESOLVE RULE INDEX:
/// Maps a flat RegexSet index back to (persona_index, rule_index)
fn resolve_rule_index(global_idx: usize, persona_rules: &[PersonaRuleSet]) -> Option<(usize, usize)> {
    let mut current = 0;
    for (p_idx, persona) in persona_rules.iter().enumerate() {
        let rule_count = persona.rules.len();
        if global_idx < current + rule_count {
            return Some((p_idx, global_idx - current));
        }
        current += rule_count;
    }
    None
}

fn extract_evidence(content: &str, pattern: &str, _match_idx: usize) -> String {
    // For now, just a simple capture or substring.
    // RegexSet doesn't give us the match location directly, 
    // we need to re-run the specific regex for the evidence if we want exact location.
    // But for performance, we might just use a placeholder or a quick scan.
    
    if let Ok(re) = Regex::new(pattern) {
        if let Some(m) = re.find(content) {
            let s = m.as_str();
            return s[..s.len().min(100)].to_string();
        }
    }
    "pattern_match".to_string()
}

pub fn bulk_audit(request: BulkAuditRequest) -> Vec<AuditFinding> {
    // 1. Collect and compile patterns
    let all_patterns: Vec<String> = request.persona_rules.iter()
        .flat_map(|ps| ps.rules.iter().map(|r| r.regex.clone()))
        .collect();

    if all_patterns.is_empty() {
        return Vec::new();
    }

    let regex_set = RegexSet::new(&all_patterns).unwrap_or_else(|_| {
        // Fallback or handle invalid regexes individually?
        // For now just skip if fail
        RegexSet::new(vec![r"^$"]).unwrap()
    });

    // 2. Parallel audit
    request.files.par_iter()
        .flat_map(|file| {
            let matches: Vec<usize> = regex_set.matches(&file.content).into_iter().collect();
            
            matches.into_iter().filter_map(|rule_idx| {
                let (p_idx, r_idx) = resolve_rule_index(rule_idx, &request.persona_rules)?;
                let persona = &request.persona_rules[p_idx];
                let rule = &persona.rules[r_idx];

                // Check extension
                let file_ext = Path::new(&file.path)
                    .extension()
                    .and_then(|e| e.to_str())
                    .map(|e| format!(".{}", e))
                    .unwrap_or_default();

                if !persona.extensions.iter().any(|ext| ext == &file_ext || file.path.ends_with(ext)) {
                    return None;
                }

                Some(AuditFinding {
                    file: file.path.clone(),
                    agent: persona.agent.clone(),
                    role: persona.role.clone(),
                    emoji: persona.emoji.clone(),
                    issue: rule.issue.clone(),
                    severity: rule.severity.clone(),
                    stack: persona.stack.clone(),
                    evidence: extract_evidence(&file.content, &rule.regex, rule_idx),
                })
            }).collect::<Vec<_>>()
        })
        .collect()
}
