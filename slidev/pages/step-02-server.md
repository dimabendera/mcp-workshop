---
layout: cover
---

# 🖥️ Крок 1
## Перший MCP Сервер

Файл: `workshop/01-server/server.starter.js`

<!--
Відкрийте server.starter.js на великому екрані.
Будемо розкоментовувати по кроку разом.
-->

---

# Що будуємо

**Інструмент:** `add(a, b)` — просте додавання двох чисел

_Чому такий простий? — щоб весь фокус був на MCP протоколі, не на логіці_

<br>

**Принцип:** оголошуємо інструмент → підключаємо транспорт → готово

```
server.tool(name, schema, handler)
         ↓
StdioServerTransport
         ↓
server.connect(transport)
```

<!--
Наголосіть: логіка add() тривіальна спеціально.
В реальних проектах handler буде викликати БД, API, файлову систему.
Принцип підключення — ідентичний.
-->

---
layout: two-cols
---

# Крок 1.1 — Імпорти та ініціалізація

```js
// server.js — Перший MCP сервер

// SDK для створення MCP серверів (офіційний)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Транспорт: stdio — спілкування через stdin/stdout
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Zod — бібліотека для валідації типів параметрів
import { z } from "zod";

// Створюємо сервер з назвою і версією
const server = new McpServer({
  name: "workshop",    // назва видна в Inspector і хостах
  version: "1.0.0"
});
```

::right::

# Python

```python
# server.py — Python версія

# FastMCP — спрощена обгортка над офіційним SDK
from mcp.server.fastmcp import FastMCP

# Створюємо сервер (FastMCP замінює 10+ рядків ініціалізації)
mcp = FastMCP("workshop")
```

<br>

**Різниця:** Python FastMCP — це обгортка яка робить все за 2 рядки. JS SDK — більш явний, видно кожен крок.

<!--
Покажіть обидва файли: server.js і server.py.
FastMCP — зручна бібліотека, але під капотом той самий протокол.
-->

---
layout: two-cols
---

# Крок 1.2 — Оголошуємо інструмент

```js {all|2|3-6|7-9|all}
server.tool(
  "add",                      // 1. Назва (LLM вирішує по ній і опису)
  {
    a: z.number().describe("Перше число"),   // 2. Схема параметрів
    b: z.number().describe("Друге число"),   //    .describe() → LLM підказка
  },
  async ({ a, b }) => ({      // 3. Функція виконання
    content: [{ type: "text", text: String(a + b) }]  // Результат
  })
);
```

::right::

# Python

```python
@mcp.tool()
def add(a: int, b: int) -> int:
    """Додає два числа і повертає результат.
    
    LLM читає цей docstring щоб вирішити
    чи потрібен цей інструмент.
    """
    return a + b
```

<br>

- Декоратор `@mcp.tool()` = `server.tool()`
- Назва = ім'я функції
- Типи = схема параметрів
- Docstring = опис для LLM

<!--
Підкресліть: .describe() і docstring — це підказки для LLM!
Чим точніший опис — тим краще LLM вирішує КОЛИ використовувати цей інструмент.
-->

---
layout: two-cols
---

# Крок 1.3 — Підключаємо транспорт

```js
// stdio транспорт: сервер читає stdin, пише в stdout
const transport = new StdioServerTransport();

// Підключаємо і запускаємо (сервер тепер слухає)
await server.connect(transport);
```

**Весь файл — 15 рядків:**

```js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "workshop", version: "1.0.0" });

server.tool(
  "add",
  { a: z.number().describe("Перше число"), b: z.number().describe("Друге число") },
  async ({ a, b }) => ({ content: [{ type: "text", text: String(a + b) }] })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

::right::

# Python

```python
mcp.run()  # stdio за замовчуванням
```

**Весь файл — 10 рядків:**

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("workshop")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Додає два числа і повертає результат."""
    return a + b

mcp.run()
```

<!--
Зверніть увагу: JS -- явний await server.connect(transport). Python -- mcp.run() ховає деталі.
Обидва варіанти правильні. JS дає більше контролю, Python -- простіше.
-->
