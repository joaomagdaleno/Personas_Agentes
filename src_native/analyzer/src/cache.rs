use std::collections::HashMap;
use std::fs;
use std::path::Path;
use sha2::{Sha256, Digest};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Clone)]
pub struct CacheEntry {
    pub hash: String,
    pub analysis: Option<Value>,
    pub fingerprint: Option<Value>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct CacheMap {
    pub entries: HashMap<String, CacheEntry>,
}

pub struct CacheManager {
    pub map: CacheMap,
    pub path: String,
}

impl CacheManager {
    pub fn new() -> Self {
        let path = ".sovereign_cache.json".to_string();
        let map = if Path::new(&path).exists() {
            if let Ok(content) = fs::read_to_string(&path) {
                serde_json::from_str(&content).unwrap_or_default()
            } else {
                CacheMap::default()
            }
        } else {
            CacheMap::default()
        };
        Self { map, path }
    }

    pub fn compute_hash(content: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn get_analysis(&self, file_path: &str, current_hash: &str) -> Option<Value> {
        if let Some(entry) = self.map.entries.get(file_path) {
            if entry.hash == current_hash {
                return entry.analysis.clone();
            }
        }
        None
    }

    pub fn set_analysis(&mut self, file_path: &str, current_hash: &str, analysis: Value) {
        let entry = self.map.entries.entry(file_path.to_string()).or_insert_with(|| CacheEntry {
            hash: current_hash.to_string(),
            analysis: None,
            fingerprint: None,
        });
        entry.hash = current_hash.to_string();
        entry.analysis = Some(analysis);
    }
    
    pub fn get_fingerprint(&self, file_path: &str, current_hash: &str) -> Option<Value> {
        if let Some(entry) = self.map.entries.get(file_path) {
            if entry.hash == current_hash {
                return entry.fingerprint.clone();
            }
        }
        None
    }

    pub fn set_fingerprint(&mut self, file_path: &str, current_hash: &str, fingerprint: Value) {
        let entry = self.map.entries.entry(file_path.to_string()).or_insert_with(|| CacheEntry {
            hash: current_hash.to_string(),
            analysis: None,
            fingerprint: None,
        });
        entry.hash = current_hash.to_string();
        entry.fingerprint = Some(fingerprint);
    }

    pub fn save(&self) {
        if let Ok(content) = serde_json::to_string_pretty(&self.map) {
            let _ = fs::write(&self.path, content);
        }
    }
}
