package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestIntentRegexes(t *testing.T) {
	tests := []struct {
		intent  string
		content string
		match   bool
	}{
		{"METADATA", "These are some rules and manifest files.", true},
		{"OBSERVABILITY", "console.log('test')", true},
		{"TECH/MATH", "Math.sin(0)", true},
		{"INFRASTRUCTURE", "fs.readFile('data.txt')", true},
		{"OBSERVABILITY", "just regular logic", false},
	}

	for _, tt := range tests {
		re, ok := intentRegexes[tt.intent]
		if !ok {
			t.Fatalf("Intent %s not found in regex map", tt.intent)
		}
		if re.MatchString(tt.content) != tt.match {
			t.Errorf("Expected match=%v for intent %s on content '%s'", tt.match, tt.intent, tt.content)
		}
	}
}

func TestAnalyzeFileMetadata(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "test.ts")
	content := `// This is a test
console.log("hello");
function test() {}
`
	err := os.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		t.Fatalf("Failed to write temp file: %v", err)
	}

	analysis, err := analyzeFileMetadata(filePath, tmpDir)
	if err != nil {
		t.Fatalf("Failed to analyze metadata: %v", err)
	}

	if !analysis.Exists {
		t.Errorf("Expected file to exist")
	}
	if analysis.Loc != 4 { // 3 lines of code + 1 trailing newline
		t.Errorf("Expected Loc=4, got %d", analysis.Loc)
	}
	if analysis.Intent != "OBSERVABILITY" {
		t.Errorf("Expected intent OBSERVABILITY, got %s", analysis.Intent)
	}
}
