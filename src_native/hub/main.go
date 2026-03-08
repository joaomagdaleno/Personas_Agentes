package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"database/sql"

	pb "personas-agentes/hub/proto"

	"google.golang.org/grpc"

	"github.com/fsnotify/fsnotify"
	"github.com/kardianos/service"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	_ "modernc.org/sqlite"
)

type FileAnalysis struct {
	Path     string `json:"path"`
	Exists   bool   `json:"exists"`
	Loc      int    `json:"loc"`
	Sloc     int    `json:"sloc"`
	Comments int    `json:"comments"`
	Intent   string `json:"intent"`
}

var (
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
		Loc:    len(lines),
	}

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if strings.HasPrefix(trimmed, "//") || strings.HasPrefix(trimmed, "/*") || strings.HasPrefix(trimmed, "*") {
			analysis.Comments++
			continue
		}
		analysis.Sloc++
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
	pb.UnimplementedHubServiceServer
	metrics      SystemMetrics
	metricsLock  sync.RWMutex
	analyzerPath string
	watcher      *fsnotify.Watcher
	clients      map[chan string]bool
	clientsLock  sync.Mutex
	broadcast    chan string
	db           *sql.DB
	service      service.Service
	port         *string
}

type Task struct {
	ID         int    `json:"id"`
	TaskType   string `json:"task_type"`
	TargetFile string `json:"target_file"`
	Status     string `json:"status"`
	Result     string `json:"result"`
	CreatedAt  string `json:"created_at"`
}

func (h *Hub) initDB(projectRoot string) {
	dbPath := filepath.Join(projectRoot, "system_vault.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	h.db = db

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS ai_tasks (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		task_type TEXT,
		target_file TEXT,
		status TEXT DEFAULT 'PENDING',
		result TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		log.Fatalf("Failed to init DB table: %v", err)
	}
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
				if event.Has(fsnotify.Write) || event.Has(fsnotify.Create) || event.Has(fsnotify.Remove) {
					log.Printf("File event: %v", event)
					h.broadcast <- event.Name
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

		// Broadcast health update
		metricsJSON, _ := json.Marshal(map[string]interface{}{
			"type":    "HEALTH_UPDATE",
			"metrics": h.metrics,
		})
		h.broadcast <- string(metricsJSON)

		// Proactive Alerts
		if cpuVal > 80.0 || memStat.UsedPercent > 80.0 {
			alertJSON, _ := json.Marshal(map[string]interface{}{
				"type":    "HEALTH_ALERT",
				"message": "Resource usage high",
				"cpu":     cpuVal,
				"mem":     memStat.UsedPercent,
			})
			h.broadcast <- string(alertJSON)
		}
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

func (h *Hub) handleWatch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	clientChan := make(chan string)
	h.clientsLock.Lock()
	if h.clients == nil {
		h.clients = make(map[chan string]bool)
	}
	h.clients[clientChan] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, clientChan)
		h.clientsLock.Unlock()
		close(clientChan)
	}()

	notify := w.(http.CloseNotifier).CloseNotify()

	for {
		select {
		case msg := <-clientChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			w.(http.Flusher).Flush()
		case <-notify:
			return
		}
	}
}

func (h *Hub) handleQueueAdd(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err := h.db.Exec("INSERT INTO ai_tasks (task_type, target_file) VALUES (?, ?)", t.TaskType, t.TargetFile)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	h.broadcast <- fmt.Sprintf("TASK_QUEUED: %s", t.TargetFile)
	w.WriteHeader(http.StatusCreated)
}

func (h *Hub) handleQueuePending(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query("SELECT id, task_type, target_file, status, created_at FROM ai_tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 10")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var t Task
		rows.Scan(&t.ID, &t.TaskType, &t.TargetFile, &t.Status, &t.CreatedAt)
		tasks = append(tasks, t)
	}
	json.NewEncoder(w).Encode(tasks)
}

