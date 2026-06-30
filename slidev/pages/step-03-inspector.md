---
layout: cover
---

# 🔍 Крок 2
## MCP Inspector

Тестуємо сервер без написання клієнта

<!--
Inspector — перший інструмент який потрібно знати.
Запустіть разом з аудиторією. Покажіть UI.
-->

---

# MCP Inspector v0.22.0

**Офіційний UI для тестування MCP серверів**

Запуск:
```bash
# В папці workshop/01-server/
npx @modelcontextprotocol/inspector node server.js

# або через npm script
npm run inspect
```

<v-click>

Inspector запуститься і відкриє браузер на `http://localhost:6274`

</v-click>

<!--
Якщо браузер не відкривається автоматично — відкрийте http://localhost:6274 вручну.
Inspector запускає проксі на порту 6277 і UI на порту 6274.
-->

---

# Підключення в Inspector UI

Якщо автопідключення не спрацювало — налаштуйте вручну в UI:

```
Transport Type: STDIO          ← оберіть зі списку
Command:        node           ← виконуваний файл
Arguments:      server.js      ← аргументи (шлях до файлу)
```

Натисніть **Connect**

<v-click>

**Що побачите після підключення:**

```
✅ Connected to: workshop (v1.0.0)
Tools:
  • add — Перше число, Друге число
```

</v-click>

<!--
В Inspector є вкладки: Tools, Resources, Prompts, Sampling.
Сьогодні нас цікавить тільки Tools.
Якщо server.js не запускається -- перевірте що є package.json з "type": "module"
-->

---

# Тестуємо інструмент add

В Inspector:
1. Відкрийте вкладку **Tools**
2. Оберіть `add`
3. Введіть параметри:
   ```
   a: 15
   b: 27
   ```
4. Натисніть **Run Tool**

<v-click>

**Очікуваний результат:**
```json
{
  "content": [
    { "type": "text", "text": "42" }
  ]
}
```

</v-click>

<!--
Inspector показує також JSON-RPC повідомлення (вкладка "History").
Покажіть студентам -- там видно що відправляється і що повертається.
Це саме той JSON-RPC 2.0 про який говорили в теорії.
-->

---

# Що відбувається під капотом

Inspector показує **сирі JSON-RPC повідомлення** у вкладці History:

```json
// Запит Inspector → Server
→ {"jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"add","arguments":{"a":15,"b":27}}}

// Відповідь Server → Inspector
← {"jsonrpc":"2.0","id":1,
    "result":{"content":[{"type":"text","text":"42"}]}}
```

<v-click>

Це **той самий протокол** що використовує VS Code, Cline та інші хости!

</v-click>

<!--
Відкрийте вкладку History і покажіть реальні повідомлення.
Це робить абстракцію "JSON-RPC" конкретною і зрозумілою.
-->

---
layout: cover
---

# Крок 3: Перший Клієнт

Файл: `workshop/02-client/client.js`

<!--
Крок 3 — короткий. Пишемо клієнт щоб показати як це виглядає без Inspector.
Але основний фокус — наступний крок з LangChain.
-->

---
layout: two-cols
---

# Клієнт: підключення і виклик

```js {maxHeight:'340px'}
// client.js — Мінімальний MCP клієнт

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Транспорт сам запускає server.js як subprocess
// Нам не потрібно окремо запускати сервер!
const transport = new StdioClientTransport({
  command: "node",
  args: ["../01-server/server.js"]  // шлях до нашого серверу
});

// Підключаємось
const client = new Client({ name: "demo-client", version: "1.0.0" });
await client.connect(transport);

// Список інструментів
const { tools } = await client.listTools();
console.log("Інструменти:", tools.map(t => t.name));
// → ["add"]

// Виклик інструменту
const result = await client.callTool("add", { a: 5, b: 3 });
console.log("5 + 3 =", result.content[0].text);
// → "5 + 3 = 8"
```

::right::

# Python

```python {maxHeight:'340px'}
# client.py
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    # Параметри для запуску серверу
    params = StdioServerParameters(
        command="python",
        args=["../01-server/server.py"]
    )
    
    # async context manager запускає і зупиняє сервер
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Список інструментів
            result = await session.list_tools()
            print([t.name for t in result.tools])
            # → ['add']
            
            # Виклик
            r = await session.call_tool("add", {"a": 5, "b": 3})
            print("5 + 3 =", r.content[0].text)
            # → "5 + 3 = 8"

asyncio.run(main())
```

<!--
Запустіть разом: node client.js
Покажіть вивід.
Зверніть увагу: клієнт сам запускає і зупиняє сервер -- не треба два термінали.
-->
