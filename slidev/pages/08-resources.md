---
layout: center
---

# Просунуті теми (швидкий огляд)

---

# Контекстна інженерія для Tools

**Опис tool = prompt для LLM.** Якість опису впливає на рішення агента.

<div grid="~ cols-2 gap-6">
<div>

**Погано:**
```js
server.tool("query_db", { sql: z.string() }, ...)
// Опис: "Query database"
// → LLM не знає коли використовувати
```

</div>
<div>

**Добре:**
```js
server.tool(
  "search_users",
  {
    query: z.string().describe(
      "Пошуковий запит — ім'я або email"
    ),
  },
  // Опис: "Шукає користувачів по імені або email.
  //  Використовуй коли питають про конкретну людину
  //  або потрібні контактні дані."
  handler
)
```

</div>
</div>

---

# Скільки Tools підключати?

| Кількість | Ефект |
|-----------|-------|
| 1–20 | Оптимально, LLM легко вибирає |
| 20–50 | Зростають витрати токенів на контекст |
| 50+ | LLM може плутатись, повільніше |

<v-click>

**Рішення для великих систем:** RAG для інструментів

```
Запит → векторний пошук по описах tools → топ-5 релевантних → LLM
```

Замість передавати всі 100+ tools — передаємо тільки найбільш схожі до запиту.

</v-click>

---

# RAG для інструментів — як це працює

**RAG-MCP (arxiv 2025):** зменшує prompt на 50%, точність вибору tools ×3

```
┌─ Всі tools у векторній БД ──────────────────────────────────┐
│  add(a,b)       → "складає два числа..."                    │
│  search_users() → "шукає користувача по імені або email..." │
│  send_email()   → "відправляє email на вказану адресу..."   │
│  ... 100+ more ...                                          │
└─────────────────────────────────────────────────────────────┘
           ↓  запит користувача
┌─ Semantic Search ───────────────────────────────────────────┐
│  "Скільки буде 15 + 27?"                                    │
│  → cosine similarity по embeddings                          │
│  → топ-5 релевантних: [ add, multiply, subtract, ... ]     │
└─────────────────────────────────────────────────────────────┘
           ↓  тільки топ-5 → LLM  (замість 100+)
```

<v-click>

```js
// ChromaDB + LangChain
const relevantTools = await vectorStore.similaritySearch(userQuery, 5);
const agent = createReactAgent({ llm, tools: relevantTools });
```

</v-click>

---

# Ресурси для подальшого вивчення

<div grid="~ cols-2 gap-8">
<div>

**Офіційні:**
- `modelcontextprotocol.io` — специфікація
- `spec.modelcontextprotocol.io` — детальна документація
- `github.com/modelcontextprotocol` — офіційні SDK
- `github.com/microsoft/mcp-for-beginners` — навчальний курс

**SDK:**
- `@modelcontextprotocol/sdk` (JS/TS)
- `mcp[cli]` (Python, fastmcp)
- `langchain-mcp-adapters` (Python + LangChain)
- `@langchain/mcp-adapters` (JS + LangChain)

</div>
<div>

**Каталоги серверів:**
- `mcpservers.org` — 70+ перевірених
- `glama.ai/mcp/servers` — 36k+
- `github.com/punkpeye/awesome-mcp-servers`

**Спільнота:**
- Discord: `discord.gg/modelcontextprotocol`
- GitHub Discussions в modelcontextprotocol repo

</div>
</div>

---
layout: cover
---

# Дякую!

<div class="flex items-center justify-center gap-16 mt-4">
<div class="text-left">

**Код з воркшопу:**

`github.com/dimabendera/mcp-workshop`

<br>

**Курс для початківців:**

`github.com/microsoft/mcp-for-beginners`

<br>

Питання?

</div>
<img src="/images/qr-workshop.svg" class="h-48" />
</div>

<!--
QR веде на github.com/dimabendera/mcp-workshop
-->
