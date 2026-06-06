# DeepSeek 系列

## 接口

DeepSeek 使用 **OpenAI 兼容** Chat Completions：

```
POST {{baseUrl}}/v1/chat/completions
Authorization: Bearer {{api_key}}
Content-Type: application/json
```

## 常用 model 名称

| 模型 | model 值（示例） | 说明 |
|------|------------------|------|
| DeepSeek Chat | `deepseek-chat` | 通用对话 |
| DeepSeek Reasoner | `deepseek-reasoner` | 推理 / 思考链 |
| DeepSeek V3 | `deepseek-v3` 等 | 以控制台为准 |

> 可用列表：`GET /v1/models`，筛选 `id` 含 `deepseek` 的项。

## 普通对话示例

```json
{
  "model": "deepseek-chat",
  "messages": [
    { "role": "user", "content": "解释一下快速排序的思路。" }
  ],
  "stream": false
}
```

## 推理模型示例

```json
{
  "model": "deepseek-reasoner",
  "messages": [
    { "role": "user", "content": "9.11 和 9.8 哪个大？请逐步推理。" }
  ],
  "stream": false
}
```

推理模型响应中可能包含 `reasoning_content` 或类似字段（取决于上游返回格式）。

## 流式

```json
{
  "model": "deepseek-chat",
  "messages": [{ "role": "user", "content": "Hello" }],
  "stream": true
}
```

## 客户端配置

与 GPT 完全相同，仅修改 `model`：

```python
from openai import OpenAI

client = OpenAI(
    base_url="{{baseUrl}}/v1",
    api_key="sk-你的密钥",
)

resp = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "hi"}],
)
print(resp.choices[0].message.content)
```

## cURL

```bash
curl "{{baseUrl}}/v1/chat/completions" \
  -H "Authorization: Bearer {{api_key}}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role":"user","content":"你好"}]
  }'
```

## 与 Qwen / GPT 混用

同一 Key、同一路径，切换 `model` 即可：

- `gpt-4o` → OpenAI
- `qwen-plus` → 通义千问
- `deepseek-chat` → DeepSeek
