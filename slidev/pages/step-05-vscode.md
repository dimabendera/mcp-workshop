---
layout: cover
---

# 🌐 Крок 5
## VS Code + Cline

Підключаємо наш сервер до IDE без коду

<!--
Live demo! Покажіть Cline підключений до нашого серверу.
Студенти бачать той самий сервер що написали — тепер в IDE.
-->

---

# Cline — AI агент у VS Code

**Cline** (раніше Claude Dev) — AI агент розширення для VS Code

- Підтримує MCP серверів
- Може читати файли, виконувати команди
- Підключається до будь-якого MCP сервера

**Встановлення:**
```
VS Code → Extensions → шукаємо "Cline" → Install
```

<!--
Якщо Cline не встановлений -- покажіть тільки .vscode/mcp.json підхід.
-->

---

# Варіант 1: .vscode/mcp.json

Створіть `.vscode/mcp.json` в корені проекту:

```json
{
  "servers": {
    "workshop": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/workshop/01-server/server.js"]
    }
  }
}
```

VS Code автоматично виявить файл і запропонує підключитись.

<!--
${workspaceFolder} -- автоматично замінюється на шлях до відкритої папки.
Це налаштування тільки для цього workspace (не глобальне).
-->

---

# Варіант 2: Cline налаштування

Cline → Settings → MCP Servers → Add:

```json
{
  "workshop": {
    "command": "node",
    "args": ["/absolute/path/to/workshop/01-server/server.js"],
    "env": {}
  }
}
```

Або Python версія:
```json
{
  "workshop-python": {
    "command": "python",
    "args": ["/absolute/path/to/workshop/01-server/server.py"]
  }
}
```

<!--
В Cline: клікнути на іконку MCP в лівому меню → Add Server → вставити JSON.
-->

---

# Варіант 3: Claude Desktop

Файл: `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)  
або `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "workshop": {
      "command": "node",
      "args": ["/absolute/path/to/workshop/01-server/server.js"]
    }
  }
}
```

Перезапустіть Claude Desktop → сервер підключено.

<!--
Claude Desktop -- показати налаштування якщо є у когось встановлений.
-->

---

# Live Demo 🎬

Питаємо Cline:

> **"Скільки буде 100 + 200?"**

Що має статись:
1. Cline бачить інструмент `add` у своєму контексті
2. Вирішує його використати (не рахує сам)
3. Показує виклик: `add(a=100, b=200)` → `300`
4. Відповідає: "100 + 200 = 300"

<v-click>

**Що ми бачимо:** той самий агентік луп що писали в коді — тепер в UI!

</v-click>

<!--
Важливо показати в UI Cline що він саме ВИКЛИКАЄ tool, а не рахує.
Студенти мають зрозуміти: Cline це той самий agent.js але з красивим інтерфейсом.
-->
