import { describe, expect, test } from "bun:test";
import { SourceCodeParser } from "../src_local/agents/Support/Analysis/source_code_parser";

describe("SourceCodeParser", () => {
    const parser = new SourceCodeParser();

    test("should create SourceCodeParser instance", () => {
        expect(parser).toBeDefined();
        expect(typeof parser.analyzePy).toBe("function");
        expect(typeof parser.analyzeKt).toBe("function");
        expect(typeof parser.analyzeTs).toBe("function");
    });

    describe("Python Analysis", () => {
        test("should extract functions and classes from Python code", () => {
            const pythonCode = `
def hello_world():
    print("Hello")

class MyClass:
    def __init__(self):
        pass
`;
            
            const result = parser.analyzePy(pythonCode);
            expect(result.functions).toEqual(["hello_world", "__init__"]);
            expect(result.classes).toEqual(["MyClass"]);
            expect(result.tree).toBe(true);
        });

        test("should calculate Python complexity", () => {
            const simpleCode = `def simple(): pass`;
            const complexCode = `
def complex():
    if x > 0:
        for i in range(5):
            while i < 10:
                i += 1
    try:
        pass
    except Exception:
        pass
`;
            
            expect(parser.calculatePyComplexity(simpleCode)).toBeGreaterThan(0);
            expect(parser.calculatePyComplexity(complexCode)).toBeGreaterThan(parser.calculatePyComplexity(simpleCode));
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
            expect(imports).toEqual(expect.arrayContaining(["os", "sys", "datetime", "utils", "module1", "module2"]));
        });
    });

    describe("TypeScript Analysis", () => {
        test("should extract functions and classes from TypeScript code", () => {
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
            
            const result = parser.analyzeTs(tsCode);
            expect(result.functions).toEqual(expect.arrayContaining(["greet", "sayGoodbye", "constructor"]));
            expect(result.classes).toEqual(["Greeter"]);
            expect(result.tree).toBe(true);
        });

        test("should calculate TypeScript complexity", () => {
            const simpleCode = `function simple() { return 1; }`;
            const complexCode = `
function complex(x: number): number {
    if (x > 0) {
        for (let i = 0; i < 5; i++) {
            while (i < 10) {
                i++;
            }
        }
    } else if (x < 0) {
        switch (x) {
            case -1:
                return 1;
            case -2:
                return 2;
            default:
                return 0;
        }
    }
    
    try {
        throw new Error("Test");
    } catch (error) {
        console.log(error);
    }
    
    return 0;
}
`;
            
            expect(parser.calculateTsComplexity(simpleCode)).toBeGreaterThan(0);
            expect(parser.calculateTsComplexity(complexCode)).toBeGreaterThan(parser.calculateTsComplexity(simpleCode));
        });

        test("should extract TypeScript imports", () => {
            const code = `
import { useState, useEffect } from 'react';
import * as utils from './utils';
import MyComponent from './MyComponent';
`;
            
            const imports = parser.extractTsImports(code);
            expect(imports).toEqual(["react", "./utils", "./MyComponent"]);
        });
    });

    describe("Kotlin Analysis", () => {
        test("should extract functions and classes from Kotlin code", () => {
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
            
            const result = parser.analyzeKt(ktCode);
            expect(result.functions).toEqual(["greet", "sayHello"]);
            expect(result.classes).toEqual(["Greeter"]);
        });

        test("should calculate Kotlin complexity", () => {
            const simpleCode = `fun simple() = 1`;
            const complexCode = `
fun complex(x: Int): Int {
    if (x > 0) {
        for (i in 0..5) {
            while (i < 10) {
                i++
            }
        }
    } else when (x) {
        -1 -> return 1
        -2 -> return 2
        else -> return 0
    }
    
    try {
        throw Exception("Test")
    } catch (e: Exception) {
        println(e)
    }
    
    return 0
}
`;
            
            expect(parser.calculateKtComplexity(simpleCode)).toBeGreaterThan(0);
            expect(parser.calculateKtComplexity(complexCode)).toBeGreaterThan(parser.calculateKtComplexity(simpleCode));
        });
    });
});
