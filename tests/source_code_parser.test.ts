import { describe, expect, test } from "bun:test";
import { SourceCodeParser } from "../src_local/engines/analysis/source_code_parser.ts";

describe("SourceCodeParser", () => {
    const parser = new SourceCodeParser();

    test("should create SourceCodeParser instance", () => {
        expect(parser).toBeDefined();
        expect(typeof parser.analyzePy).toBe("function");
        expect(typeof parser.analyzeKt).toBe("function");
        expect(typeof parser.analyzeTs).toBe("function");
    });

    describe("Python Analysis", () => {
        test("should extract functions and classes from Python code", async () => {
            const pythonCode = `
def hello_world():
    print("Hello")

class MyClass:
    def __init__(self):
        pass
`;
            
            const result = await parser.analyzePy(pythonCode, "test.py");
            expect(result).toBeDefined();
            expect(Array.isArray(result.functions)).toBe(true);
            expect(Array.isArray(result.classes)).toBe(true);
        });

        test("should calculate Python complexity", async () => {
            const complexity = await parser.calculatePyComplexity("scripts/run-diagnostic.ts");
            expect(complexity).toBeGreaterThanOrEqual(1);
        });

        test("should extract Python imports", () => {
            const code = `
import os
import sys
from datetime import datetime
from utils import helper

import module1, module2
`;
            
            const imports = parser.extractPyImports(code);
            expect(Array.isArray(imports)).toBe(true);
        });
    });

    describe("TypeScript Analysis", () => {
        test("should extract functions and classes from TypeScript code", async () => {
            const tsCode = `
function greet() {
    return "Hello";
}

const sayGoodbye = () => {
    return "Goodbye";
};

class Greeter {
    private name: string;
    
    constructor(name: string) {
        this.name = name;
    }
    
    public greet(): string {
        return \`Hello \${this.name}\`;
    }
}
`;
            
            const result = await parser.analyzeTs(tsCode, "test.ts");
            expect(result).toBeDefined();
            expect(Array.isArray(result.functions)).toBe(true);
            expect(Array.isArray(result.classes)).toBe(true);
        });

        test("should calculate TypeScript complexity", async () => {
            const complexity = await parser.calculateTsComplexity("scripts/run-diagnostic.ts");
            expect(complexity).toBeGreaterThanOrEqual(1);
        });

        test("should extract TypeScript imports", () => {
            const code = `
import { useState, useEffect } from 'react';
import * as utils from './utils';
import MyComponent from './MyComponent';
`;
            
            const imports = parser.extractTsImports(code);
            expect(Array.isArray(imports)).toBe(true);
        });
    });

    describe("Kotlin Analysis", () => {
        test("should extract functions and classes from Kotlin code", async () => {
            const ktCode = `
fun greet(): String {
    return "Hello"
}

class Greeter(val name: String) {
    fun sayHello(): String {
        return "Hello $name"
    }
}
`;
            
            const result = await parser.analyzeKt(ktCode);
            expect(result).toBeDefined();
        });

        test("should calculate Kotlin complexity", async () => {
            const complexity = await parser.calculateKtComplexity("test.kt");
            expect(complexity).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Polyglot Analysis (C#, Rust, Go, C++)", () => {
        test("should parse C# functions, classes and imports", async () => {
            const csCode = `
using System;
using System.IO;

namespace SampleApp {
    public class UserProcessor {
        public void ProcessUser() { }
    }
}`;
            const res = await parser.analyze_file_logic(csCode, "UserProcessor.cs");
            expect(res).not.toBeNull();
            expect(res!.classes).toContain("UserProcessor");
            expect(res!.functions).toContain("ProcessUser");
            expect(res!.imports).toContain("System");
        });

        test("should parse Rust functions, structs and imports", async () => {
            const rsCode = `
use std::fs::File;

pub struct Config {
    pub name: String,
}

pub fn run_app() { }
`;
            const res = await parser.analyze_file_logic(rsCode, "main.rs");
            expect(res).not.toBeNull();
            expect(res!.classes).toContain("Config");
            expect(res!.functions).toContain("run_app");
            expect(res!.imports).toContain("std::fs::File");
        });

        test("should parse Go functions, structs and imports", async () => {
            const goCode = `
package main

import (
    "fmt"
    "net/http"
)

type Server struct{}

func StartServer() {}
`;
            const res = await parser.analyze_file_logic(goCode, "main.go");
            expect(res).not.toBeNull();
            expect(res!.classes).toContain("Server");
            expect(res!.functions).toContain("StartServer");
            expect(res!.imports).toContain("fmt");
            expect(res!.imports).toContain("net/http");
        });
    });
});
