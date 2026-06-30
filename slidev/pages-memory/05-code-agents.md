---
layout: center
---

# 🤖 Блок 5: Пам'ять для code-агентів

_Claude Code, Cursor, Cline та подібні — як вони пам'ятають?_

<!--
НОТАТКИ ДОПОВІДАЧА:
Цей блок про AI coding assistants (Claude Code, Cursor, Cline, GitHub Copilot тощо).

Основна відмінність від чат-бота: ці агенти мають доступ до:
- Файлової системи проекту
- Термінала (виконання команд)
- Інструментів (git, тести, linting)

Питання до аудиторії: "Хто використовує Claude Code або Cursor?"
→ У них вже є пам'ять — давайте розберемось яка.
-->

---

# Виклик: між сесіями все зникає

Ти розповів агенту про контекст проекту. Наступного дня — треба розповідати знову.

```
╔══════════════════════════════════════════════════════════╗
║  СЕСІЯ 1 (понеділок):                                   ║
║  Ти: "Ми використовуємо ClickHouse для аналітики,       ║
║        LiteLLM proxy на localhost:4000,                  ║
║        завжди пиши LIMIT 10000 в SQL"                   ║
║  Агент: [запам'ятав на сесію, зробив все правильно]      ║
╠══════════════════════════════════════════════════════════╣
║  СЕСІЯ 2 (вівторок):                                    ║
║  Агент: [контекст скинуто]                              ║
║  Агент: SELECT * FROM events  ← без LIMIT! 😡           ║
║  Агент: db.connect("localhost:3306") ← MySQL? 😤         ║
╚══════════════════════════════════════════════════════════╝
```

<v-click>

**Рішення:** зберігаємо контекст між сесіями через **файли**.
Агент читає їх автоматично на старті кожної сесії.

</v-click>

<!--
НОТАТКИ ДОПОВІДАЧА:
Це найбільша практична проблема при роботі з coding assistants.

Claude Code читає CLAUDE.md при кожному старті — це є документована поведінка.
Cursor читає .cursorrules.
Cline читає .clinerules.
GitHub Copilot читає .github/copilot-instructions.md.

Ідея: файл = довгострокова пам'ять агента.
Ти пишеш правила один раз → агент використовує їх завжди.
-->

---
layout: two-cols
---

# CLAUDE.md: постійна пам'ять агента

**CLAUDE.md** — файл в корені проекту. Claude Code читає його автоматично на кожній сесії.

```markdown
# AI Data-Assist — Контекст проекту

## Стек
- Backend: FastAPI + Python 3.11
- БД: ClickHouse (аналітика), MySQL, ES
- LLM: LiteLLM proxy → localhost:4000
- Embedding: qwen_vl_embedding_2b

## Критичні правила
- ЗАВЖДИ LIMIT в SQL (max 10000)
- НЕ МОЖНА: DROP, DELETE, ALTER
- event_date в WHERE ОБОВ'ЯЗКОВО
- Для dry-run: додай EXPLAIN перед SELECT

## Команди
- Запуск: `python main.py`
- Тести: `pytest tests/ -v`
- Логи: `tail -f logs/agent.log`
```

::right::

**Глобальна пам'ять** (між проектами):
```
~/.claude/CLAUDE.md
```
Твої особисті preferences, стиль коду, команда.

**Ієрархія читання:**
```
~/.claude/CLAUDE.md      (1. глобальна)
├── /project/CLAUDE.md   (2. проект)
│   └── /src/CLAUDE.md   (3. підпапка)
```

**Claude Code auto memory** (записує сам):
```
~/.claude/projects/<hash>/memory/
  user.md      feedback.md
  project.md   reference.md
```

<!--
НОТАТКИ ДОПОВІДАЧА:
CLAUDE.md — найпростіший і найефективніший інструмент.

Що писати в CLAUDE.md:
1. Технічний стек (які БД, фреймворки, версії)
2. Архітектурні рішення ("ми не використовуємо ORM, тільки raw SQL")
3. Критичні правила (безпека, обмеження)
4. Команди для запуску/тестування/деплою
5. Де знайти документацію (Confluence, wiki URL)
6. Хто відповідальний за що

Що НЕ писати:
- Тимчасові задачі (це в todo)
- Вирішені баги
- Код (тільки команди)

Auto Memory в Claude Code: агент сам записує важливе між сесіями
в структуровані файли у ~/.claude/projects/.
Детальна документація: docs.claude.ai/code/memory
-->

---

# Skills vs багато MCP серверів

