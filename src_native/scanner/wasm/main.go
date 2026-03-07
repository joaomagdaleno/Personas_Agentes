package main

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"syscall/js"
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

func analyzeContent(content string) FileAnalysis {
	lines := strings.Split(content, "\n")

	analysis := FileAnalysis{
		Path:   "wasm-input",
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

	return analysis
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

func parseContentWasm(this js.Value, args []js.Value) interface{} {
	if len(args) == 0 {
		return "[]"
	}
	content := args[0].String()
	analysis := analyzeContent(content)

	jsonStr, err := json.Marshal(analysis)
	if err != nil {
		return "{}"
	}
	return string(jsonStr)
}

func main() {
	fmt.Println("WASM Scanner Initialized.")
	js.Global().Set("parseContentWasm", js.FuncOf(parseContentWasm))
	select {} // Prevent exit
}
