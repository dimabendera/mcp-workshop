---
layout: center
---

# Проблема: Integration Hell

_Кожна нова модель — нові інтеграції з нуля_

<!--
Починаємо з болю. Спитайте аудиторію: хто пробував підключити свій AI до зовнішніх даних?
Типова відповідь: "кожен раз пишемо кастомний код".
-->

---

# До MCP: N моделей × M інструментів

```mermaid
graph LR
  GPT[GPT-4] -->|"кастомний код #1"| Jira
  GPT -->|"кастомний код #2"| Slack
  Claude -->|"кастомний код #3"| Jira
  Claude -->|"кастомний код #4"| Slack
  Gemini -->|"кастомний код #5"| Jira

  style GPT fill:#74aa9c,color:#000
  style Claude fill:#c96442,color:#fff
  style Gemini fill:#4285f4,color:#fff
```

<v-click>

**3 моделі × 2 інструменти = 6 кастомних інтеграцій**

Кожна — своя авторизація, свій формат, ламається при оновленнях

</v-click>

<!--
"3 моделі × 2 інструменти" — це демо приклад.
Реальні системи мають 5+ моделей і 10+ інструментів = 50+ інтеграцій.
Кожна ламається незалежно. Кошмар підтримки.
-->

---

# MCP = USB-C для AI

```mermaid
graph LR
  GPT[GPT-4] --> MCP["🔌 MCP Protocol"]
  Claude --> MCP
  Gemini --> MCP
  MCP --> S1["🔧 MCP Server\nJira"]
  MCP --> S2["🔧 MCP Server\nSlack"]
  MCP --> S3["🔧 MCP Server\nDatabase"]

  style MCP fill:#6366f1,color:#fff,font-weight:bold
```

<v-clicks>

- Написав сервер **один раз** → працює з будь-якою моделлю
- Підключив нову модель → вона одразу бачить **всі** сервери
- Спільнота вже написала **тисячі** готових серверів

</v-clicks>

<!--
Аналогія: USB-C замінив 6 різних зарядок. MCP робить те ж для AI інтеграцій.
"Написав сервер один раз" — це ключово для команд: не писати клей-код для кожної моделі.
-->

---

# Що таке MCP?

**Model Context Protocol** — відкритий стандарт від Anthropic (листопад 2024)

<v-clicks>

- 🌐 **Відкритий** — не прив'язаний до конкретної моделі чи компанії
- 📡 **JSON-RPC 2.0** — стандартний протокол повідомлень
- 🔌 **Plug & Play** — підключив сервер → модель одразу бачить інструменти
- 🏗️ **Клієнт-серверна** архітектура (як REST API, але для AI)

</v-clicks>

<v-click>

> Поточна версія: **2025-11-25**  
> Специфікація: `spec.modelcontextprotocol.io`

</v-click>

<!--
Важливо: MCP НЕ є офіційним стандартом IEEE/IETF, але де-факто став стандартом для AI інтеграцій.
Майже всі major IDE і AI-інструменти вже підтримують MCP (VS Code, Cursor, Cline, JetBrains...).
-->

---

# JSON-RPC 2.0 — транспортний протокол MCP

Всі повідомлення між клієнтом і сервером — три типи:

<div style="transform:scale(0.78); transform-origin:top center; margin-top:-16px; margin-bottom:-110px">

```mermaid
sequenceDiagram
  participant C as 🤖 Client (Host)
  participant S as 🔧 MCP Server

  Note over C,S: 1. Request — клієнт надсилає, чекає відповіді (є id)
  C->>S: {"jsonrpc":"2.0", "id":1, "method":"tools/call", "params":{...}}
  S-->>C: {"jsonrpc":"2.0", "id":1, "result":{...}}
  S-->>C: {"jsonrpc":"2.0", "id":1, "error":{"code":-32601, "message":"Not found"}}

  Note over C,S: 2. Notification — без id, відповідь не очікується
  S-)C: {"jsonrpc":"2.0", "method":"notifications/tools/list_changed"}
```

</div>

> **SDK ховає цей рівень** — ти пишеш `server.tool(...)`, а не JSON вручну

<!--
JSON-RPC 2.0 — стандарт 2010 року, використовується в LSP (Language Server Protocol) і тепер в MCP.
id зв'язує запит із відповіддю — важливо для асинхронного виконання.
Notification (без id) — одностороннє сповіщення, відповідь не очікується.
В MCP Inspector можна побачити ці повідомлення в реальному часі.
-->
