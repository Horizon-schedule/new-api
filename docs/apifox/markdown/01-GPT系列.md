# GPT 系列

## 接口

```
POST {{baseUrl}}/v1/chat/completions
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

## 常用 model 名称

| 模型 | model 值（示例） | 说明 |
|------|------------------|------|
| GPT-4o | `gpt-4o` | 多模态旗舰 |
| GPT-4o mini | `gpt-4o-mini` | 轻量快速 |
| GPT-4.1 | `gpt-4.1` | 新一代旗舰 |
| GPT-4.1 mini | `gpt-4.1-mini` | 性价比 |
| o3-mini | `o3-mini` | 推理模型 |
| o1 | `o1` | 复杂推理 |

> 实际可用模型以 `GET /v1/models` 为准；部分模型需在控制台开通。

## 请求示例

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "user", "content": "你好，请用一句话介绍你自己。" }
  ],
  "stream": false,
  "temperature": 0.7
}
```

## 流式输出

```json
{
  "model": "gpt-4o",
  "messages": [{ "role": "user", "content": "写一首短诗" }],
  "stream": true
}
```

响应为 SSE，每行 `data: {...}`，结束为 `data: [DONE]`。

## 客户端配置

| 客户端 | 配置 |
|--------|------|
| OpenAI Python SDK | `base_url="{{baseUrl}}/v1"`，`api_key="sk-xxx"` |
| Node openai 包 | 同上 |
| Cursor / 兼容 OpenAI 的工具 | API URL = `{{baseUrl}}/v1` |

## cURL

```bash
curl "{{baseUrl}}/v1/chat/completions" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role":"user","content":"Hello"}]
  }'
```

## 嵌入（可选）

文本向量化使用同一鉴权：

```
POST {{baseUrl}}/v1/embeddings
```

```json
{
  "model": "text-embedding-3-small",
  "input": "要向量化的文本"
}
```
