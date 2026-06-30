---
layout: center
---

# 🛠️ Блок 8: Огляд фреймворків

_Що обрати і коли — швидкий гід_

<!--
НОТАТКИ ДОПОВІДАЧА:
Тут тільки огляд і порівняння — без коду.
Код прикладів вже показано в попередніх блоках де це доречно.

Питання до аудиторії: "Хто вже використовував LangChain? LangGraph?"
Це допоможе зрозуміти рівень аудиторії для глибини пояснення.
-->

---

# LangChain: найпопулярніший старт

**LangChain** — фреймворк для LLM-додатків. Велика екосистема, багато готових компонентів.

```
LangChain Memory classes (для конверсації):
  ConversationBufferMemory          → все підряд (Блок 2, слайд 1)
  ConversationBufferWindowMemory    → останні N (Блок 2, слайд 2)
  ConversationSummaryMemory         → саммарі (Блок 2, слайд 3)
  ConversationSummaryBufferMemory   → гібрид (Блок 2, слайд 4) ← найкращий
  ConversationEntityMemory          → сутності (Блок 6)
  VectorStoreRetrieverMemory        → RAG (Блок 4)
```

<div grid="~ cols-2 gap-6">
<div>

✅ **Плюси:**
- Найбільша екосистема (1000+ інтеграцій)
- Велика документація, багато прикладів
- Швидкий старт
- npm: `@langchain/core`, `@langchain/openai`

</div>
<div>

❌ **Мінуси:**
- Абстракції ховають деталі (складно дебажити)
- Швидко змінюється API (deprecated часто)
- `ConversationMemory` класи — застаріває на користь LangGraph
- Для складних агентів — LangGraph краще

</div>
</div>

<!--
НОТАТКИ ДОПОВІДАЧА:
LangChain — найкраще для навчання і PoC.
Для продакшн: часто варто перейти на LangGraph або власну реалізацію.

Важливо: в нових версіях LangChain (0.3+) Memory класи вважаються legacy.
Нові агенти будують на LangGraph.

npm packages:
@langchain/core — основа
@langchain/openai — OpenAI/LiteLLM
@langchain/langgraph — граф-агенти
@langchain/mcp-adapters — MCP підтримка
langchain — все разом (але великий, краще окремі пакети)
-->

---
layout: two-cols
---

# LangGraph: стан + персистентність

**LangGraph** — граф стану для складних агентів. Checkpointing між запитами.

```js
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SqliteSaver } from "@langchain/langgraph/checkpoint/sqlite";

const checkpointer = SqliteSaver.fromConnString("./agent.db");
const agent = createReactAgent({ llm, tools, checkpointer });

const config = { configurable: { thread_id: "user_ivan" } };

await agent.invoke({ messages: [["user", "Я Іван"]] }, config);
await agent.invoke({ messages: [["user", "Як мене звуть?"]] }, config);
// → "Вас звуть Іван ✅"
```

::right::

**LangGraph** якщо: persistent стан, складна логіка, multi-agent, HITL

**LangChain** якщо: проста RAG, навчання / PoC, без стану

**Thread ID стратегія:**
```js
{ thread_id: "global" }           // одна для всіх
{ thread_id: `user_${userId}` }   // per user
{ thread_id: `task_${taskId}` }   // per task
```

**SqliteSaver** → self-hosted (файл на диску)
**PostgresSaver** → PostgreSQL
**MemorySaver** → тільки RAM (для тестів)

<!--
НОТАТКИ ДОПОВІДАЧА:
LangGraph — активно розвивається, LangChain Inc. вважає це майбутнім.
Документація: python.langchain.com/docs/langgraph (є і JS версія).

SqliteSaver — для self-hosted (файл на диску).
PostgresSaver — для PostgreSQL (ми вже використовуємо).
MemorySaver — тільки в RAM (для тестів).

