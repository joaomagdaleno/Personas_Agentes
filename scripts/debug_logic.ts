import { DebugEngine } from "../src_local/agents/Support/Analysis/debug_engine.ts";
import * as path from "path";

const filePath = path.join(process.cwd(), "src_local/agents/Kotlin/Content/echo.ts");
const issues = DebugEngine.trace_file(filePath);

console.log(JSON.stringify(issues, null, 2));
