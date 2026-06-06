# Claude 与 Claude Code

## 接口

Claude 使用 Anthropic **Messages API**（非 OpenAI 路径）：

```
POST {{baseUrl}}/v1/messages
Authorization: Bearer {{api_key}}
anthropic-version: 2023-06-01
Content-Type: application/json
```

> `anthropic-version` **必填**，缺少会返回 400。

## 常用 model 名称

| 模型 | model 值（示例） | 说明 |
|------|------------------|------|
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | 编码 / 日常推荐 |
| Claude Opus 4 | `claude-opus-4-20250514` | 复杂任务 |
| Claude 3.5 Sonnet | `claude-3-5-sonnet-20241022` | 上一代常用 |

> 以 `GET /v1/models`（带 anthropic-version 头）或控制台为准。

## 对话请求示例

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "写一段 Python 快速排序，并加注释。"
    }
  ]
}
```

## 流式

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "stream": true,
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

## Claude Code 配置（重点）

Claude Code 通过 Anthropic 官方协议连接，只需改 Base URL 和 Key：

| 环境变量 | 值 |
|----------|-----|
| `ANTHROPIC_BASE_URL` | `{{baseUrl}}`（**不要**加 `/v1`） |
| `ANTHROPIC_API_KEY` | 控制台 `sk-xxx` |

示例（Linux / macOS）：

```bash
export ANTHROPIC_BASE_URL="{{baseUrl}}"
export ANTHROPIC_API_KEY="sk-你的密钥"
```

Windows PowerShell：

```powershell
$env:ANTHROPIC_BASE_URL="{{baseUrl}}"
$env:ANTHROPIC_API_KEY="sk-你的密钥"
```

配置完成后，Claude Code 会自动请求 `{{baseUrl}}/v1/messages`。

## 备选：OpenAI 兼容方式

若工具只支持 OpenAI 格式，可使用：

```
POST {{baseUrl}}/v1/chat/completions
```

```json
{
  "model": "claude-sonnet-4-20250514",
  "messages": [{ "role": "user", "content": "你好" }]
}
```

网关会自动做格式转换（若已启用）。

## cURL

```bash
curl "{{baseUrl}}/v1/messages" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role":"user","content":"hi"}]
  }'
```

## 常见错误

| 现象 | 原因 |
|------|------|
| 400 | 缺少 `anthropic-version` 或 `max_tokens` |
| 401 | API Key 无效 |
| fetch failed | baseUrl 填错（如填了文档站域名） |