thread_id стратегія дуже важлива:
- Один thread_id для всіх = всі юзери бачать спільну пам'ять ← небезпечно!
- Per user = кожен юзер має свою "гілку" пам'яті ← правильно

Граф = ти сам визначаєш вузли і ребра.
Вузол = функція (виклик LLM, tool, умова).
Ребро = перехід між вузлами (може бути умовним).
-->

---

# Mem0, Zep, MemGPT: спеціалізовані рішення

<div grid="~ cols-2 gap-6">
<div>

**Mem0** (GitHub: mem0ai/mem0, Apache 2.0)

Автоматична екстракція фактів з розмов.
Self-hosted або managed cloud.

Коди прикладів: Блок 6 (персональні агенти).

```bash
# Self-hosted:
docker run -p 8080:8080 mem0/mem0
```

**Zep** (GitHub: getzep/zep, Apache 2.0)

Long-term memory з Knowledge Graph.
Entity extraction, temporal memory.

Також: Блок 6.

```bash
docker-compose up -d  # з docker-compose.yml
```

</div>
<div>

**MemGPT / Letta** (GitHub: letta-ai/letta, Apache 2.0)

OS-like memory management.
Агент сам керує пам'яттю: main context + archival.

Для довготривалих автономних агентів.

```bash
pip install letta
letta server  # запускає локальний сервер
```

**Порівняння:**
```
Задача → Рішення
─────────────────────────────────
Чат-бот між сесіями → LangGraph
Персоналізація юзера → Mem0
Складні зв'язки     → Zep + graph
Автономний агент    → MemGPT/Letta
RAG знання          → Chroma/Qdrant
```

</div>
</div>

<!--
НОТАТКИ ДОПОВІДАЧА:
Всі перераховані — open source і self-hosted.

Mem0 vs Zep:
Mem0 — простіше в налаштуванні, краще для персоналізації.
Zep — більш enterprise, має knowledge graph, темпоральну пам'ять.

MemGPT/Letta — академічний проект став продуктом.
Цікавий концептуально, але складний в налаштуванні.
Краще для прототипів "автономних агентів" ніж для продакшн.

Для нашого проекту (AI Data-Assist):
- LangGraph + SQLite для стану сесій
- Власна KB (BM25 + embeddings) для RAG
- Markdown файли для процедурної пам'яті
- HITL запис нових правил
Це кастомне рішення без Mem0/Zep.
-->

---
layout: two-cols
---

# Порівняльна таблиця фреймворків

**Conversation memory:**
- LangChain Memory ⭐
- LangGraph + SqliteSaver ⭐⭐

**RAG / векторний пошук:**
- ChromaDB ⭐ — PoC
- Qdrant ⭐⭐ — self-hosted продакшн
- ES / OpenSearch ⭐⭐ — hybrid
- GraphRAG ⭐⭐⭐ — граф знань

**Персоналізація:**
- Mem0 ⭐ — факти про юзерів
- Zep ⭐⭐ — entity + temporal
- CLAUDE.md ⭐ — rules/skills

::right::

# Практичний старт

**Мінімальний стек:**  
`LangGraph + ChromaDB + CLAUDE.md`  
→ покриває 80% потреб.

**Порядок впровадження:**

1. CLAUDE.md → одразу (5 хв)
2. LangChain Memory → PoC
3. LangGraph + SqliteSaver → продакшн
4. Chroma/Qdrant + RAG → знання
5. Mem0/Zep → персоналізація

Всі — **open source**, self-hosted.

<!--
НОТАТКИ ДОПОВІДАЧА:
Важливо: всі в таблиці — безкоштовні open source рішення.
Платні (Pinecone, Zep Cloud, Mem0 Pro) — не включав, вони для зручності ops а не для функціональності.

"⭐ складність" = легко налаштувати за годину.
"⭐⭐⭐ складність" = треба глибоке розуміння або тиждень налаштування.

Порада: починай з ⭐, переходь до ⭐⭐ тільки коли є конкретна потреба.
-->
