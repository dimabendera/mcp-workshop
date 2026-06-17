---
layout: center
---

# Архітектура MCP

_Host · Client · Server_

<!--
Тут пояснюємо три ролі. Це ключова концепція — решта лекції будується на ній.
-->

---
mermaid:
  scale: 0.55
---

# Три ролі: Host, Client, Server

```mermaid
flowchart TD
    User["👤 Користувач"] -->|запит| Host

    subgraph Host["🖥️ MCP Host  (VS Code / Claude Desktop / Cline)"]
      direction LR
      LLM["🧠 LLM"]
      C1["📡 Client 1"]
      C2["📡 Client 2"]
    end

    C1 -->|"MCP protocol"| S1["🔧 Server\nFilesystem"]
    C2 -->|"MCP protocol"| S2["🔧 Server\nDatabase"]
    S1 & S2 -->|результат| Host
```

<!--
Ключова ідея: Host оркеструє все. Він знає і про LLM, і про всі сервери.
Клієнти — це просто з'єднання, по одному на кожен сервер.
-->

---

# Хто є хто

| Роль | Задача | Приклади |
|------|--------|---------|
| **🖥️ Host** | Запускає LLM, оркеструє, показує UI | VS Code, Claude Desktop, Cline, ваш додаток |
| **📡 Client** | З'єднання 1:1 з одним сервером | Вбудований в Host, не пишемо окремо |
| **🔧 Server** | Надає інструменти та дані | Filesystem, DB, GitHub, **ваш код** |

<v-click>

**Головне правило:**  
`1 Client = 1 Server`  
Але Host може мати скільки завгодно Clients → підключений до багатьох Servers

</v-click>

<!--
Питання до аудиторії: "що ми пишемо сьогодні?"
Відповідь: переважно Server. Іноді Client (для свого агента).
Host — це вже написані інструменти (VS Code, Claude Desktop).
-->

---

# Що ми пишемо сьогодні

<div grid="~ cols-3 gap-6 mt-8">

<div class="p-4 rounded border border-gray-600 opacity-50">

**🖥️ Host**

VS Code, Cline — вже написані за нас

_Не пишемо_

</div>

<div class="p-4 rounded border border-gray-600 opacity-50">

**📡 Client**

Вбудований в Host або LangChain — бере на себе

_Не пишемо (LangChain зробить)_

</div>

<div class="p-4 rounded border border-blue-400 bg-blue-950">

**🔧 Server**

Наш кастомний сервер з інструментами

**Пишемо ми!**

</div>

</div>

<!--
Спрощення: сьогодні фокус на Server. Client буде через LangChain MCP Adapters.
-->
