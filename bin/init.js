#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

if (typeof process.stdout.setEncoding === "function") {
  process.stdout.setEncoding("utf8");
}

const repoRoot = path.resolve(__dirname, "..");
const targetRoot = path.resolve(process.argv[2] || process.cwd());

const files = [
  ".niuma/skill.md",
  ".niuma/rules.md",
  ".niuma/gotchas.md",
  ".niuma/knowledge-index.md",
  ".niuma/README.md",
  ".niuma/playbooks/import-knowledge.md",
  "library/README.md",
  "tasks/inbox.md",
  "tasks/daily/README.md",
  "projects/README.md",
];

function copyIfMissing(rel) {
  const from = path.join(repoRoot, rel);
  const to = path.join(targetRoot, rel);
  if (fs.existsSync(to)) {
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

for (const rel of files) {
  copyIfMissing(rel);
}

const skillPath = path.join(targetRoot, ".niuma", "skill.md");
const skill = fs.readFileSync(skillPath, "utf8").replace(/\s+$/, "");

console.log(skill);
console.log("");
console.log("把上面这段规则粘贴到你正在用的 Agent 的规则文件里即可：");
console.log("Claude Code 贴到 CLAUDE.md，Cursor 贴到 .cursor/rules/ 或 .cursorrules，Aider 贴到 CONVENTIONS.md，也可以贴到更通用的 AGENTS.md。");
console.log("不管以后换什么 Agent，把这段规则贴到对应配置里就能直接用。");
console.log("资料放 library/，待办放 tasks/ 和 projects/，也可以直接打开这些 Markdown 自己记。");