func (h *Hub) handleQueueUpdate(w http.ResponseWriter, r *http.Request) {
	var t Task
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_, err := h.db.Exec("UPDATE ai_tasks SET status = ?, result = ? WHERE id = ?", t.Status, t.Result, t.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	h.broadcast <- fmt.Sprintf("TASK_UPDATED: %d -> %s", t.ID, t.Status)
}

func (h *Hub) startBroadcaster() {
	h.broadcast = make(chan string)
	for {
		msg := <-h.broadcast
		h.clientsLock.Lock()
		for client := range h.clients {
			select {
			case client <- msg:
			default:
				// Skip if client is slow
			}
		}
		h.clientsLock.Unlock()
	}
}

// Windows Service Support
type program struct {
	hub *Hub
}

func (p *program) Start(s service.Service) error {
	go p.run()
	return nil
}

// gRPC Implementation
func (h *Hub) GetStatus(ctx context.Context, in *pb.Empty) (*pb.StatusResponse, error) {
	h.metricsLock.RLock()
	defer h.metricsLock.RUnlock()

	return &pb.StatusResponse{
		Status:  "HEALTHY",
		Version: "2.0.0-grpc",
		Health: &pb.HealthUpdate{
			CpuUsage:    h.metrics.CPUUsage,
			MemoryUsage: h.metrics.MemoryUsage,
			Goroutines:  int32(h.metrics.GoRoutines),
			Timestamp:   h.metrics.Timestamp.Format(time.RFC3339),
		},
	}, nil
}

func (h *Hub) WatchHealth(in *pb.Empty, stream pb.HubService_WatchHealthServer) error {
	clientChan := make(chan string)
	h.clientsLock.Lock()
	if h.clients == nil {
		h.clients = make(map[chan string]bool)
	}
	h.clients[clientChan] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, clientChan)
		h.clientsLock.Unlock()
	}()

	for {
		select {
		case msg := <-clientChan:
			if strings.Contains(msg, "HEALTH_UPDATE") {
				var data map[string]interface{}
				json.Unmarshal([]byte(msg), &data)
				metrics := data["metrics"].(map[string]interface{})
				stream.Send(&pb.HealthUpdate{
					CpuUsage:    metrics["cpu_usage"].(float64),
					MemoryUsage: metrics["memory_usage"].(float64),
					Goroutines:  int32(metrics["goroutines"].(float64)),
					Timestamp:   time.Now().Format(time.RFC3339),
				})
			}
		case <-stream.Context().Done():
			return nil
		}
	}
}

func (h *Hub) WatchEvents(in *pb.Empty, stream pb.HubService_WatchEventsServer) error {
	clientChan := make(chan string)
	h.clientsLock.Lock()
	h.clients[clientChan] = true
	h.clientsLock.Unlock()

	defer func() {
		h.clientsLock.Lock()
		delete(h.clients, clientChan)
		h.clientsLock.Unlock()
	}()

	for {
		select {
		case msg := <-clientChan:
			if !strings.Contains(msg, "HEALTH_UPDATE") {
				stream.Send(&pb.Event{
					Type: "FILE_EVENT",
					Path: msg,
				})
			}
		case <-stream.Context().Done():
			return nil
		}
	}
}

