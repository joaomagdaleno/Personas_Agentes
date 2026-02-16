import * as ts from "typescript";
import * as fs from "fs";
import { LogicAuditor } from "../src_local/agents/Support/logic_auditor.ts";

const filePath = "c:/Users/joaom/Documents/GitHub/Personas_Agentes/src_local/agents/Kotlin/Content/echo.ts";
const content = fs.readFileSync(filePath, "utf-8");
const sourceFile = ts.createSourceFile("temp.ts", content, ts.ScriptTarget.Latest, true);

const issues = LogicAuditor.scanFile(sourceFile);
console.log(JSON.stringify(issues, null, 2));
