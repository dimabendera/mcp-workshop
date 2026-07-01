---
layout: cover
---

# ⚙️ Крок 0
## Налаштування середовища

<!--
Даємо 5-7 хвилин. Поки студенти встановлюють — можна пояснити структуру проекту.
-->

---

# Що потрібно встановити

<v-clicks>

**Node.js 20+**
```bash
node --version  # має бути v20 або вище
```

**Python 3.11+** (для Python прикладів)
```bash
python --version  # має бути 3.11+
```

**Репозиторій з кодом**
```bash
git clone https://github.com/dimabendera/mcp-workshop
cd mcp-workshop/workshop
```

</v-clicks>

<!--
Якщо репо ще не готове — студенти можуть просто створити папку workshop/ і скопіювати файли з екрану.
-->

---

# Встановлення залежностей

**JavaScript:**
```bash
# В папці workshop/
npm install
```

Що встановиться:
- `@modelcontextprotocol/sdk` — MCP SDK
- `@langchain/mcp-adapters` + `@langchain/openai` + `@langchain/langgraph` — LangChain
- `zod` — валідація параметрів
- `dotenv` — змінні середовища
- `langfuse-langchain` — трасування

**Python:**
```bash
pip install -r requirements.txt
```

<!--
npm install займе ~30 секунд. Чудовий момент щоб розповісти про структуру проекту.
-->

---

# Налаштування .env

Скопіюйте шаблон і заповніть значення які дав ведучий:

```bash
cp .env.example .env
```

```ini {maxHeight:'220px'}
# ── LiteLLM Proxy (внутрішній LLM) ───────────────
LITELLM_BASE_URL=          # 
LITELLM_API_KEY=           # 
LLM_MODEL=                 # 

# ── Langfuse (трасування — крок 6) ───────────────
LANGFUSE_PUBLIC_KEY=       # 
LANGFUSE_SECRET_KEY=       # 
LANGFUSE_BASEURL=          # 

# ── MCP Bearer Token (для HTTP сервера — крок 6) ─
MCP_SECRET=your-secret

# ── AUTO.RIA API (крок 4) ────────────────────────
AUTO_RIA_SEARCH_URL=       # 
AUTO_RIA_USED_URL=         # 
AUTO_RIA_NEW_URL=          # 
AUTO_RIA_NEW_OPTIONS_URL=  # 
```

<v-click>

**Перевірка:** `node -e "require('dotenv').config(); console.log(process.env.LLM_MODEL)"`

</v-click>

<!--
Заповніть разом з аудиторією — ведучий диктує значення (не показує URL на екрані).
Всі ключі потрібні поступово: LiteLLM з кроку 1, Langfuse і AUTO.RIA з кроку 4-6.
LITELLM_BASE_URL і LITELLM_API_KEY — внутрішній proxy, студенти отримують від вас.
LANGFUSE_* — також внутрішній instance або langfuse.com (план free доступний).
MCP_SECRET — студент придумує сам, будь-який рядок.
-->

---

# Структура проекту

```
workshop/
  ├── .env                    ← змінні середовища (заповнили)
  ├── package.json            ← JS залежності
  ├── requirements.txt        ← Python залежності
  │
  ├── 01-server/              ← Крок 1: math сервер (add)
  │   ├── server.js           ← JS версія
  │   └── server.py           ← Python версія
  │
  ├── 02-server/              ← Крок 4: AUTO.RIA сервер (search_cars)
  │   ├── server.js           ← JS версія
  │   └── server.py           ← Python версія
  │
  ├── 02-client/              ← Крок 3: MCP клієнт
  ├── 03-agent-loop/          ← Крок 4: LangChain агент (обидва сервери)
  ├── 04-http-server/         ← Крок 6: HTTP транспорт
  └── 05-langfuse/            ← Крок 6: трасування
```

<!--
Відкрийте кожен файл і показуйте по черзі.
Кожен файл має детальні коментарі — читаємо разом.
Запуск через npm run: server, search-server, client, agent, http, traced.
-->
