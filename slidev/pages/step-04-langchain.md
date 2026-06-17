---
layout: cover
---

# 🧠 Крок 4
## LangChain Агент + LiteLLM

Файл: `workshop/03-agent-loop/agent.starter.js`

<!--
Найцікавіший крок. Агент з MCP і LiteLLM в 20 рядках.
Відкрийте agent.starter.js на екрані.
-->

---

# Кроки побудови агента

```
1. Підключитись до MCP серверу       → MultiServerMCPClient
2. Отримати список інструментів       → client.getTools()
3. Налаштувати LLM через LiteLLM     → ChatOpenAI(base_url=...)
4. Створити ReAct агента             → createReactAgent(llm, tools)
5. Запустити запит                   → agent.invoke(...)
6. Закрити MCP з'єднання             → client.close()
```

<!--
Пройдіться по кожному кроку спочатку, потім покажіть код.
-->

---
layout: two-cols
---

# Крок 4.1 — Підключення до MCP

```js {all|1-3|5-12|all}
// Імпортуємо LangChain MCP адаптер
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Підключаємось до одного або кількох MCP серверів
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    // Назва = як ми будемо його ідентифікувати
    workshop: {
      transport: "stdio",              // stdio транспорт
      command: "node",                 // запускаємо через node
      args: ["../01-server/server.js"] // наш сервер
    }
  }
});

// Отримуємо всі інструменти від всіх серверів
const tools = await mcpClient.getTools();
console.log("Інструменти:", tools.map(t => t.name));
// → ["add"]
```

::right::

# Python

```python
from langchain_mcp_adapters.client import MultiServerMCPClient
import asyncio

async def main():
    # async context manager: підключає і закриває автоматично
    async with MultiServerMCPClient({
        "workshop": {
            "transport": "stdio",
            "command": "python",
            "args": ["../01-server/server.py"]
        }
    }) as client:
        # Список інструментів
        tools = await client.get_tools()
        print([t.name for t in tools])
        # → ['add']
```

<!--
MultiServerMCPClient -- ключовий клас. Може підключатись до N серверів одночасно.
Всі їхні tools доступні через getTools().
-->

---
layout: two-cols
---

# Крок 4.2 — LLM та Агент

```js {all|1-2|4-9|11-14|all}
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// LLM через LiteLLM proxy (OpenAI-сумісний)
const llm = new ChatOpenAI({
  openAIApiKey: process.env.LITELLM_API_KEY,     // ключ з .env
  configuration: {
    baseURL: process.env.LITELLM_BASE_URL,        // URL LiteLLM proxy
  },
  model: process.env.LLM_MODEL,                   // назва моделі
});

// ReAct агент: LLM + інструменти
// Він сам реалізує Think-Act-Observe луп
const agent = createReactAgent({ llm, tools });
```

::right::

# Python

```python
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
import os

# LLM через LiteLLM
llm = ChatOpenAI(
    api_key=os.environ["LITELLM_API_KEY"],
    base_url=os.environ["LITELLM_BASE_URL"],
    model=os.environ["LLM_MODEL"],
)

# ReAct агент
agent = create_react_agent(llm, tools)
```

<br>

`createReactAgent` = весь while-loop агентік лупу **в одному рядку**

<!--
Підкресліть: createReactAgent замінює весь той while(true) loop що ми писали б самі.
LangChain обробляє tool_use, tool_result, стан messages автоматично.
-->

---
layout: two-cols
---

# Крок 4.3 — Запуск агента

```js {all|1-3|5-8|all}
// Запускаємо агента з запитом
const result = await agent.invoke({
  messages: [{ role: "user", content: "Скільки буде 15 + 27?" }]
});

// Остання відповідь в масиві messages
console.log(result.messages.at(-1).content);
// → "15 + 27 = 42"

// Завжди закриваємо MCP з'єднання!
await mcpClient.close();
```

::right::

# Python

```python
result = await agent.ainvoke({
    "messages": [
        {"role": "user", "content": "Скільки буде 15 + 27?"}
    ]
})

# Остання відповідь
print(result["messages"][-1].content)
# → "15 + 27 = 42"
```

<br>

Запустіть і перевірте:

```bash
# JS
node agent.js

# Python
python agent.py
```

<!--
Запустіть разом. Покажіть що агент викликає add і повертає відповідь.
Можна спробувати складніший запит: "(3 + 4) * 2" -- агент викличе add двічі.
-->

---

# Весь JS файл (20 рядків)

```js {maxHeight:'380px'}
// agent.js — LangChain ReAct агент + MCP + LiteLLM
import "dotenv/config";  // завантажує .env файл
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 1. Підключення до MCP серверу
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    workshop: {
      transport: "stdio",
      command: "node",
      args: ["../01-server/server.js"],
    },
  },
});

// 2. Отримуємо інструменти від MCP
const tools = await mcpClient.getTools();

// 3. LLM через LiteLLM proxy
const llm = new ChatOpenAI({
  openAIApiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: process.env.LITELLM_BASE_URL },
  model: process.env.LLM_MODEL,
});

// 4. ReAct агент (сам реалізує Think-Act-Observe луп)
const agent = createReactAgent({ llm, tools });

// 5. Запит
const result = await agent.invoke({
  messages: [{ role: "user", content: "Скільки буде 15 + 27?" }],
});

console.log(result.messages.at(-1).content);

// 6. Закриваємо з'єднання
await mcpClient.close();
```

<!--
Покажіть весь файл цілком.
Зверніть увагу: import "dotenv/config" -- автоматично завантажує .env.
-->
