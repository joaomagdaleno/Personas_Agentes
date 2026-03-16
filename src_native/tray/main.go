package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync/atomic"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/getlantern/systray"
	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/shirou/gopsutil/v4/process"
	"github.com/sqweek/dialog"
)

var (
	dbPath          string
	pendingAnalysis int32
)

func main() {
	cwd, _ := os.Getwd()
	dbPath = filepath.Join(cwd, "..", "..", "system_vault.db")
	projectRoot := filepath.Join(cwd, "..", "..")

	go startFileWatcher(projectRoot)

	systray.Run(onReady, onExit)
}

func startFileWatcher(root string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Println("Erro ao iniciar fsnotify:", err)
		return
	}

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) {
					ext := filepath.Ext(event.Name)
					if ext == ".ts" || ext == ".py" || ext == ".go" {
						atomic.StoreInt32(&pendingAnalysis, 1)
					}
				}
			case err, ok := <-watcher.Errors:
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
			name := info.Name()
			if name == "node_modules" || strings.HasPrefix(name, ".") || name == "target" || name == "build" || name == ".gemini" {
				return filepath.SkipDir
			}
			return watcher.Add(path)
		}
		return nil
	})
	if err != nil {
		log.Println("Walk error:", err)
	}
}

func onReady() {
	systray.SetIcon(iconData)
	systray.SetTitle("🏛️ Persona Agent")
	systray.SetTooltip("Sovereign Watcher (Go Native)")

	// --- GESTÃO DE TESTES E QA ---
	mQAStatus := systray.AddMenuItem("📊 QA: Calculando...", "Quantidade de arquivos testados versus não testados")
	mQAStatus.Disable() // Just for info display
	
	mGenTests := systray.AddMenuItem("🧪 Iniciar Geração de Testes (Auto-PhD)", "Inicia arquitetura de geração para cobrir os sem teste")
	mTestTasks := systray.AddMenuItem("📋 Ver Tarefas de Testes (Fila)", "Mostra o histórico reativo de QA Generation")

	systray.AddSeparator()

	// --- AÇÕES DE SAÚDE ---
	mHealth := systray.AddMenuItem("Vitalidade (Health 360)", "Exibe o status de recursos e saúde do sistema")
	mAudit := systray.AddMenuItem("Forçar Auditoria Global", "Inicia varredura completa (TypeScript Kernel)")
	
	// --- AÇÕES RESILIENTES ---
	mHeal := systray.AddMenuItem("Acionar Auto-Cura (Healer)", "Ativa Agentes para sanar problemas conhecidos")
	
	systray.AddSeparator()
	
	// --- AÇÕES DE WORKFLOW ---
	mDash := systray.AddMenuItem("🌐 Abrir Governance Portal", "Abre o dashboard da frota no navegador")
	mDir  := systray.AddMenuItem("📂 Abrir Diretório Fonte", "Explorar os arquivos do Core")
	mSyncTask := systray.AddMenuItem("⏱️ Última Ação Executada", "Mostra em que os Agentes trabalharam por último")

	systray.AddSeparator()
	mProjects := systray.AddMenuItem("Gerir Projetos (Legado)", "Abre o gestor de projetos DB")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Sair", "Encerra o agente")

	go func() {
		for {
			select {
			case <-mGenTests.ClickedCh:
				dialog.Message("O Orchestrator começará a gerar os testes para os arquivos pendentes em background.").Title("🧪 Geração Iniciada").Info()
				cwd, _ := os.Getwd()
				projectRoot := filepath.Join(cwd, "..", "..")
				go func() {
					cmd := exec.Command("bun", "run", "verify_p12.ts")
					cmd.Dir = projectRoot
					cmd.Start()
				}()
			case <-mTestTasks.ClickedCh:
				go fetchTestTasks()
			case <-mHealth.ClickedCh:
				go fetchHealth()
			case <-mAudit.ClickedCh:
				go triggerAction("audit", "🚀 Auditoria Acionada", "O Sovereign Kernel está examinando todos os módulos do projeto em background.")
			case <-mHeal.ClickedCh:
				go triggerAction("heal", "💉 Auto-Cura Acionada", "A Persona Healer está trabalhando silenciosamente para corrigir dívidas técnicas.")
			case <-mDash.ClickedCh:
				go openURL("http://localhost:5173")
			case <-mDir.ClickedCh:
				cwd, _ := os.Getwd()
				projectRoot := filepath.Join(cwd, "..", "..")
				go openDir(projectRoot)
			case <-mSyncTask.ClickedCh:
				go fetchLastTask()
			case <-mProjects.ClickedCh:
				projects := getProjectsString()
				dialog.Message("%s", projects).Title("🏛️ Gestor de Projetos").Info()
			case <-mQuit.ClickedCh:
				systray.Quit()
				return
			}
		}
	}()

	// Background Monitor Loop
	go monitorLoop()
	
	// QA Status updater
	cwd, _ := os.Getwd()
	projectRoot := filepath.Join(cwd, "..", "..")
	go updateQAStatus(mQAStatus, projectRoot)
}

