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

# Транспорт: Streamable HTTP

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

LIFECYCLE З'ЄДНАНЬ:

stdio:
  - Кожен клієнт запускає окремий процес сервера.
  - З'єднання 1:1 (один client ↔ один server процес).
  - Процес зупиняється коли клієнт відключається.
  - MultiServerMCPClient запускає окремий процес для КОЖНОГО сервера в конфігу.

HTTP:
  - Один сервер обслуговує багато клієнтів.
  - Стан shared між з'єднаннями (будьте обережні з глобальними змінними!).
  - Підтримує authentication (Bearer, OAuth) — потрібно якщо сервер публічний.

PER-USER ISOLATION (як відділити користувачів):
  Якщо потрібно щоб кожен user мав свій контекст (свій кошик, свої документи):

  Варіант 1 — окремий agent+client на кожного user:
    const sessions = new Map();
    function getSession(userId) {
      if (!sessions.has(userId)) {
        const client = new MultiServerMCPClient({...});
        const tools = await client.getTools();
        sessions.set(userId, { agent: createReactAgent({llm, tools}), history: [] });
      }
      return sessions.get(userId);
    }
    // → кожен user має свій окремий agent з окремою history

  Варіант 2 — передавати userId в кожен tool call через system prompt:
    agent.invoke({ messages: [
      { role: "system", content: `User ID: ${userId}. Access only their data.` },
      { role: "user", content: userMessage }
    ]})
    // → tool сам фільтрує дані по userId з params або системного промпту

  Варіант 2 простіший але потребує що всі tools перевіряють userId.
  Варіант 1 — надійніший ізоляція але витрачає більше пам'яті.
-->
