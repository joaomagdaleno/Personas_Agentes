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
    pub match_count: usize,
    pub line_number: Option<usize>,
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

pub fn extract_evidence(content: &str, pattern: &str) -> (String, usize, Option<usize>) {
    if let Ok(re) = Regex::new(pattern) {
        let matches: Vec<_> = re.find_iter(content).collect();
        let count = matches.len();
        if let Some(first) = matches.first() {
            let line = content[..first.start()].matches('\n').count() + 1;
            let s = first.as_str();
            let evidence = s[..s.len().min(100)].to_string();
            return (evidence, count, Some(line));
        }
    }
    ("pattern_match".to_string(), 0, None)
}

fn detect_obfuscation(content: &str, file_path: &str) -> Vec<AuditFinding> {
    let mut findings = Vec::new();
    let dangerous = ["eval", "process.env", "require", "exec", "execSync", "spawn", "Buffer.from", "fs.readFile", "document.cookie", "localStorage", "window.crypto", "__dirname", "setTimeout", "setInterval", "Function"];
    
    let concat_re = Regex::new(r#"(["'][^"']*["']\s*\+\s*)+["'][^"']*["']"#).unwrap();
    
    for cap in concat_re.captures_iter(content) {
        let matched = cap[0].to_string();
        let reconstructed = matched.replace("'", "").replace("\"", "").replace(" ", "").replace("+", "");
        
        for kw in dangerous.iter() {
            if reconstructed.contains(kw) && !matched.contains(kw) {
                findings.push(AuditFinding {
                    file: file_path.to_string(),
                    agent: "Security Guard".to_string(),
                    role: "Protector".to_string(),
                    emoji: "🛡️".to_string(),
                    issue: format!("Possível Ofuscação: '{}' fragmentado", kw),
                    severity: "HIGH".to_string(),
                    stack: "Security".to_string(),
                    evidence: matched.chars().take(80).collect(),
                    match_count: 1,
                    line_number: Some(content[..cap.get(0).unwrap().start()].matches('\n').count() + 1),
                });
            }
        }
    }
    findings
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
            
            let regex_findings: Vec<_> = matches.into_iter().filter_map(|rule_idx| {
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

                let (evidence, match_count, line_number) = extract_evidence(&file.content, &rule.regex);
                Some(AuditFinding {
                    file: file.path.clone(),
                    agent: persona.agent.clone(),
                    role: persona.role.clone(),
                    emoji: persona.emoji.clone(),
                    issue: rule.issue.clone(),
                    severity: rule.severity.clone(),
                    stack: persona.stack.clone(),
                    evidence,
                    match_count,
                    line_number,
                })
            }).collect();
            
            // 3. Obfuscation detection
            let mut file_findings = Vec::new();
            file_findings.extend(regex_findings);
            
            // Only check for obfuscation if it's TS, JS, or PY
            let is_code = file.path.ends_with(".ts") || file.path.ends_with(".js") || file.path.ends_with(".py");
            if is_code {
                file_findings.extend(detect_obfuscation(&file.content, &file.path));
            }
            
            file_findings
        })
        .collect()
}

#[cfg(test)]

mod tests {
    use super::*;

    #[test]
    fn test_extract_evidence() {
        let content = "line 1\nconsole.log('hello');\nline 3";
        let (evidence, count, line_num) = extract_evidence(content, "console\\.log");
        assert_eq!(count, 1);
        assert_eq!(line_num, Some(2));
        assert!(evidence.contains("console.log"));
    }

    #[test]
    fn test_detect_obfuscation() {
        let content = "let a = 'e' + 'v' + 'a' + 'l';";
        let findings = detect_obfuscation(content, "test.js");
        assert_eq!(findings.len(), 1);
        assert_eq!(findings[0].issue, "Possível Ofuscação: 'eval' fragmentado");
        assert_eq!(findings[0].severity, "HIGH");
    }
}