func updateQAStatus(m *systray.MenuItem, root string) {
	for {
		tests, noTests := 0, 0
		filepath.Walk(filepath.Join(root, "src_local"), func(path string, info os.FileInfo, err error) error {
			if err != nil || info == nil {
				return nil
			}
			if info.IsDir() {
				name := info.Name()
				if name == "node_modules" || strings.HasPrefix(name, ".") {
					return filepath.SkipDir
				}
				return nil
			}
			name := info.Name()
			if strings.HasSuffix(name, ".ts") {
				if strings.HasSuffix(name, ".test.ts") {
					return nil
				}
				testPath := strings.TrimSuffix(path, ".ts") + ".test.ts"
				if _, err := os.Stat(testPath); err == nil {
					tests++
				} else {
					noTests++
				}
			}
			return nil
		})
		
		title := fmt.Sprintf("📊 QA: %d testados / %d sem teste", tests, noTests)
		m.SetTitle(title)
		
		time.Sleep(30 * time.Second)
	}
}

func fetchHealth() {
	resp, err := http.Get("http://localhost:8080/health")
	if err != nil {
		dialog.Message("O Hub local não está respondendo. Certifique-se de que o Kernel via Bun está rodando.").Title("❌ Erro de Conexão").Error()
		return
	}
	defer resp.Body.Close()

	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err == nil {
		cpu := data["cpu"].(float64)
		mem := data["memory"].(float64)
		grts := data["goroutines"].(float64)
		status := data["status"].(string)

		msg := fmt.Sprintf("🌟 Status: %s\n\n🧠 CPU Load: %.1f%%\n💾 RAM Em Uso: %.1f%%\n🧬 GoRoutines Ativas: %.0f", status, cpu, mem, grts)
		dialog.Message("%s", msg).Title("📊 Sovereign Health 360").Info()
	} else {
		dialog.Message("Falha ao decodificar telemetria.").Title("⚠️ Erro").Error()
	}
}

func triggerAction(endpoint string, title string, desc string) {
	resp, err := http.Get("http://localhost:8080/" + endpoint)
	if err != nil {
		dialog.Message("O Hub local não está respondendo. O Sovereign Kernel (Bun) está rodando?").Title("❌ Erro").Error()
		return
	}
	defer resp.Body.Close()

	var data map[string]bool
	if err := json.NewDecoder(resp.Body).Decode(&data); err == nil && data["success"] {
		dialog.Message("%s", desc).Title(title).Info()
	}
}

func openURL(url string) {
	err := exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	if err != nil {
		dialog.Message("Não foi possível abrir o navegador.").Title("⚠️ Erro").Error()
	}
}

func openDir(path string) {
	err := exec.Command("explorer", path).Start()
	if err != nil {
		dialog.Message("Não foi possível abrir o diretório.").Title("⚠️ Erro").Error()
	}
}

func fetchLastTask() {
	resp, err := http.Get("http://localhost:8080/intelligence/tasks")
	if err != nil {
		dialog.Message("O Hub local não está respondendo. O Sovereign Kernel (Bun) está rodando?").Title("❌ Erro").Error()
		return
	}
	defer resp.Body.Close()

	var tasks []struct {
		TaskType   string `json:"task_type"`
		TargetFile string `json:"target_file"`
		Status     string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tasks); err == nil && len(tasks) > 0 {
		t := tasks[0]
		msg := fmt.Sprintf("Tarefa: %s\nAlvo: %s\nStatus: %s", t.TaskType, t.TargetFile, t.Status)
		dialog.Message("%s", msg).Title("⏱️ Última Ação da IA").Info()
	} else {
		dialog.Message("Nenhuma tarefa recente encontrada ou histórico vazio.").Title("⏱️ Info").Info()
	}
}

