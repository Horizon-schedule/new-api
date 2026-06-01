# OpenAPI 与 Apifox 调试说明

本目录包含两份 OpenAPI 规范：

| 文件 | 用途 | 路径前缀 |
|------|------|----------|
| `relay.json` | AI 模型转发（GPT / Claude / Gemini / Qwen 等） | `/v1/`、`/v1beta/` 等 |
| `api.json` | 管理后台（用户、渠道、令牌等） | `/api/` |

## 常见错误：`[Proxy] Failed to proxy request: fetch failed`

在 Apifox 里调试 **Claude 聊天** 等接口时，若请求 URL 为：

`https://docs.newapi.pro/v1/messages`

会出现 **500** 或 **fetch failed**。原因如下：

1. **`docs.newapi.pro` 是官方文档网站**，只托管说明页面，**不是** API 网关，没有 `/v1/messages` 转发能力。
2. Apifox 通过云端代理访问该地址时，无法得到合法的 Anthropic 响应，因而报代理失败。
3. 截图里 `Authorization: Bearer ` **后面没有 Key**，即使地址正确也会 **401**。

## 正确配置（Apifox）

### 1. 环境变量

| 变量名 | 示例 | 说明 |
|--------|------|------|
| `baseUrl` | `https://api.你的域名.com` | 你部署的 **new-api 根地址**，不要带末尾 `/v1` |
| `api_key` | `sk-xxxxxxxx` | 控制台「令牌」里创建，**完整复制** |

### 2. 服务 / Server

导入 `relay.json` 后，将 OpenAPI **服务器** 改为你自己的 `baseUrl`（或覆盖默认的 `your-new-api.example.com`）。

### 3. 鉴权

- 类型：**Bearer Token**
- 值：`{{api_key}}` 或直接粘贴 `sk-...`（确保不是空的 `Bearer `）

### 4. Claude `/v1/messages` 额外请求头

| Header | 值 |
|--------|-----|
| `anthropic-version` | `2023-06-01` |

### 5. 代理设置

若改对地址后仍异常，可在 Apifox **设置 → 高级** 中尝试：

- 关闭「使用云端 Mock」
- 或改为 **直连** 你的网关（需你的网关已启动且公网/本机可访问）

### 6. 本地调试示例

若 new-api 跑在本机 `http://127.0.0.1:3000`：

```bash
curl http://127.0.0.1:3000/v1/messages \
  -H "Authorization: Bearer sk-你的令牌" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"claude-sonnet-4-20250514\",\"max_tokens\":1024,\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}"
```

## 重新导入

修改 `relay.json` / `api.json` 后，在 Apifox 中 **重新导入** 或 **同步 OpenAPI**，并再次检查环境与 Bearer 是否已填写。

## 延伸阅读

- 网关接口说明：<https://docs.newapi.pro/zh/docs/api>
- Claude Messages：<https://docs.newapi.pro/zh/docs/api/ai-model/chat/createmessage>
