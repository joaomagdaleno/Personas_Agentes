package main

import (
	"fmt"
	"syscall"
	"unsafe"
)

var (
	user32            = syscall.NewLazyDLL("user32.dll")
	kernel32          = syscall.NewLazyDLL("kernel32.dll")
	procGetLastInput  = user32.NewProc("GetLastInputInfo")
	procGetTickCount  = kernel32.NewProc("GetTickCount")
	procGetForeWindow = user32.NewProc("GetForegroundWindow")
	procGetWinText    = user32.NewProc("GetWindowTextW")
	procGetWinThread  = user32.NewProc("GetWindowThreadProcessId")
)

type LASTINPUTINFO struct {
	cbSize uint32
	dwTime uint32
}

func GetIdleTime() float64 {
	var lii LASTINPUTINFO
	lii.cbSize = uint32(unsafe.Sizeof(lii))
	ret, _, _ := procGetLastInput.Call(uintptr(unsafe.Pointer(&lii)))
	if ret == 0 {
		return 0
	}
	now, _, _ := procGetTickCount.Call()
	return float64(uint32(now)-lii.dwTime) / 1000.0
}

func GetActiveWindowInfo() (string, string) {
	hwnd, _, _ := procGetForeWindow.Call()
	if hwnd == 0 {
		return "Unknown", "Unknown"
	}

	var pid uint32
	procGetWinThread.Call(hwnd, uintptr(unsafe.Pointer(&pid)))

	// Window Title
	b := make([]uint16, 256)
	procGetWinText.Call(hwnd, uintptr(unsafe.Pointer(&b[0])), uintptr(len(b)))
	title := syscall.UTF16ToString(b)

	return fmt.Sprintf("%d", pid), title
}