func (h *Hub) ScanProject(ctx context.Context, in *pb.ScanRequest) (*pb.ScanResponse, error) {
	var results []*pb.FileMetadata
	var mu sync.Mutex
	var wg sync.WaitGroup

	err := filepath.Walk(in.Directory, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil && info.IsDir() {
				name := info.Name()
				if name == "node_modules" || (strings.HasPrefix(name, ".") && name != ".") {
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
				analysis, er := analyzeFileMetadata(p, in.Root)
				if er == nil {
					mu.Lock()
					results = append(results, &pb.FileMetadata{
						Path:     analysis.Path,
						Loc:      int32(analysis.Loc),
						Sloc:     int32(analysis.Sloc),
						Comments: int32(analysis.Comments),
						Intent:   analysis.Intent,
					})
					mu.Unlock()
				}
			}(path)
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	wg.Wait()
	return &pb.ScanResponse{Files: results}, nil
}

func (h *Hub) AnalyzeFile(ctx context.Context, in *pb.AnalyzeRequest) (*pb.AnalyzeResponse, error) {
	res := h.runAnalysis(in.File)
	if res == nil {
		return nil, fmt.Errorf("analysis failed")
	}
	data, _ := json.Marshal(res)
	return &pb.AnalyzeResponse{JsonData: string(data)}, nil
}

func (h *Hub) EnqueueTask(ctx context.Context, in *pb.TaskRequest) (*pb.TaskResponse, error) {
	_, err := h.db.Exec("INSERT INTO ai_tasks (task_type, target_file) VALUES (?, ?)", in.TaskType, in.TargetFile)
	if err != nil {
		return nil, err
	}
	return &pb.TaskResponse{Success: true}, nil
}

func (h *Hub) GetPendingTasks(ctx context.Context, in *pb.PendingRequest) (*pb.PendingResponse, error) {
	rows, err := h.db.Query("SELECT id, task_type, target_file, status, created_at FROM ai_tasks WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ?", in.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*pb.Task
	for rows.Next() {
		var t Task
		rows.Scan(&t.ID, &t.TaskType, &t.TargetFile, &t.Status, &t.CreatedAt)
		tasks = append(tasks, &pb.Task{
			Id:         int32(t.ID),
			TaskType:   t.TaskType,
			TargetFile: t.TargetFile,
			Status:     t.Status,
			CreatedAt:  t.CreatedAt,
		})
	}
	return &pb.PendingResponse{Tasks: tasks}, nil
}

func (h *Hub) UpdateTask(ctx context.Context, in *pb.UpdateTaskRequest) (*pb.Empty, error) {
	_, err := h.db.Exec("UPDATE ai_tasks SET status = ?, result = ? WHERE id = ?", in.Status, in.Result, in.TaskId)
	if err != nil {
		return nil, err
	}
	h.broadcast <- fmt.Sprintf("TASK_UPDATED: %d -> %s", in.TaskId, in.Status)
	return &pb.Empty{}, nil
}

func (p *program) run() {
	p.hub.initDB("../..")
	go p.hub.startSentinel()
	go p.hub.startBroadcaster()
	go p.hub.startWatcher("../..")

	// gRPC Server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	pb.RegisterHubServiceServer(grpcServer, p.hub)
	go func() {
		log.Printf("📡 gRPC Server listening on :50051")
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("failed to serve: %v", err)
		}
	}()

	// Keep HTTP for legacy calls
	http.HandleFunc("/status", p.hub.handleStatus)
	http.HandleFunc("/analyze", p.hub.handleAnalyze)
	http.HandleFunc("/scan", p.hub.handleScan)
	http.HandleFunc("/watch", p.hub.handleWatch)

	log.Printf("🚀 Hub Service starting on :%s", *p.hub.port)
	http.ListenAndServe(":"+*p.hub.port, nil)
}

func (p *program) Stop(s service.Service) error {
	return nil
}

func main() {
	action := flag.String("service", "", "Control the system service: install, uninstall, start, stop")
	port := flag.String("port", "8080", "Port to listen on")
	flag.Parse()

	svcConfig := &service.Config{
		Name:        "SovereignHub",
		DisplayName: "Native Sovereign Hub",
		Description: "Persistência e Análise Nativa para Personas Agentes.",
	}

	exePath := filepath.Join("..", "analyzer", "target", "release", "analyzer.exe")
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		exePath = filepath.Join("src_native", "analyzer", "target", "release", "analyzer.exe")
	}

	hub := &Hub{
		analyzerPath: exePath,
		port:         port,
	}

	prg := &program{hub: hub}
	s, err := service.New(prg, svcConfig)
	if err != nil {
		log.Fatal(err)
	}
	hub.service = s

	if *action != "" {
		err := service.Control(s, *action)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Service %s successfully\n", *action)
		return
	}

	if err := s.Run(); err != nil {
		log.Fatal(err)
	}
}
