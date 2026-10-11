#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

if (typeof process.stdout.setEncoding === "function") {
  process.stdout.setEncoding("utf8");
}

const repoRoot = path.resolve(__dirname, "..");

const CABIN_FILES = [
  ".niuma/skill.md",
  ".niuma/rules.md",
  ".niuma/facts.md",
  ".niuma/active.md",
  ".niuma/gotchas.md",
  ".niuma/knowledge-index.md",
  ".niuma/README.md",
  ".niuma/playbooks/import-knowledge.md",
  "library/README.md",
  "tasks/inbox.md",
  "tasks/daily/README.md",
  "projects/README.md",
  "AGENTS.md",
];

const STAMP = "niuma-generated";

function learnLoop(cabinRoot) {
  return `知识舱根目录：${cabinRoot}

按 \`.niuma/skill.md\` 执行。记忆只读写这个舱；用户指定的其它目录只拿来干活。

开工只读 \`.niuma/active.md\`，以及 \`.niuma/rules.md\`、\`.niuma/facts.md\`、\`.niuma/gotchas.md\` 的「现行」段，还有 \`tasks/inbox.md\` 的「下一步」。管到当前这件事的，照它做。「已过期」默认不读。

正在做的事写入 \`.niuma/active.md\`。变成稳定事实、偏好、坑或手册后，从 active.md 挪走。写手册和资料索引时带上相关文件路径。新待办进「清单」，当前只做「下一步」那一条。

边做边学，当场写进对应文件的「现行」段：纠正和偏好写入 \`.niuma/rules.md\`，稳定事实写入 \`.niuma/facts.md\`，新坑写入 \`.niuma/gotchas.md\`，跑通且还会再用的步骤写成 \`.niuma/playbooks/\`。只记下一回还会用到的。不要只在回复里说「已记下」。密钥、token、密码不写。

若 \`.niuma/setup.json\` 没有当前 Agent，先运行 \`node bin/init.js\`。已有文件不要覆盖。
`;
}

function agentFiles(cabinRoot) {
  const body = learnLoop(cabinRoot);
  return {
    cursor: {
      ".cursor/rules/niuma.mdc": `---
description: 边做边学。开工先读知识舱，纠正、事实和新坑当场写。
alwaysApply: true
---

<!-- ${STAMP}: cursor rule -->

# 知识舱

${body}`,
      ".cursor/skills/niuma/SKILL.md": `---
name: niuma
description: 边做边学的知识舱。开工先读记忆，用户纠正、说出事实、踩到坑或跑通步骤时当场记下来。用户提到知识舱、偏好、事实、踩坑、待办或导入资料时使用。
---

<!-- ${STAMP}: cursor skill -->

# 知识舱

${body}`,
    },
    claude: {
      "CLAUDE.md": `<!-- ${STAMP}: claude rule -->

# 知识舱

${body}`,
      ".claude/skills/niuma/SKILL.md": `---
name: niuma
description: 边做边学的知识舱。开工先读记忆，用户纠正、说出事实、踩到坑或跑通步骤时当场记下来。用户提到知识舱、偏好、事实、踩坑、待办或导入资料时使用。
---

<!-- ${STAMP}: claude skill -->

# 知识舱

${body}`,
    },
    aider: {
      "CONVENTIONS.md": `<!-- ${STAMP}: aider rule -->

# 知识舱

${body}`,
      ".aider.conf.yml": `# ${STAMP}: aider config
read:
  - AGENTS.md
`,
    },
    agents: {},
  };
}

const AGENT_IDS = ["cursor", "claude", "aider", "agents"];

function parseArgs(argv) {
  const args = { agent: "auto", target: null, force: false, hook: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--agent") {
      args.agent = argv[i + 1];
      i += 1;
    } else if (token.startsWith("--agent=")) {
      args.agent = token.slice("--agent=".length);
    } else if (token === "--force") {
      args.force = true;
    } else if (token === "--hook") {
      args.hook = argv[i + 1];
      i += 1;
    } else if (token.startsWith("--hook=")) {
      args.hook = token.slice("--hook=".length);
    } else if (token.startsWith("-")) {
      throw new Error("不认识的参数：" + token);
    } else if (!args.target) {
      args.target = token;
    } else {
      throw new Error("多余的路径参数：" + token);
    }
  }
  if (args.agent === undefined || args.agent === "") {
    throw new Error("缺少 --agent 的值");
  }
  if (args.hook === "") {
    throw new Error("缺少 --hook 的值");
  }
  return args;
}

