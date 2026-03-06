use candle_core::{Device, Tensor, DType};
use candle_nn::VarBuilder;
use candle_transformers::models::qwen2::{Model as QwenModel, Config as QwenConfig};
use tokenizers::Tokenizer;
use std::collections::HashMap;
use std::path::Path;
use serde::Deserialize;

pub struct Brain {
    model: Option<QwenModel>,
    tokenizer: Option<Tokenizer>,
    device: Device,
    loaded: bool,
}

impl Brain {
    pub fn new() -> Self {
        let device = Device::Cpu;
        let model_dir = ".gemini/models/qwen3.5-0.6b";
        
        if let Some((model, tokenizer)) = Self::load_model(model_dir, &device) {
            eprintln!("🧠 [Brain] qwen3.5:0.6b carregado — 400MB RAM");
            Self {
                model: Some(model),
                tokenizer: Some(tokenizer),
                device,
                loaded: true,
            }
        } else {
            eprintln!("⚡ [Brain] Modelo não encontrado — Fallback para VSM/Static");
            Self {
                model: None,
                tokenizer: None,
                device,
                loaded: false,
            }
        }
    }

    fn load_model(dir: &str, device: &Device) -> Option<(QwenModel, Tokenizer)> {
        let path = Path::new(dir);
        if !path.exists() { return None; }

        let config_path = path.join("config.json");
        let tokenizer_path = path.join("tokenizer.json");
        let model_path = path.join("model.safetensors");

        let config: QwenConfig = serde_json::from_str(&std::fs::read_to_string(config_path).ok()?).ok()?;
        let tokenizer = Tokenizer::from_file(tokenizer_path).ok()?;
        
        let vb = unsafe {
            VarBuilder::from_mmaped_safetensors(&[model_path], DType::F32, device).ok()?
        };
        
        let model = QwenModel::new(&config, vb).ok()?;
        Some((model, tokenizer))
    }

    pub fn reason(&self, prompt: &str, max_tokens: usize) -> Option<String> {
        if !self.loaded { return None; }
        let model = self.model.as_ref()?;
        let tokenizer = self.tokenizer.as_ref()?;

        let tokens = tokenizer.encode(prompt, true).ok()?;
        let mut tokens_ids = tokens.get_ids().to_vec();
        let mut generated_ids = Vec::new();

        // Simple greedy decoding for brevity
        for _ in 0..max_tokens {
            let context = if tokens_ids.len() > 512 { &tokens_ids[tokens_ids.len()-512..] } else { &tokens_ids };
            let input = Tensor::new(&[context], &self.device).ok()?;
            let logits = model.forward(&input).ok()?;
            let logits = logits.squeeze(0).ok()?;
            let last_logits = logits.get(logits.dim(0).ok()? - 1).ok()?;
            
            // Argonaut-style greedy sampling
            let next_token = last_logits.to_vec1::<f32>().ok()?
                .iter().enumerate()
                .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                .map(|(i, _)| i as u32)?;

            if Some(next_token) == tokenizer.get_vocab(true).get("<|endoftext|>").copied() {
                break;
            }

            tokens_ids.push(next_token);
            generated_ids.push(next_token);
        }

        tokenizer.decode(&generated_ids, true).ok()
    }

    pub fn embed(&self, text: &str) -> Option<Vec<f32>> {
        if !self.loaded { return None; }
        let model = self.model.as_ref()?;
        let tokenizer = self.tokenizer.as_ref()?;

        let tokens = tokenizer.encode(text, true).ok()?;
        let tokens_ids = tokens.get_ids();
        if tokens_ids.is_empty() { return None; }

        let input = Tensor::new(&[tokens_ids], &self.device).ok()?;
        let hidden_states = model.forward_embeds(&input).ok()?;
        
        // Mean pooling
        let seq_len = tokens_ids.len() as f32;
        let summed = hidden_states.sum(1).ok()?;
        let mean = (summed / (seq_len as f64)).ok()?;
        
        // Normalize
        let norm = mean.sqr().ok()?.sum_keepdim(1).ok()?.sqrt().ok()?;
        let normalized = mean.broadcast_div(&norm).ok()?;
        
        normalized.squeeze(0).ok()?.to_vec1::<f32>().ok()
    }

    pub fn is_loaded(&self) -> bool {
        self.loaded
    }
}

fn mean_pool_and_normalize(hidden: Tensor) -> Option<Vec<f32>> {
    // Hidden is [1, seq_len, hidden_size]
    let seq_len = hidden.dim(1).ok()? as f64;
    let summed = hidden.sum(1).ok()?;
    let mean = (summed / seq_len).ok()?;
    let norm = mean.sqr().ok()?.sum_keepdim(1).ok()?.sqrt().ok()?;
    let normalized = mean.broadcast_div(&norm).ok()?;
    normalized.squeeze(0).ok()?.to_vec1::<f32>().ok()
}
