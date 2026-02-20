import { StructuralAnalyst } from "../src_local/agents/Support/Analysis/structural_analyst.ts";
import { SourceCodeParser } from "../src_local/agents/Support/Analysis/source_code_parser.ts";

const analyst = new StructuralAnalyst();
console.log("Analyst parser type:", typeof analyst.parser);
console.log("Analyst parser methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(analyst.parser)));
console.log("analyzePyMetadata in analyst.parser:", typeof (analyst.parser as any).analyzePyMetadata);

const content = "def hello():\n    pass\n";
try {
    const res = analyst.analyzePython(content, "test.py");
    console.log("Analysis Result:", res);
} catch (e) {
    console.error("Execution failed:", e);
}
