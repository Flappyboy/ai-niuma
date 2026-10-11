# AI牛马

这**不是独立 AI 工具**，也不是要换掉你正在用的 Claude Code / Cursor / Aider。它是一套跨 Agent 的纯文本记忆和待办标准。

上游仓库只放空模板，不放用户知识。你 `git clone` 到本地，或自己 fork 一份，**那份副本**才是你的知识舱。之后攒的东西留在你这边，不要 PR 回这个仓库。

## 三步用起来

1. `git clone` 本仓库，或 fork 后再克隆。
2. 打开 [`.niuma/skill.md`](.niuma/skill.md)，把全文粘到你正在用的 Agent 规则里：
   - 通用：`AGENTS.md`
   - Claude Code：`CLAUDE.md`
   - Cursor：`.cursor/rules/` 或 `.cursorrules`
   - Aider：`CONVENTIONS.md`
3. 开始干活。Agent 会按规则读写记忆和待办；你也可以随时打开这些 Markdown 自己记一笔。

效果取决于你贴进去的 Agent 是否遵守规则。

## 舱里三层

| 目录 | 放什么 |
| --- | --- |
| `.niuma/` | 偏好、踩坑、索引、手册、Skill |
| `library/` | 你的资料，以及导入的旧知识库 |
| `tasks/`、`projects/` | 待办和项目。想到的进 `tasks/inbox.md`，今天的进 `tasks/daily/日期.md`，持续做的各建一个项目文件。不分生活/工作 |

## 导入已有知识库

在你自己的舱副本里，告诉 Agent 旧库的路径。它会按 [`.niuma/playbooks/import-knowledge.md`](.niuma/playbooks/import-knowledge.md) 筛选后拷进 `library/`，并追加索引。必须你指定来源，不会主动扫盘。

## 升级

拉上游时只合并 `skill.md`、README、脚本和空模板。已经写过的记忆、待办、资料以你的副本为准。可选脚本 `node bin/init.js` 只会补缺失文件，不会覆盖，也不会删除不认识的路径。

## 扩展

`.niuma/` 是以后 CLI / MCP / 行为流水 / 日报的数据面。这轮没有这些功能。预留了 `journal/`、`reports/`、`backups/` 这些名字，先不建空目录。

## 许可

MIT。私人资料不要把 fork 公开。
