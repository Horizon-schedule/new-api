# Gemini 系列

Gemini 支持两种方式：**原生 REST**（推荐用于 Google SDK）和 **OpenAI 兼容**。

---

## 方式一：原生 generateContent（推荐）

### 对话

```
POST {{baseUrl}}/v1beta/models/{model}:generateContent
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

将 `{model}` 替换为模型名，例如 `gemini-2.5-flash`：

```
POST {{baseUrl}}/v1beta/models/gemini-2.5-flash:generateContent
```

### 请求体

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "用中文解释什么是机器学习。" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

### 流式

```
POST {{baseUrl}}/v1beta/models/gemini-2.5-flash:streamGenerateContent
```

请求体与 `generateContent` 相同。

### 模型列表

```
GET {{baseUrl}}/v1beta/models
Authorization: Bearer {{api_key}}
```

---

## 方式二：OpenAI 兼容（最简单）

与 GPT / Qwen / DeepSeek **同一路径**：

```
POST {{baseUrl}}/v1/chat/completions
```

```json
{
  "model": "gemini-2.5-flash",
  "messages": [{ "role": "user", "content": "你好" }],
  "stream": false
}
```

适合已配置 OpenAI SDK 、不想改客户端的场景。

---

## 常用 model 名称

| 模型 | model 值（示例） | 说明 |
|------|------------------|------|
| Gemini 2.5 Flash | `gemini-2.5-flash` | 快速 |
| Gemini 2.5 Pro | `gemini-2.5-pro` | 高质量 |
| Gemini 2.0 Flash | `gemini-2.0-flash` | 上一代快速 |

### 思考模式（若已开通）

可在模型名中使用思考相关后缀，例如：

- `gemini-2.5-flash-thinking`
- `gemini-2.5-pro-thinking`
- 或后缀 `-low` / `-medium` / `-high` 控制思考力度

> 以控制台实际配置为准。

---

## cURL（原生）

```bash
curl "{{baseUrl}}/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents":[{"role":"user","parts":[{"text":"Hello"}]}]
  }'
```

## cURL（OpenAI 兼容）

```bash
curl "{{baseUrl}}/v1/chat/completions" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role":"user","content":"Hello"}]
  }'
```

## 如何选择？

| 场景 | 推荐 |
|------|------|
| 已有 OpenAI 客户端 | OpenAI 兼容 `/v1/chat/completions` |
| Google 官方 SDK | 原生 `/v1beta/models/...:generateContent` |
| 多模态 / 图片生成 | 原生 generateContent + generationConfig |
