package main

import (
	"encoding/json"
	"testing"
	"time"
)

func TestSystemHealthSerialization(t *testing.T) {
	health := SystemHealth{
		CPUUsage:     45.5,
		MemoryUsage:  60.2,
		MemoryFreeGB: 8.5,
		HeavyProcess: []ProcessInfo{
			{Name: "chrome", PID: 1234, MemMB: 500.0, CPU: 10.5},
		},
		Timestamp: time.Now().Unix(),
	}

	out, err := json.Marshal(health)
	if err != nil {
		t.Fatalf("Failed to marshal SystemHealth: %v", err)
	}

	var decoded SystemHealth
	if err := json.Unmarshal(out, &decoded); err != nil {
		t.Fatalf("Failed to unmarshal SystemHealth: %v", err)
	}

	if decoded.CPUUsage != 45.5 {
		t.Errorf("Expected CPUUsage 45.5, got %f", decoded.CPUUsage)
	}
	if len(decoded.HeavyProcess) != 1 {
		t.Errorf("Expected 1 HeavyProcess, got %d", len(decoded.HeavyProcess))
	}
	if decoded.HeavyProcess[0].Name != "chrome" {
		t.Errorf("Expected process name chrome, got %s", decoded.HeavyProcess[0].Name)
	}
}
