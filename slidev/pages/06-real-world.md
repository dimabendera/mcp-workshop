---
layout: center
---

# 🌍 Real-World MCP

_Що вже існує і що можна підключити сьогодні_

<!--
Тут показуємо "вау ефект". Не просто теорія -- показуємо реальні сервери.
-->

---

# Офіційні вендорні сервери

| Сервер | Що робить | WOW |
|--------|-----------|-----|
| **Figma MCP** | Читає дизайн, пише компоненти у Figma | 🔥🔥🔥 |
| **GitHub MCP** | PR, issues, CI, пошук по коду | 🔥🔥🔥 |
| **Sentry MCP** | Читає помилки з prod, генерує патчі | 🔥🔥🔥 |
| **Supabase MCP** | Управляє БД, auth, storage, edge functions | 🔥🔥🔥 |
| **Stripe MCP** | Payments, customers, subscriptions | 🔥🔥 |
| **Atlassian Rovo** | Jira + Confluence (офіційний, OAuth) | 🔥🔥 |

<!--
Figma MCP -- це особливо вражає. Покажіть демо або скріншот.
GitHub MCP -- найпопулярніший. Більшість розробників одразу бачать цінність.
-->

---

# Сервери для розробників

| Сервер | Що робить |
|--------|-----------|
| **Context7** | Актуальна документація бібліотек без галюцинацій |
| **Puppeteer / Playwright** | Повна автоматизація браузера, скріншоти |
| **Chrome DevTools** | Інспекція DOM, network, performance |
| **PostgreSQL / SQLite** | SQL запити до БД через природню мову |
| **Filesystem** | Читання/запис файлів (офіційний) |
| **Fetch** | HTTP запити з будь-якого URL |

<v-click>

```bash
# Встановити PostgreSQL MCP сервер
npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb

# Встановити Filesystem сервер
npx -y @modelcontextprotocol/server-filesystem /path/to/folder
```

</v-click>

<!--
Context7 -- дуже корисний для розробки: LLM завжди має свіжу документацію.
Playwright -- показати скріншот або демо. Це дуже вражає аудиторію.
-->

---

# Для вашої команди

| Кейс | Сервер |
|------|--------|
| **Jira** | Atlassian Rovo MCP (офіційний, хмарний) |
| **Figma** | Figma MCP Server (офіційний) |
| **WikiJS** | `@cahaseler/wikijs-mcp` або `wikijs-mcp-server` |
| **GitLab** | Офіційний GitLab MCP (86+ інструментів) |
| **Slack** | Офіційний Slack MCP |

<v-click>

**Каталоги серверів:**
- `mcpservers.org` — 70+ перевірених серверів
- `glama.ai/mcp/servers` — 36 000+ відкритих серверів
- `github.com/punkpeye/awesome-mcp-servers` — кращі curated

</v-click>

<!--
Jira -- Atlassian Rovo: хмарний OAuth, не треба свій сервер.
Для GitLab -- 86 інструментів з CI/CD, дуже потужно.
-->

---
layout: two-cols
---

# Конфіг для команди — `.vscode/mcp.json`

```json
{
  "servers": {
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost/mydb"
      ]
    },
    "git": {
      "type": "stdio",
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

::right::

# Що вміє кожен

**`server-postgres`**
- SQL через природну мову
- `list_tables`, `describe_table`
- AI пише і виконує міграції

<br>

**`mcp-server-git`**
- `git_log`, `git_diff`, `git_blame`
- Пояснює зміни, пише commit messages
- Потребує Python (`uvx` з `uv`)

<br>

**`context7`**
- Актуальна документація без галюцинацій
- React, Vue, Next.js, Tailwind та ін.
- Без реєстрації, безкоштовно

<!--
Показати: відкрити .vscode/mcp.json, додати один сервер, перезапустити VS Code -- і готово.
Postgres -- killer feature: "знайди всіх users з роллю admin" і AI сам пише SQL.
-->

---

# Context7 — завжди свіжа документація

**Проблема:** LLM навчений на старих даних → галюцинує API

```
User: "Як використовувати useEffect в React 19?"
LLM:  "useEffect приймає callback і dependencies..." ← може бути застарілим
```

**З Context7:**

```
User: "Як використовувати useEffect в React 19?"
C7 → отримує актуальну документацію React 19 з офіційного сайту
LLM: "В React 19 useEffect змінив..." ← точна актуальна відповідь
```

```bash
npx -y @upstash/context7-mcp
```

<!--
Дуже практичний приклад. Показати налаштування в VS Code/Cline.
-->

---

# Playwright — AI-браузер

```bash
npx @playwright/mcp@latest
```

Що може AI агент:
- Відкрити URL, натиснути кнопку, заповнити форму
- Зробити скріншот сторінки
- Прочитати DOM елементи
- Виконати JavaScript на сторінці
- Завантажити файл

<v-click>

```
User: "Зайди на github.com/microsoft, знайди репозиторій з більше ніж 10к зірок і зроби скріншот"
AI:   → playwright.navigate(url)
      → playwright.screenshot()
      → "Ось репозиторій TypeScript з 98k зірок [скріншот]"
```

</v-click>

<!--
Якщо є час -- покажіть live demo з Playwright.
Це найбільший "вау ефект" для більшості аудиторій.
-->
