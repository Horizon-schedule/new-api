# Qwen 通义千问系列

## 接口

Qwen 文本对话使用 **OpenAI 兼容** 格式（与 GPT 相同路径）：

```
POST {{baseUrl}}/v1/chat/completions
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

## 常用 model 名称

| 模型 | model 值（示例） | 说明 |
|------|------------------|------|
| Qwen Turbo | `qwen-turbo` | 快速、低成本 |
| Qwen Plus | `qwen-plus` | 均衡 |
| Qwen Max | `qwen-max` | 最强通用 |
| Qwen Coder | `qwen3-coder-plus` 等 | 代码场景 |
| Qwen2.5 | `qwen2.5-72b-instruct` 等 | 开源规格命名 |

> 以 `GET /v1/models` 返回的 `id` 为准。

## 请求示例

```json
{
  "model": "qwen-plus",
  "messages": [
    { "role": "system", "content": "你是一个专业的中文助手。" },
    { "role": "user", "content": "用三句话介绍通义千问。" }
  ],
  "stream": false
}
```

## 代码场景

```json
{
  "model": "qwen3-coder-plus",
  "messages": [
    { "role": "user", "content": "用 Python 实现二叉树层序遍历。" }
  ],
  "stream": false
}
```

## 流式

```json
{
  "model": "qwen-max",
  "messages": [{ "role": "user", "content": "讲一个故事" }],
  "stream": true
}
```

## 客户端配置

| 客户端 | 配置 |
|--------|------|
| OpenAI SDK | `base_url="{{baseUrl}}/v1"`，model 改为 `qwen-plus` 等 |
| LangChain | `openai_api_base` 指向网关 |
| Dify / 其他 OpenAI 兼容 | API 地址填 `{{baseUrl}}/v1` |

## cURL

```bash
curl "{{baseUrl}}/v1/chat/completions" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-plus",
    "messages": [{"role":"user","content":"你好"}]
  }'
```

## 与 GPT 的区别

- **路径相同**，仅 `model` 字段不同。
- 同一 API Key 可在 GPT、Qwen、DeepSeek 之间切换 model，无需换 Key。
