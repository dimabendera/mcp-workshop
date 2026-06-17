---
layout: two-cols
---

# Транспорт: stdio

**Для локальних серверів** (сьогодні використовуємо)

- Host сам запускає сервер як subprocess
- Спілкування через stdin/stdout
- Немає мережі → безпечніше
- Ідеально для dev-інструментів

```json
{
  "type": "stdio",
  "command": "node",
  "args": ["./server.js"]
}
```

::right::

# Транспорт: HTTP + SSE

**Для віддалених серверів**

- Сервер — окремий HTTP сервіс
- POST запити від клієнта
- Server-Sent Events від сервера
- Підтримує Bearer/OAuth авторизацію
- Один сервер → багато клієнтів

```json
{
  "type": "http",
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer token"
  }
}
```

<!--
stdio — для старту. HTTP — коли треба поділитись сервером з командою або деплоїти.
Сьогодні: stdio (кроки 1-5), HTTP (крок 6).
-->

---

# Протокол: JSON-RPC 2.0

Всі повідомлення між клієнтом і сервером — три типи:

```json
// Запит client → server
{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": { "name": "add", "arguments": { "a": 5, "b": 3 } } }
```

```json
// Відповідь server → client
{ "jsonrpc": "2.0", "id": 1,
  "result": { "content": [{ "type": "text", "text": "8" }] } }
```

```json
// Сповіщення (без відповіді)
{ "jsonrpc": "2.0", "method": "notifications/tools/list_changed" }
```

<v-click>

**Нам не потрібно писати JSON-RPC вручну** — SDK повністю ховає цей рівень.

</v-click>

<!--
JSON-RPC 2.0 — стандартний протокол, існує з 2010-х.
Показуємо щоб студент розумів що відбувається "під капотом".
В MCP Inspector можна побачити ці повідомлення в реальному часі.
-->
