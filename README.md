# AI牛马

这是一个边做边学的助手。你把事交给正在用的 Claude Code、Cursor 或 Aider，它一边做，一边把下次还会用到的东西记在纯文本里。

它学四样：你说过的事实、你的偏好、这次踩到的坑、跑通了还会再用的步骤。坑不会停在当时那句「下次注意」。它写成一条，下次开工先照着避开。

克隆下来的那份才是你的知识舱。不要在上游仓库里干活，也不要把个人内容 PR 回来。

## 一次干活

开工时，它只看正在做的事、还有效的事实和偏好和踩坑，以及待办里的下一步。

做事时：

- 你纠正它，或说出新的事实、偏好，当场写下来。
- 刚踩到的坑，当场写成一条。下次遇到同一件事，先按这条绕开。
- 还没定下来的，先放在 `.niuma/active.md`。定了再挪进事实、偏好、踩坑或手册。
- 一段步骤跑通了，而且下一回还会用，写成手册，并写上相关文件的路径。
- 只记下一回还会用到的，不记操作流水。密钥、token、密码不写。

下次打开，不用你再讲一遍。它按已经学会的接着做。

它没写进文件，你就说「把刚才那句写进事实」或「把这个坑记下来」。

## 记下来是什么样

`.niuma/gotchas.md`：

```markdown
## 现行

- [2026-10-11] [示例] 没确认 Node 就跑初始化，命令会停。下次先看 node -v
```

`tasks/inbox.md`：

```markdown
## 下一步

- [ ] 把这份舱的初始化跑通
```

## 你说什么，它写到哪

| 你说的 | 写到 |
| --- | --- |
| 还没定的事 | `.niuma/active.md` |
| 定了的事实 | `.niuma/facts.md` 的「现行」 |
| 偏好 | `.niuma/rules.md` 的「现行」 |
| 踩到的坑 | `.niuma/gotchas.md` 的「现行」 |
| 跑通且还会再用的步骤 | `.niuma/playbooks/`，带上「相关：」 |
| 还要做的事 | `tasks/inbox.md` 的「清单」。当前只做「下一步」那一条 |

失效的事实、偏好和坑挪到该文件的「已过期」。开工不读这一段。

资料放在 `library/`。索引在 `.niuma/knowledge-index.md`。手册和资料用「相关：」互相指向。

## 怎么用

需要 [Node](https://nodejs.org/)。

1. `git clone` 本仓库，或 fork 后再克隆。
2. 用 Agent 打开这份副本。第一次它会按 [`AGENTS.md`](AGENTS.md) 运行 `node bin/init.js`，只生成当前 Agent 的规则和配置。已有文件不覆盖。
3. 开始干活。你也可以直接改这些 Markdown。

Cursor、Claude Code、Aider 会各自生成配置。其它 Agent 读仓库根上的 `AGENTS.md`。

生成之后，Cursor 和 Claude Code 下次打开会再跑一次初始化。换一个 Agent 时，只补这个 Agent 还没有的文件。

| Agent | 当时生成的文件 |
| --- | --- |
| Cursor | `.cursor/rules/niuma.mdc`、`.cursor/skills/niuma/SKILL.md`、`.cursor/hooks.json` |
| Claude Code | `CLAUDE.md`、`.claude/skills/niuma/SKILL.md`、`.claude/settings.json` |
| Aider | `CONVENTIONS.md`、`.aider.conf.yml` |
| 其它 | 沿用已有的 `AGENTS.md` |

## 导入已有知识库

在你自己的舱副本里，告诉 Agent 旧库的路径。它会按 [`.niuma/playbooks/import-knowledge.md`](.niuma/playbooks/import-knowledge.md) 筛选后拷进 `library/`，并追加索引。必须你指定来源，不会主动扫盘。

## 升级

拉上游时只合并 `.niuma/skill.md`、README、`AGENTS.md` 和 `bin/init.js`。已经写过的记忆、待办、资料以你的副本为准。

`node bin/init.js` 只补缺失文件。带 `niuma-generated` 标记的生成文件，用 `node bin/init.js --agent cursor --force` 按当前模板重新生成。没有这个标记的文件不会被覆盖。

## 许可

MIT。私人资料不要把 fork 公开。
