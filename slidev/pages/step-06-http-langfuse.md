# Langfuse — навіщо і як

**Проблема:** LangChain ховає деталі виконання → важко зрозуміти що відбулось.

**Рішення:** Langfuse показує всі кроки агента в реальному часі.

```bash
npm run traced   # запустить agent-traced.js
```

**Що побачите в dashboard:**
- Кожен виклик tool: назва, параметри, результат, latency
- Всі LLM запити: prompt, відповідь, кількість токенів, ціна
- Загальний trace: від запиту до відповіді — де витрачається час

> **Чому це важливо:** LLM — недетермінований.  
> Без логів неможливо зрозуміти чому агент прийняв неправильне рішення.

<!--
Відкрийте Langfuse dashboard поки студенти запускають npm run traced.
Покажіть trace в реальному часі — достатньо 2-3 хвилини.
LangChain як будь-який high-level фреймворк ховає деталі → Langfuse їх відкриває.
Показати: tool calls, LLM calls, latency breakdown, token usage.
-->

---

## `workshop/05-langfuse/agent-traced.js`

```js {maxHeight:'420px'}
// agent-traced.js — той самий agent.js + 3 рядки для Langfuse

import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { CallbackHandler } from "langfuse-langchain"; // ← 1. новий імпорт

// 2. Langfuse handler
const langfuseHandler = new CallbackHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
});

// Все те саме що в agent.js ↓
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    math: { transport: "stdio", command: "node", args: ["../01-server/server.js"] },
    autoria: { transport: "stdio", command: "node", args: ["../02-server/server.js"] },
  },
});
const tools = await mcpClient.getTools();
const llm = new ChatOpenAI({
  apiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: process.env.LITELLM_BASE_URL },
  model: process.env.LLM_MODEL,
});
const agent = createReactAgent({ llm, tools });

// 3. Єдина зміна при виклику — callbacks: [langfuseHandler]
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Знайди BMW X5 дизель до 20000 доларів" }] },
  { callbacks: [langfuseHandler] }  // ← ось і все
);

console.log(result.messages.at(-1).content);
await langfuseHandler.flushAsync();
await mcpClient.close();
```

<!--
Порівняйте з agent.js — різниця тільки в 3 місцях: імпорт, ініціалізація, callbacks.
Все решта ідентично. flushAsync() — важливо: без нього дані можуть не дійти до Langfuse.
Показати в Langfuse dashboard: tools/list call, tool_use виклик, final answer.
-->
