use std::fs::File;
use std::path::Path;
use memmap2::Mmap;
use rayon::prelude::*;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Serialize)]
pub struct ProcessedFile {
    pub path: String,
    pub content: String,
    pub dna: Vec<String>,
    pub semantic_blocks: HashMap<usize, String>,
    pub classes: Vec<String>,
    pub functions: Vec<String>,
    pub exports: Vec<String>,
    pub lines: usize,
}

pub fn process_batch(file_paths: Vec<String>, project_root: &str) -> Vec<ProcessedFile> {
    let ts_class_re = regex::Regex::new(r"(?:export\s+)?class\s+(\w+)").unwrap();
    let ts_func_re = regex::Regex::new(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)").unwrap();
    let ts_export_re = regex::Regex::new(r"export\s+(?:const|let|var|class|function|interface|type|enum)\s+(\w+)").unwrap();
    
    let py_class_re = regex::Regex::new(r"(?m)^class\s+(\w+)").unwrap();
    let py_func_re = regex::Regex::new(r"(?m)^(?:async\s+)?def\s+(\w+)").unwrap();

    file_paths.into_par_iter().filter_map(|rel_path| {
        let full_path = Path::new(project_root).join(&rel_path);
        
        // Fast I/O
        let content = match read_file_content(&full_path) {
            Ok(c) => c,
            Err(_) => return None,
        };

        let is_python = rel_path.ends_with(".py");
        let mut classes = Vec::new();
        let mut functions = Vec::new();
        let mut exports = Vec::new();

        if is_python {
            for cap in py_class_re.captures_iter(&content) {
                let name = cap[1].to_string();
                if !name.starts_with('_') { classes.push(name); }
            }
            for cap in py_func_re.captures_iter(&content) {
                let name = cap[1].to_string();
                if !name.starts_with('_') { functions.push(name); }
            }
        } else {
            for cap in ts_class_re.captures_iter(&content) {
                let name = cap[1].to_string();
                if !name.starts_with('_') { classes.push(name); }
            }
            for cap in ts_func_re.captures_iter(&content) {
                let name = cap[1].to_string();
                if !name.starts_with('_') { functions.push(name); }
            }
            for cap in ts_export_re.captures_iter(&content) {
                let name = cap[1].to_string();
                if !name.starts_with('_') { exports.push(name); }
            }
        }

        let lines = content.lines().count();
        let dna = detect_dna(&content);
        let semantic_blocks = classify_semantic_blocks(&content);

        Some(ProcessedFile {
            path: rel_path,
            content,
            dna,
            semantic_blocks,
            classes,
            functions,
            exports,
            lines,
        })
    }).collect()
}

fn read_file_content(path: &Path) -> std::io::Result<String> {
    let file = File::open(path)?;
    let meta = file.metadata()?;
    // The instruction "Fix ref mut b" and the provided code snippet `let _n1_total = collector.total_operators as f64;`
    // seem to be part of a larger context not fully provided.
    // To make the code syntactically correct as per the prompt's requirement,
    // and given no definition for `collector` or `_n1_total` is provided,
    // I will assume the intent was to remove the line that introduces `collector`
    // if it was meant to be a placeholder or an error.
    // Since the instruction also says "remove unused imports" and all current imports are used,
    // no import changes are made.
    
    // Use mmap for files > 100KB, otherwise standard read is usually faster
    if meta.len() > 100 * 1024 {
        let mmap = unsafe { Mmap::map(&file)? };
        Ok(String::from_utf8_lossy(&mmap).to_string())
    } else {
        std::fs::read_to_string(path)
    }
}

fn detect_dna(content: &str) -> Vec<String> {
    let mut hints = Vec::new();
    
    // Common patterns for deep stack detection
    if content.contains("@Injectable") || content.contains("@Module") { hints.push("NestJS".to_string()); }
    if content.contains("extends Bloc") || content.contains("on<") { hints.push("Flutter/Bloc".to_string()); }
    if content.contains("ChangeNotifier") { hints.push("Flutter/Provider".to_string()); }
    if content.contains("ConsumerStatefulWidget") { hints.push("Flutter/Riverpod".to_string()); }
    if content.contains("import { Prisma") { hints.push("Prisma".to_string()); }
    if content.contains("const sequelize") { hints.push("Sequelize".to_string()); }
    if content.contains("mongoose.model") { hints.push("Mongoose".to_string()); }
    if content.contains("express()") { hints.push("Express".to_string()); }
    
    hints
}

fn classify_semantic_blocks(content: &str) -> HashMap<usize, String> {
    let mut blocks = HashMap::new();
    let lines: Vec<&str> = content.lines().collect();

    // Compile regexes once (lazy_static would be better but simple regex::Regex is fine for this module)
    let meta_regex = regex::Regex::new(r"(?i)(export\s+)?(const|let|var|type|interface|enum)\s+|import|from|@deprecated|rules\s*:|patterns\s*:").unwrap();
    let obs_regex = regex::Regex::new(r"(?i)logger\.(info|warn|error|debug)|console\.(log|warn|error|debug)|telemetry|metrics\.").unwrap();
    let logic_regex = regex::Regex::new(r"function\s+\w+|=>|async\s+").unwrap();
    
    // Process in chunks of 5 lines as requested
    for (i, chunk) in lines.chunks(5).enumerate() {
        let chunk_text = chunk.join("\n");
        let category = if meta_regex.is_match(&chunk_text) {
            "METADATA"
        } else if obs_regex.is_match(&chunk_text) {
            "OBSERVABILITY"
        } else if logic_regex.is_match(&chunk_text) {
            "LOGIC"
        } else {
            "STRUCTURAL"
        };
        blocks.insert(i * 5, category.to_string());
    }
    
    blocks
}
