package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

type AtomicUnit struct {
	Type string `json:"type"`
	Name string `json:"name"`
	Line int    `json:"line"`
}

type FileAnalysis struct {
	Path   string       `json:"path"`
	Exists bool         `json:"exists"`
	Units  []AtomicUnit `json:"units"`
}

var (
	pyClassRegex  = regexp.MustCompile(`^class\s+(\w+)`)
	pyDefRegex    = regexp.MustCompile(`^\s*def\s+(\w+)`)
	tsClassRegex  = regexp.MustCompile(`^export\s+class\s+(\w+)|^class\s+(\w+)`)
	tsMethodRegex = regexp.MustCompile(`^\s*(?:public|private|protected|static|async)*\s*(\w+)\s*\(`)
	tsFuncRegex   = regexp.MustCompile(`^export\s+function\s+(\w+)|^function\s+(\w+)|^const\s+(\w+)\s*=\s*\(|^const\s+(\w+)\s*=\s*function`)
)

func analyzeFile(path string, root string, isLegacy bool) (FileAnalysis, error) {
	rel, _ := filepath.Rel(root, path)
	rel = strings.ReplaceAll(rel, `\`, "/")

	file, err := os.Open(path)
	if err != nil {
		return FileAnalysis{}, err
	}
	defer file.Close()

	analysis := FileAnalysis{
		Path:   rel,
		Exists: true,
		Units:  []AtomicUnit{},
	}

	scanner := bufio.NewScanner(file)
	lineNum := 0
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()

		if isLegacy {
			// Python Analysis
			if m := pyClassRegex.FindStringSubmatch(line); m != nil {
				analysis.Units = append(analysis.Units, AtomicUnit{"class", m[1], lineNum})
			} else if m := pyDefRegex.FindStringSubmatch(line); m != nil {
				if !strings.HasPrefix(m[1], "__") {
					analysis.Units = append(analysis.Units, AtomicUnit{"function", m[1], lineNum})
				}
			}
		} else {
			// TypeScript Analysis
			if m := tsClassRegex.FindStringSubmatch(line); m != nil {
				name := m[1]
				if name == "" {
					name = m[2]
				}
				analysis.Units = append(analysis.Units, AtomicUnit{"class", name, lineNum})
			} else if m := tsMethodRegex.FindStringSubmatch(line); m != nil {
				name := m[1]
				ignore := map[string]bool{"constructor": true, "if": true, "for": true, "while": true, "switch": true, "catch": true}
				if !ignore[name] {
					analysis.Units = append(analysis.Units, AtomicUnit{"function", name, lineNum})
				}
			} else if m := tsFuncRegex.FindStringSubmatch(line); m != nil {
				name := m[1]
				if name == "" {
					name = m[2]
				}
				if name == "" {
					name = m[3]
				}
				if name == "" {
					name = m[4]
				}
				analysis.Units = append(analysis.Units, AtomicUnit{"function", name, lineNum})
			}
		}
	}

	return analysis, nil
}

func main() {
	dirPtr := flag.String("dir", ".", "Directory to scan")
	rootPtr := flag.String("root", ".", "Root directory for relative paths")
	legacyPtr := flag.Bool("legacy", false, "Scan as legacy Python files")
	flag.Parse()

	var results = []FileAnalysis{}
	var mu sync.Mutex
	var wg sync.WaitGroup

	err := filepath.Walk(*dirPtr, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil {
				name := info.Name()
				if name == "node_modules" || name == "__pycache__" || (strings.HasPrefix(name, ".") && name != ".") {
					return filepath.SkipDir
				}
			}
			return nil
		}

		ext := filepath.Ext(path)
		if (*legacyPtr && ext == ".py") || (!*legacyPtr && ext == ".ts") {
			if strings.Contains(path, "__init__") {
				return nil
			}

			wg.Add(1)
			go func(p string) {
				defer wg.Done()
				analysis, err := analyzeFile(p, *rootPtr, *legacyPtr)
				if err == nil {
					mu.Lock()
					results = append(results, analysis)
					mu.Unlock()
				}
			}(path)
		}
		return nil
	})

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error walking: %v\n", err)
		os.Exit(1)
	}

	wg.Wait()

	out, _ := json.Marshal(results)
	fmt.Println(string(out))
}
