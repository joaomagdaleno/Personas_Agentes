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
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

type AtomicUnit struct {
	Type                string `json:"type"`
	Name                string `json:"name"`
	Parent              string `json:"parent,omitempty"`
	Line                int    `json:"line"`
	Complexity          int    `json:"complexity"`
	CognitiveComplexity int    `json:"cognitive_complexity"`
	Intent              string `json:"intent"`
}

type FileAnalysis struct {
	Path                string       `json:"path"`
	Exists              bool         `json:"exists"`
	Units               []AtomicUnit `json:"units"`
	TotalComplexity     int          `json:"total_complexity"`
	CognitiveComplexity int          `json:"cognitive_complexity"`
	MaxNesting          int          `json:"max_nesting"`
	Loc                 int          `json:"loc"`
	Sloc                int          `json:"sloc"`
	Comments            int          `json:"comments"`
	Intent              string       `json:"intent"`
}

var (
	classRegex     = regexp.MustCompile(`class\s+(\w+)`)
	methodRegex    = regexp.MustCompile(`(?:(public|private|protected|static|async)\s+)?(\w+)\s*\(([^)]*)\)`)
	funcRegex      = regexp.MustCompile(`function\s+(\w+)`)
	arrowFuncRegex = regexp.MustCompile(`const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>`)

	intentRegexes = map[string]*regexp.Regexp{
		"METADATA":       regexp.MustCompile(`(?i)rules|patterns|regex|manifest|metadata|diretriz|heuristics`),
		"OBSERVABILITY":  regexp.MustCompile(`(?i)logger|log|console|telemetry|winston`),
		"TECH/MATH":      regexp.MustCompile(`(?i)\b(alpha|progress|offset|lerp|sin|cos|tan)\b`),
		"INFRASTRUCTURE": regexp.MustCompile(`(?i)fs\.|path\.|join\(|existsSync|readdir|readFile`),
	}
)

func analyzeFileMetadata(path string, root string) (FileAnalysis, error) {
	rel, _ := filepath.Rel(root, path)
	rel = strings.ReplaceAll(rel, `\`, "/")

	contentBytes, err := os.ReadFile(path)
	if err != nil {
		return FileAnalysis{}, err
	}
	content := string(contentBytes)
	lines := strings.Split(content, "\n")

	analysis := FileAnalysis{
		Path:   rel,
		Exists: true,
		Units:  []AtomicUnit{},
		Loc:    len(lines),
	}

	currentClass := ""

	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if strings.HasPrefix(trimmed, "//") || strings.HasPrefix(trimmed, "/*") || strings.HasPrefix(trimmed, "*") {
			analysis.Comments++
			continue
		}
		analysis.Sloc++

		if m := classRegex.FindStringSubmatch(line); m != nil {
			currentClass = m[1]
			analysis.Units = append(analysis.Units, AtomicUnit{
				Type: "class",
				Name: currentClass,
				Line: i + 1,
			})
		} else if m := funcRegex.FindStringSubmatch(line); m != nil {
			analysis.Units = append(analysis.Units, AtomicUnit{
				Type: "function",
				Name: m[1],
				Line: i + 1,
			})
		} else if m := arrowFuncRegex.FindStringSubmatch(line); m != nil {
			analysis.Units = append(analysis.Units, AtomicUnit{
				Type: "function",
				Name: m[1],
				Line: i + 1,
			})
		} else if m := methodRegex.FindStringSubmatch(line); m != nil {
			name := m[2]
			if !isKeyword(name) && currentClass != "" {
				analysis.Units = append(analysis.Units, AtomicUnit{
					Type:   "method",
					Name:   name,
					Parent: currentClass,
					Line:   i + 1,
				})
			}
		}
	}

	analysis.Intent = "LOGIC"
	for intent, re := range intentRegexes {
		if re.MatchString(content) {
			analysis.Intent = intent
			break
		}
	}

	return analysis, nil
}

func isKeyword(s string) bool {
	keywords := []string{"if", "for", "while", "const", "let", "var", "return", "switch", "catch", "import", "export"}
	for _, kw := range keywords {
		if s == kw {
			return true
		}
	}
	return false
}

func (h *Hub) handleScan(w http.ResponseWriter, r *http.Request) {
	targetDir := r.URL.Query().Get("dir")
	targetFile := r.URL.Query().Get("file")
	rootDir := r.URL.Query().Get("root")
	if rootDir == "" {
		rootDir = "."
	}

	if targetFile != "" {
		analysis, err := analyzeFileMetadata(targetFile, rootDir)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]FileAnalysis{analysis})
		return
	}

	if targetDir == "" {
		http.Error(w, "Missing 'dir' or 'file' parameter", http.StatusBadRequest)
		return
	}

	var results []FileAnalysis
	var mu sync.Mutex
	var wg sync.WaitGroup

	err := filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil {
				name := info.Name()
				if name == "node_modules" || strings.HasPrefix(name, ".") && name != "." {
					return filepath.SkipDir
				}
			}
			return nil
		}

		ext := filepath.Ext(path)
		if ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".py" || ext == ".go" {
			wg.Add(1)
			go func(p string) {
				defer wg.Done()
				analysis, er := analyzeFileMetadata(p, rootDir)
				if er == nil {
					mu.Lock()
					results = append(results, analysis)
					mu.Unlock()
				}
			}(path)
		}
		return nil
	})

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	wg.Wait()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

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
	http.HandleFunc("/scan", hub.handleScan)

	log.Printf("🚀 Native Sovereign Hub (Analysis-Only) starting on :%s", *port)
	log.Printf("🧪 Analyzer linked at: %s", exePath)
	if err := http.ListenAndServe(":"+*port, nil); err != nil {
		log.Fatalf("Failed to start Hub: %v", err)
	}
}