func fetchTestTasks() {
	resp, err := http.Get("http://localhost:8080/intelligence/tasks")
	if err != nil {
		dialog.Message("O Hub local não está respondendo.").Title("❌ Erro").Error()
		return
	}
	defer resp.Body.Close()

	var tasks []struct {
		TaskType   string `json:"task_type"`
		TargetFile string `json:"target_file"`
		Status     string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tasks); err == nil {
		var sb strings.Builder
		sb.WriteString("Últimas tarefas da fila de Testes e QA:\n\n")
		count := 0
		for _, t := range tasks {
			if strings.Contains(strings.ToLower(t.TaskType), "test") || strings.Contains(strings.ToLower(t.TaskType), "qa") || t.TaskType == "" {
				// Show all if the DB didn't explicitly label TEST_GENERATION, Or fallback
				sb.WriteString(fmt.Sprintf("- [%s] %s (%s)\n", t.Status, filepath.Base(t.TargetFile), t.TaskType))
				count++
				if count >= 10 {
					break
				}
			}
		}
		if count == 0 {
			// fallback
			for i, t := range tasks {
				sb.WriteString(fmt.Sprintf("- [%s] %s\n", t.Status, filepath.Base(t.TargetFile)))
				if i >= 10 { break }
			}
		}
		dialog.Message("%s", sb.String()).Title("📋 Histórico de Tarefas QA").Info()
	} else {
		dialog.Message("Falha ao ler o histórico das tarefas.").Title("⚠️ Erro").Error()
	}
}

func onExit() {
	// Cleanup if needed
}

func monitorLoop() {
	for {
		idle := GetIdleTime()
		pid, title := GetActiveWindowInfo()

		appName := getAppName(pid)
		category := classifyActivity(appName, title)

		if idle > 300 {
			fmt.Printf("🌙 [Idle] Sistema ocioso há %.0fs. Modo Deep.\n", idle)
			if atomic.LoadInt32(&pendingAnalysis) == 1 {
				fmt.Println("🚀 Acionando diagnóstico de fundo inteligente via Hub...")
				go func() {
					resp, err := http.Get("http://localhost:8080/scan?dir=./src_local")
					if err == nil {
						resp.Body.Close()
						fmt.Println("✅ Diagnóstico WASM/Hub assíncrono concluído silenciosamente.")
						// Reset flag
						atomic.StoreInt32(&pendingAnalysis, 0)
					}
				}()
			}
		} else {
			fmt.Printf("👀 [Active] %s (%s) - Contexto: %s\n", appName, title, category)
		}

		time.Sleep(10 * time.Second)
	}
}

func getAppName(pidStr string) string {
	var pid int32
	fmt.Sscanf(pidStr, "%d", &pid)
	p, err := process.NewProcess(pid)
	if err != nil {
		return "Unknown"
	}
	name, _ := p.Name()
	return name
}

func classifyActivity(app, title string) string {
	appL := strings.ToLower(app)
	titleL := strings.ToLower(title)

	devApps := []string{"code", "powershell", "cmd", "wt", "pycharm", "cursor", "gh"}
	for _, a := range devApps {
		if strings.Contains(appL, a) {
			return "DEV"
		}
	}

	browsers := []string{"chrome", "msedge", "firefox", "brave"}
	for _, b := range browsers {
		if strings.Contains(appL, b) {
			if strings.Contains(titleL, "youtube") || strings.Contains(titleL, "netflix") {
				return "MEDIA"
			}
			return "BROWSING"
		}
	}

	games := []string{"steam", "valorant", "cs2", "minecraft"}
	for _, g := range games {
		if strings.Contains(appL, g) {
			return "GAMING"
		}
	}

	return "GENERAL"
}

func getProjectsString() string {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return "Erro ao abrir banco de dados."
	}
	defer db.Close()

	rows, err := db.Query("SELECT name, health_score FROM projects")
	if err != nil {
		return "Nenhum projeto encontrado ou erro na query."
	}
	defer rows.Close()

	var sb strings.Builder
	sb.WriteString("Projetos Ativos:\n\n")
	for rows.Next() {
		var name string
		var score float64
		rows.Scan(&name, &score)
		sb.WriteString(fmt.Sprintf("📂 %s - Saúde: %.0f%%\n", name, score))
	}
	return sb.String()
}

func listProjects() {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT name, path, health_score FROM projects")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var name, path string
		var score float64
		rows.Scan(&name, &path, &score)
		fmt.Printf("📂 Projeto: %s (%s) - Saúde: %.0f%%\n", name, path, score)
	}
}
