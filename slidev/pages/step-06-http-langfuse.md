## `workshop/04-http-server/server-http.js`

```js {maxHeight:'420px'}
// server-http.js — MCP сервер на HTTP транспорті

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

// Той самий сервер що і в 01-server/ -- нічого не змінилось!
const server = new McpServer({ name: "workshop-http", version: "1.0.0" });

server.tool(
  "add",
  { a: z.number().describe("Перше число"), b: z.number().describe("Друге число") },
  async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] })
);

// HTTP шар з авторизацією
const app = express();
app.use(express.json());

// Middleware: перевіряємо Bearer token
app.use((req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (process.env.MCP_SECRET && token !== process.env.MCP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// MCP endpoint
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP HTTP Server: http://localhost:${PORT}/mcp`));
```

<!--
Запустіть: node server-http.js
Потім в Inspector: Transport = HTTP, URL = http://localhost:3000/mcp
-->

---

# Bearer Token — перевірка через curl

Встановіть в `.env`:

```bash
MCP_SECRET=my-super-secret-token
```

```bash
# Без токену — 401 Unauthorized
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# → {"error":"Unauthorized"}

# З Bearer token — 200 OK
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-super-secret-token" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
# → {"result":{"tools":[{"name":"add",...}]}}
```

<v-click>

**Клієнт або VS Code `mcp.json`:**
```json
{
  "servers": {
    "my-server": {
      "type": "http",
      "url": "http://10.0.0.5:3000/mcp",
      "headers": { "Authorization": "Bearer my-super-secret-token" }
    }
  }
}
```

</v-click>

---

## `workshop/05-langfuse/agent-traced.js`

```js {maxHeight:'420px'}
// agent-traced.js — LangChain агент з Langfuse трасуванням

import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { CallbackHandler } from "langfuse-langchain"; // ← єдиний новий імпорт

// Langfuse handler (читає ключі з .env)
const langfuseHandler = new CallbackHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
});

// Все те саме що в agent.js
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    workshop: {
      transport: "stdio",
      command: "node",
      args: ["../01-server/server.js"],
    },
  },
});

const tools = await mcpClient.getTools();

const llm = new ChatOpenAI({
  openAIApiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: process.env.LITELLM_BASE_URL },
  model: process.env.LLM_MODEL,
});

const agent = createReactAgent({ llm, tools });

// ЄДИНА ЗМІНА: додаємо callbacks: [langfuseHandler]
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Скільки буде 15 + 27?" }] },
  { callbacks: [langfuseHandler] }  // ← ось і все трасування
);

console.log(result.messages.at(-1).content);

// Важливо: flush перед завершенням (надсилає дані в Langfuse)
await langfuseHandler.flushAsync();
await mcpClient.close();
```

<!--
Порівняйте з agent.js -- різниця тільки в 3 рядках: імпорт, ініціалізація, callbacks.
Покажіть Langfuse dashboard після запуску.
-->