function detectAgent(env = process.env) {
  const has = (name) => Object.prototype.hasOwnProperty.call(env, name) && env[name];
  if (has("CLAUDECODE") || has("CLAUDE_CODE") || has("CLAUDE_PROJECT_DIR")) {
    return "claude";
  }
  if (has("AIDER") || has("AIDER_MODEL")) {
    return "aider";
  }
  if (has("CURSOR_AGENT") || Object.keys(env).some((key) => key.startsWith("CURSOR_"))) {
    return "cursor";
  }
  return "agents";
}

function resolveAgent(agent, env) {
  const resolved = agent === "auto" ? detectAgent(env) : agent;
  if (!AGENT_IDS.includes(resolved)) {
    throw new Error("不支持的 Agent：" + resolved + "。可选：cursor、claude、aider、agents");
  }
  return resolved;
}

function safeJoin(root, rel) {
  const dest = path.resolve(root, rel);
  const relToRoot = path.relative(root, dest);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
    throw new Error("拒绝写出目标目录：" + rel);
  }
  return dest;
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function writeNew(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents.endsWith("\n") ? contents : contents + "\n", "utf8");
}

function copyIfMissing(rel, fromRoot, toRoot, created, skipped) {
  const from = safeJoin(fromRoot, rel);
  const to = safeJoin(toRoot, rel);
  if (fs.existsSync(to)) {
    skipped.push(rel);
    return;
  }
  if (!fs.existsSync(from)) {
    return;
  }
  writeNew(to, readText(from));
  created.push(rel);
}

const CURSOR_HOOK_COMMAND = "node bin/init.js --agent cursor --hook cursor";
const CLAUDE_HOOK_COMMAND = "node bin/init.js --agent claude --hook claude";

