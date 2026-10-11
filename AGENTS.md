# 知识舱

本仓库是边做边学的助手。完整规则在 [`.niuma/skill.md`](.niuma/skill.md)。

开工只读 `active.md`、事实/偏好/踩坑的「现行」，以及待办的「下一步」。「已过期」默认不读。管到当前这件事的，照它做。正在做的写 `active.md`，稳定后再挪到事实、偏好、踩坑或手册。用户纠正、新事实、新坑当场写。跑通且还会再用的步骤当场写成手册，并写上相关路径。记忆只写本仓库的 `.niuma/`；用户指定的其它目录只拿来干活。只记下一回还会用到的。

## 第一次使用

如果 [`.niuma/setup.json`](.niuma/setup.json) 里还没有你这个 Agent，先执行：

```
node bin/init.js
```

脚本会补齐舱内文件，并只给当前 Agent 生成规则、skill 和它自己的配置，例如 Cursor 的 `.cursor/`、Claude Code 的 `.claude/`、Aider 的 `.aider.conf.yml`。仓库本身不带这些目录。已有文件不覆盖。

识别顺序：`--agent` 优先，否则看环境变量。对不上时记为通用 Agent `agents`。支持 `cursor`、`claude`、`aider`、`agents`。

当前 Agent 的文件生成之后，Cursor 和 Claude Code 下次会话会用各自的钩子再跑这个脚本。第一次仍然先读本文件。

## 开工

生成完成后，按 `.niuma/skill.md` 读写记忆和待办。
