import { SourceCodeParser } from "../src_local/agents/Support/Analysis/source_code_parser.ts";

const parser = new SourceCodeParser();
console.log("Parser methods:", Object.getOwnPropertyNames(SourceCodeParser.prototype));
console.log("analyzePyMetadata type:", typeof parser.analyzePyMetadata);

const content = "def hello():\n    pass\n";
try {
    const res = parser.analyzePyMetadata(content);
    console.log("Analysis Result:", res);
} catch (e) {
    console.error("Execution failed:", e);
}
