# AI牛马

这是一个边做边学的助手。你把事交给它做，它把下次还会用到的事实、偏好、踩坑和步骤记在纯文本里。

它**不是独立 AI 工具**，也不是要换掉你正在用的 Claude Code / Cursor / Aider。它是一套跨 Agent 的纯文本记忆和待办标准。

上游仓库只放空模板，不放用户知识。你 `git clone` 到本地，或自己 fork 一份，**那份副本**才是你的知识舱。之后攒的东西留在你这边，不要 PR 回这个仓库。

## 怎么用

1. `git clone` 本仓库，或 fork 后再克隆。
2. 用 Agent 打开这份副本。仓库里没有 `.cursor/`、`.claude/` 或 Aider 配置。Agent 先按 [`AGENTS.md`](AGENTS.md) 运行 `node bin/init.js`，只生成当前 Agent 的规则、skill 和它自己的配置。已有文件不覆盖。
3. 开始干活。Agent 按刚生成的规则读写记忆和待办；你也可以直接改这些 Markdown。

生成之后，Cursor 和 Claude Code 才有各自的会话钩子，下次打开会再跑初始化。换一个 Agent 时，只补这个 Agent 还没有的文件。也可以自己先跑 `node bin/init.js --agent cursor`。

| Agent | 当时生成的文件 |
| --- | --- |
| Cursor | `.cursor/rules/niuma.mdc`、`.cursor/skills/niuma/SKILL.md`、`.cursor/hooks.json` |
| Claude Code | `CLAUDE.md`、`.claude/skills/niuma/SKILL.md`、`.claude/settings.json` |
| Aider | `CONVENTIONS.md`、`.aider.conf.yml` |
| 其它 | 沿用已有的 `AGENTS.md` |

带 `niuma-generated` 标记的生成文件，可以用 `node bin/init.js --agent cursor --force` 按当前模板重新生成。没有这个标记的文件不会被覆盖。

## 舱里三层

| 目录 | 放什么 |
| --- | --- |
| `.niuma/` | 偏好、事实、踩坑、索引、手册、Skill |
| `library/` | 你的资料，以及导入的旧知识库 |
| `tasks/`、`projects/` | 待办和项目。想到的进 `tasks/inbox.md`，今天的进 `tasks/daily/日期.md`，持续做的各建一个项目文件。不分生活/工作 |

## 导入已有知识库

在你自己的舱副本里，告诉 Agent 旧库的路径。它会按 [`.niuma/playbooks/import-knowledge.md`](.niuma/playbooks/import-knowledge.md) 筛选后拷进 `library/`，并追加索引。必须你指定来源，不会主动扫盘。

## 升级

拉上游时只合并 `skill.md`、README、脚本和空模板。已经写过的记忆、待办、资料以你的副本为准。`node bin/init.js` 只会补缺失文件；带生成标记的规则可以用 `--force` 更新。它不会覆盖手写文件，也不会删除不认识的路径。

## 扩展

`.niuma/` 是以后 CLI / MCP / 行为流水 / 日报的数据面。这轮没有这些功能。预留了 `journal/`、`reports/`、`backups/` 这些名字，先不建空目录。

## 许可

MIT。私人资料不要把 fork 公开。
