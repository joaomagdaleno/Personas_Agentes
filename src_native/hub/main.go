package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

// ... [Keep types and other methods as they are]

func (h *Hub) handleAnalyze(w http.ResponseWriter, r *http.Request) {
	targetPath := r.URL.Query().Get("file")
	if targetPath == "" {
		http.Error(w, "Missing 'file' parameter", http.StatusBadRequest)
		return
	}

	info, err := os.Stat(targetPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Path error: %v", err), http.StatusNotFound)
		return
	}

	var results []interface{}

	if info.IsDir() {
		filepath.Walk(targetPath, func(path string, info os.FileInfo, err error) error {
			if err != nil || info.IsDir() {
				return nil
			}
			ext := filepath.Ext(path)
			if ext == ".ts" || ext == ".js" || ext == ".py" || ext == ".go" {
				res := h.runAnalysis(path)
				if res != nil {
					results = append(results, res)
				}
			}
			return nil
		})
	} else {
		res := h.runAnalysis(targetPath)
		if res != nil {
			results = append(results, res)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if !info.IsDir() && len(results) == 1 {
		json.NewEncoder(w).Encode(results[0])
	} else {
		json.NewEncoder(w).Encode(results)
	}
}

func (h *Hub) runAnalysis(path string) interface{} {
	cmd := exec.Command(h.analyzerPath, path)
	output, err := cmd.Output()
	if err != nil {
		log.Printf("Analyzer error for %s: %v", path, err)
		return nil
	}
	var res interface{}
	if err := json.Unmarshal(output, &res); err != nil {
		return nil
	}
	return res
}

type SystemMetrics struct {
	CPUUsage    float64       `json:"cpu_usage"`
	MemoryUsage float64       `json:"memory_usage"`
	GoRoutines  int           `json:"goroutines"`
	HeavyProcs  []ProcessInfo `json:"heavy_processes"`
	Timestamp   time.Time     `json:"timestamp"`
}

type ProcessInfo struct {
	Name   string  `json:"name"`
	PID    int32   `json:"pid"`
	MemMB  float64 `json:"mem_mb"`
	CPUPct float64 `json:"cpu_percent"`
}

type Hub struct {
	metrics      SystemMetrics
	metricsLock  sync.RWMutex
	analyzerPath string
	watcher      *fsnotify.Watcher
}

func (h *Hub) startWatcher(root string) {
	var err error
	h.watcher, err = fsnotify.NewWatcher()
	if err != nil {
		log.Fatal(err)
	}
	defer h.watcher.Close()

	go func() {
		for {
			select {
			case event, ok := <-h.watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) {
					log.Printf("File modified: %s. Scheduling analysis...", event.Name)
				}
			case err, ok := <-h.watcher.Errors:
				if !ok {
					return
				}
				log.Println("watcher error:", err)
			}
		}
	}()

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return h.watcher.Add(path)
		}
		return nil
	})
	if err != nil {
		log.Println("Walk error:", err)
	}

	select {} // Block
}

func (h *Hub) startSentinel() {
	ticker := time.NewTicker(3 * time.Second)
	for range ticker.C {
		cpuPerc, _ := cpu.Percent(time.Second, false)
		memStat, _ := mem.VirtualMemory()

		var cpuVal float64
		if len(cpuPerc) > 0 {
			cpuVal = cpuPerc[0]
		}

		procs, _ := process.Processes()
		var heavy []ProcessInfo
		for _, p := range procs {
			m, _ := p.MemoryInfo()
			if m != nil {
				memMB := float64(m.RSS) / (1024 * 1024)
				if memMB > 200 {
					name, _ := p.Name()
					cpuP, _ := p.CPUPercent()
					heavy = append(heavy, ProcessInfo{
						Name:   name,
						PID:    p.Pid,
						MemMB:  memMB,
						CPUPct: cpuP,
					})
				}
			}
		}

		h.metricsLock.Lock()
		h.metrics = SystemMetrics{
			CPUUsage:    cpuVal,
			MemoryUsage: memStat.UsedPercent,
			GoRoutines:  runtime.NumGoroutine(),
			HeavyProcs:  heavy,
			Timestamp:   time.Now(),
		}
		h.metricsLock.Unlock()
	}
}

func (h *Hub) handleStatus(w http.ResponseWriter, r *http.Request) {
	h.metricsLock.RLock()
	defer h.metricsLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "HEALTHY",
		"metrics": h.metrics,
		"version": "1.0.0-hub",
	})
}

func main() {
	port := flag.String("port", "8080", "Port to listen on")
	flag.Parse()

	// Locate analyzer relative to executable
	exePath := filepath.Join("..", "analyzer", "target", "release", "analyzer.exe")
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		// Fallback to simpler relative path if run from root
		exePath = filepath.Join("src_native", "analyzer", "target", "release", "analyzer.exe")
	}

	hub := &Hub{
		analyzerPath: exePath,
	}
	go hub.startSentinel()
	go hub.startWatcher("../..") // Watch project root

	http.HandleFunc("/status", hub.handleStatus)
	http.HandleFunc("/health", hub.handleStatus)
	http.HandleFunc("/analyze", hub.handleAnalyze)

	log.Printf("🚀 Native Sovereign Hub (Analysis-Only) starting on :%s", *port)
	log.Printf("🧪 Analyzer linked at: %s", exePath)
	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatalf("Failed to start Hub: %v", err)
	}
}
