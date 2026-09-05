# 🧠 Diretório de Modelos SLM Locais (GGUF)

Coloque aqui os arquivos de modelo em formato `.gguf` para inferência local soberana via Llama.cpp.

### Modelos recomendados para AMD Ryzen 7 5825U (16GB RAM):
1. **Ultra-rápido (background / agentes):** `qwen2.5-coder-1.5b-instruct-q4_k_m.gguf` (~1.1 GB)
2. **Desenvolvimento e Código completo:** `qwen2.5-coder-7b-instruct-q4_k_m.gguf` (~4.7 GB)
3. **Raciocínio analítico:** `DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf` (~1.2 GB)

O motor [`WarmPurgeOfflineEngine`](../src_local/utils/ai/warm_purge_offline_engine.ts) carrega automaticamente o modelo configurado na variável de ambiente `LOCAL_SLM_MODEL`.
