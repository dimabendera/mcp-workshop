---
layout: cover
---

# 📊 Крок 6
## HTTP Сервер + Langfuse

Деплоїмо сервер і бачимо що відбувається всередині

<!--
Останній практичний крок. HTTP = можна деплоїти. Langfuse = можна дебажити.
-->

---
layout: two-cols
---

# stdio vs HTTP: коли що

**stdio — для локального dev:**
- Сервер запускається автоматично
- Не потрібен окремий процес
- Тільки localhost
- Для dev-інструментів і особистих скриптів

**HTTP — для команди/прод:**
- Один сервер → багато клієнтів
- Доступний з мережі
- Підтримує авторизацію Bearer/OAuth
- Можна деплоїти в Docker/K8s

::right::

# Різниця в коді: мінімальна

**stdio (крок 1):**
```js
const transport = new StdioServerTransport();
await server.connect(transport);
```

**HTTP (крок 6):**
```js
const transport = new StreamableHTTPServerTransport({...});
app.post("/mcp", async (req, res) => {
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});
app.listen(3000);
```

**Сервер (server.tool(...)): ідентичний!**

<!--
Підкресліть: бізнес логіка (server.tool) залишається незмінною.
Тільки транспорт змінюється. Це і є сила абстракції MCP.
-->

---

# Навіщо Langfuse?

**Без трасування:**
```bash
node agent.js
→ "15 + 27 = 42"   ← і все. Не знаємо що відбувалось
```

**З Langfuse:**

```
mcp-agent (340ms, 285 tokens)
├── llm-call-1 (claude-haiku, 150 tokens, 180ms)
│   input:  [{ role: "user", content: "Скільки 15+27?" }]
│   output: [{ type: "tool_use", name: "add", input: {a:15,b:27} }]
├── tool:add (2ms)
│   input:  { a: 15, b: 27 }
│   output: "42"
└── llm-call-2 (claude-haiku, 135 tokens, 160ms)
    input:  [..., tool_result: "42"]
    output: "15 + 27 = 42"
```

<!--
Покажіть реальний Langfuse dashboard. Студенти мають побачити що там видно кожен крок.
Langfuse безкоштовний для self-hosted і має хмарний free tier.
-->

---

# Langfuse Dashboard — що ви бачите

```
┌──────────────────────────────────────────────────────────────┐
│  Trace: mcp-agent          340ms  •  285 tokens  •  $0.0003  │
├──────────────────────────────────────────────────────────────┤
│  ├─ LLM  claude-haiku           180ms    150 tok             │
│  │   INPUT:  [user] "Скільки 15 + 27?"                       │
│  │   OUTPUT: tool_use → add({ a: 15, b: 27 })               │
│  │                                                           │
│  ├─ Tool  add                   2ms                          │
│  │   INPUT:  { a: 15, b: 27 }                               │
│  │   OUTPUT: "42"                                            │
│  │                                                           │
│  └─ LLM  claude-haiku           160ms    135 tok             │
│      INPUT:  [ ..., { role: "tool", content: "42" } ]        │
│      OUTPUT: "15 + 27 = 42"                                  │
└──────────────────────────────────────────────────────────────┘
```

<v-click>

**Вкладки в dashboard:** Traces · Sessions · Users · Evaluations · Datasets · Prompts

→ безкоштовний self-host або хмарний free tier: `langfuse.com`

</v-click>

<!--
Покажіть реальний dashboard якщо є доступ.
Ключові метрики: latency по кожному кроку, токени, вартість.
-->

---

# Langfuse через LangChain callbacks

З LangChain — **один рядок** щоб додати трасування:

```js
import { CallbackHandler } from "langfuse-langchain";

// Ініціалізуємо handler
const langfuseHandler = new CallbackHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
});

// Додаємо до agent.invoke — ТІЛЬКИ ЦЕ ЗМІНЮЄТЬСЯ
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Скільки 15 + 27?" }] },
  { callbacks: [langfuseHandler] }  // ← один рядок
);

// Flush перед завершенням
await langfuseHandler.flushAsync();
```

<v-click>

Все інше — без змін. LangChain сам логує кожен крок.

</v-click>

<!--
Порівняйте з ручним трасуванням (trace.span, generation.end...) -- набагато простіше.
LangChain callbacks = hooks на кожну операцію агента.
-->
