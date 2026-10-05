import fs from "node:fs";
import { getPlatformKnowledge } from "../lib/knowledge-content.ts";

const files = fs.readdirSync("content/platforms").filter((f) => f.endsWith(".md"));
let total = 0;
const bad = [];
for (const f of files) {
  const k = getPlatformKnowledge(f.replace(".md", ""));
  const n = (k?.failureModes || []).length;
  total += n;
  if (n < 1 || !k?.repairProtocol) bad.push(`${f}:${n}`);
}
console.log("files", files.length, "modes", total, "bad", JSON.stringify(bad));
