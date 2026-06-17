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

```ini
# LiteLLM Proxy (внутрішній LLM — URL і ключ дає ведучий)
LITELLM_BASE_URL=https://...
LITELLM_API_KEY=sk-...
LLM_MODEL=ria_llm_latest

# Langfuse (трасування — знадобиться в кроці 6)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASEURL=http://...
```

<v-click>

**Перевірка:** запустіть `node -e "require('dotenv').config(); console.log(process.env.LITELLM_BASE_URL)"` — має вивести URL.

</v-click>

<!--
Заповніть разом з аудиторією. Скажіть де взяти токени для Langfuse.
LiteLLM proxy URL — взяти у вас (ведучого).
-->

---

# Структура проекту

```
workshop/
  ├── .env                    ← змінні середовища (заповнили)
  ├── package.json            ← JS залежності
  ├── requirements.txt        ← Python залежності
  │
  ├── 01-server/              ← Крок 1: MCP сервер
  │   ├── server.starter.js   ← відкрийте це для написання
  │   ├── server.js           ← готова версія (reference)
  │   └── server.py           ← Python версія
  │
  ├── 02-client/              ← Крок 3: MCP клієнт
  ├── 03-agent-loop/          ← Крок 4: LangChain агент
  ├── 04-http-server/         ← Крок 6: HTTP сервер
  └── 05-langfuse/            ← Крок 6: трасування
```

<!--
Поясніть: .starter.js файли — для написання разом.
.js без суфіксу — готова версія якщо щось пішло не так.
-->