function ensureCursorHook(targetRoot, created, refreshed, skipped) {
  const rel = ".cursor/hooks.json";
  const dest = safeJoin(targetRoot, rel);
  let data = { version: 1, hooks: {} };
  const existed = fs.existsSync(dest);
  if (existed) {
    try {
      data = JSON.parse(readText(dest));
    } catch (error) {
      skipped.push(rel);
      return;
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    skipped.push(rel);
    return;
  }
  if (!data.hooks || typeof data.hooks !== "object" || Array.isArray(data.hooks)) {
    data.hooks = {};
  }
  if (!Array.isArray(data.hooks.sessionStart)) {
    data.hooks.sessionStart = [];
  }
  const has = data.hooks.sessionStart.some((hook) => hook && hook.command === CURSOR_HOOK_COMMAND);
  if (has) {
    skipped.push(rel);
    return;
  }
  if (!data.version) {
    data.version = 1;
  }
  data.hooks.sessionStart.push({ command: CURSOR_HOOK_COMMAND, timeout: 30 });
  writeNew(dest, JSON.stringify(data, null, 2));
  (existed ? refreshed : created).push(rel);
}

function ensureClaudeHook(targetRoot, created, refreshed, skipped) {
  const rel = ".claude/settings.json";
  const dest = safeJoin(targetRoot, rel);
  let data = {};
  const existed = fs.existsSync(dest);
  if (existed) {
    try {
      data = JSON.parse(readText(dest));
    } catch (error) {
      skipped.push(rel);
      return;
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    skipped.push(rel);
    return;
  }
  if (!data.hooks || typeof data.hooks !== "object" || Array.isArray(data.hooks)) {
    data.hooks = {};
  }
  if (!Array.isArray(data.hooks.SessionStart)) {
    data.hooks.SessionStart = [];
  }
  const has = data.hooks.SessionStart.some(
    (group) => group && Array.isArray(group.hooks) && group.hooks.some((hook) => hook && hook.command === CLAUDE_HOOK_COMMAND)
  );
  if (has) {
    skipped.push(rel);
    return;
  }
  data.hooks.SessionStart.push({
    hooks: [{ type: "command", command: CLAUDE_HOOK_COMMAND }],
  });
  writeNew(dest, JSON.stringify(data, null, 2));
  (existed ? refreshed : created).push(rel);
}

function today() {
  const now = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return now.getFullYear() + "-" + z(now.getMonth() + 1) + "-" + z(now.getDate());
}

function loadSetup(file) {
  if (!fs.existsSync(file)) {
    return { version: 1, agents: {} };
  }
  const raw = readText(file);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(".niuma/setup.json 不是合法 JSON，已停止写入：" + error.message);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(".niuma/setup.json 格式不对，已停止写入");
  }
  if (!parsed.agents || typeof parsed.agents !== "object" || Array.isArray(parsed.agents)) {
    parsed.agents = {};
  }
  parsed.version = 1;
  return parsed;
}

function init(options) {
  const targetRoot = path.resolve(options.target || process.cwd());
  const agent = resolveAgent(options.agent || "auto", options.env || process.env);
  const force = Boolean(options.force);
  const created = [];
  const skipped = [];
  const refreshed = [];

  if (path.resolve(repoRoot) !== targetRoot) {
    copyIfMissing("bin/init.js", repoRoot, targetRoot, created, skipped);
  }
  for (const rel of CABIN_FILES) {
    copyIfMissing(rel, repoRoot, targetRoot, created, skipped);
  }
  if (agent === "cursor") {
    ensureCursorHook(targetRoot, created, refreshed, skipped);
  } else if (agent === "claude") {
    ensureClaudeHook(targetRoot, created, refreshed, skipped);
  }

  const generated = agentFiles(targetRoot)[agent];
  for (const rel of Object.keys(generated)) {
    const dest = safeJoin(targetRoot, rel);
    if (!fs.existsSync(dest)) {
      writeNew(dest, generated[rel]);
      created.push(rel);
      continue;
    }
    const current = readText(dest);
    if (force && current.includes(STAMP)) {
      writeNew(dest, generated[rel]);
      refreshed.push(rel);
      continue;
    }
    skipped.push(rel);
  }

  const setupPath = safeJoin(targetRoot, ".niuma/setup.json");
  const setupExisted = fs.existsSync(setupPath);
  const setup = loadSetup(setupPath);
  const files = Object.keys(generated);
  const previous = setup.agents[agent];
  const sameFiles = previous && JSON.stringify(previous.files || []) === JSON.stringify(files);
  if (!sameFiles) {
    setup.agents[agent] = { initializedAt: today(), files };
    writeNew(setupPath, JSON.stringify(setup, null, 2));
    (setupExisted ? refreshed : created).push(".niuma/setup.json");
  }

  return { agent, targetRoot, created, skipped, refreshed };
}

function hookPayload(kind, result) {
  if (!result.created.length && !result.refreshed.length) {
    return {};
  }
  const parts = [];
  if (result.created.length) {
    parts.push("新建：" + result.created.join("、"));
  }
  if (result.refreshed.length) {
    parts.push("更新：" + result.refreshed.join("、"));
  }
  const text = "知识舱已按 " + result.agent + " 初始化。" + parts.join("。") + "。开工先读 .niuma/skill.md。已有手写文件没有覆盖。";
  if (kind === "claude") {
    return { additionalContext: text };
  }
  return { additional_context: text };
}

function printHuman(result) {
  console.log("Agent：" + result.agent);
  console.log(result.created.length ? "新建：\n- " + result.created.join("\n- ") : "没有新建文件。");
  if (result.refreshed.length) {
    console.log("按模板更新：\n- " + result.refreshed.join("\n- "));
  }
  console.log("已有文件不覆盖。记忆、待办和资料保持原样。");
}

function consumeStdin() {
  if (process.stdin.isTTY || process.stdin.readableEnded) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      resolve();
    };
    process.stdin.on("data", () => {});
    process.stdin.on("end", finish);
    process.stdin.on("error", finish);
    process.stdin.resume();
    setTimeout(finish, 100);
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.hook) {
    await consumeStdin();
  }
  const result = init(args);
  if (args.hook) {
    if (args.hook !== "cursor" && args.hook !== "claude") {
      throw new Error("--hook 只接受 cursor 或 claude");
    }
    process.stdout.write(JSON.stringify(hookPayload(args.hook, result)));
    return;
  }
  printHuman(result);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(error.message + "\n");
    process.exitCode = 1;
  });
}

module.exports = { init, detectAgent, parseArgs, resolveAgent, agentFiles, AGENT_IDS };