**Проблема:** якщо підключити 50+ MCP серверів → усі їх tools завантажуються в контекст.

```
╔══════════════════════════════════════════════════════════╗
║  БАД ПРАКТИКА: 50 MCP servers × 10 tools = 500 tools    ║
║                                                          ║
║  Tool 1: read_file     Tool 251: postgres_query         ║
║  Tool 2: write_file    Tool 252: postgres_insert        ║
║  ...                   ...                              ║
║  Tool 500: slack_send                                   ║
║                                                          ║
║  → Контекст: +20K токенів тільки на опис tools!         ║
║  → LLM плутається який tool використати                 ║
║  → Якість падає, вартість зростає                       ║
╚══════════════════════════════════════════════════════════╝
```

<v-click>

**Краще: Skills (скіли)** — компактні, контекстуальні "мета-інструменти":

```
Skill: "database-query"
→ Одна точка входу
→ Всередині: вирішує ClickHouse vs MySQL vs ES
→ В контексті: 1 tool замість 15
```

</v-click>

<!--
НОТАТКИ ДОПОВІДАЧА:
Це практична порада для тих хто будує MCP-based системи.

Skill = slash-command або custom agent instruction в Claude Code.
Skills зберігаються в .claude/settings.json або як окремі файли.

Принцип: "tool per intent" не "tool per operation".
Поганий підклад: окремий tool для кожного SQL запиту.
Гарний підклад: один tool "query_database(question)" який сам вирішує SQL.

Аналогія: замість давати людині 50 кнопок приладу → дати один пульт
де "канал+" автоматично робить все що треба.

Для Claude Code: /my-skill → виконує складну послідовність дій.
-->

---
layout: two-cols
---

# Пам'ять між сесіями: coding агенти

**Проблема:** нова сесія = порожній контекст.

**[Hindsight](https://github.com/vectorize-io/hindsight)** (91.4% LongMemEval):
```js
import { Hindsight } from "@vectorize-io/hindsight";
const mem = new Hindsight({ apiKey: "..." });
await mem.retain("Ми використовуємо ClickHouse");
const ctx = await mem.recall("яка БД в проекті?");
await mem.reflect(); // рефлексія → нові insights
```

**[agentmemory](https://github.com/rohitg00/agentmemory)** (npm: `myagentmemory`):
```jsonc
// .claude/settings.json:
{ "mcpServers": { "memory": {
    "command": "agent-memory", "args": ["serve"]
}}}
// MEMORY.md + SCRATCHPAD.md (plain markdown)
// 95.2% R@5 | Claude Code, Cursor, Codex ✅
```

::right::

**Шарінг між агентами і vendorами**

**[claude-mem](https://github.com/thedotmack/claude-mem)** — persistent context:
```bash
npm install -g claude-mem
claude-mem save / load
```
Підтримка: Claude Code, Codex, Gemini CLI, Copilot.

**[ai-memory](https://github.com/akitaonrails/ai-memory)** — shared wiki між агентами:
```
Claude Code ──▶ [wiki.md] ◀── Cursor
                    ↑
            ai-memory (auto-capture)
```
Автоматичний handoff: сесія закінчилась → narrative rewrite.

**Підсумок:**

```
Сесія 1 (Claude Code, пн):
  retain("LIMIT 10000 в SQL завжди")

Сесія 2 (Cursor, вт):
  recall("SQL правила") → ✅ пам'ятає
```

<!--
НОТАТКИ ДОПОВІДАЧА:
Ці інструменти закривають gap який CLAUDE.md не закриває:
CLAUDE.md = статичні правила (ти пишеш вручну).
Hindsight / agentmemory = динамічна пам'ять (агент записує автоматично).

agentmemory — найпростіший старт. Markdown файли, без БД, без cloud.
MCP сервер підключається до Claude Code одним рядком у settings.json.
Працює також з Cursor, Codex, Gemini CLI, OpenCode.
95.2% R@5 = висока точність пошуку (BM25 + vector пошук).

Hindsight — більш потужний. retain/recall/reflect API.
91.4% LongMemEval = state-of-the-art на момент релізу.
"World facts" pathway (загальні факти) + "experiences" pathway (що спрацювало).
Потрібен API key на vectorize.io.

claude-mem і ai-memory — для команд де різні люди використовують різні агенти.
Якщо один розробник на Claude Code, інший на Cursor — ai-memory дає shared context.

Claude Code auto memory (наш поточний ~/.claude/projects/<hash>/memory/):
вже вирішує багато потреб. Hindsight/agentmemory — якщо треба більше.
-->
