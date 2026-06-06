# Apifox 客户文档包

面向 **GPT、Qwen、DeepSeek、Claude / Claude Code、Gemini** 的完整 Apifox 导入包。

## 你要做的事（仅 3 步）

1. **改环境**：编辑 `environments/默认环境.json`，填入你的网关地址和 `api_key`（或在 Apifox 环境里改 **前置 URL**）
2. **导入 Apifox**：**项目设置 → 导入** → 先 `openapi.json`；若接口仍为空 → 改导 `postman-collection.json`（见 [导入失败排查.md](./导入失败排查.md)）
3. **发布文档站**：Apifox → 分享 → 发布，把链接给客户

详细图文步骤见 **[导入与发布.md](./导入与发布.md)**。

## 目录

```
docs/apifox/
├── openapi.json              ← 导入接口（OpenAPI，已修复 servers）
├── postman-collection.json   ← 备用导入（OpenAPI 为空时用，最稳）
├── environments/
│   └── 默认环境.json
├── markdown/                 ← 7 篇客户文档
├── 导入失败排查.md           ← 导入后什么都没有？看这里
├── 导入与发布.md
└── README.md
```

## 注意

- **不要** 把 `docs.newapi.pro` 当作 API 地址
- 客户访问的是 Apifox **发布后的文档站链接**（如 `https://xxx.apifox.cn`），不是本仓库
