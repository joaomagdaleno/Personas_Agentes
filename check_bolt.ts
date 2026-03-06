import * as fs from 'fs';
const buffer = fs.readFileSync('src_native/analyzer/rust_check.json');
const text = new TextDecoder('utf-8').decode(buffer);
const data = JSON.parse(text);
const boltEntries = data.entries.filter((e: any) => e.agent === "Bolt");
console.log(JSON.stringify(boltEntries.map((e: any) => ({ stack: e.stack, rules: e.fingerprint.rules_count })), null, 2));
