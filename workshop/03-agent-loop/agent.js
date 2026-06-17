// agent.js — LangChain ReAct агент з MCP інструментами через LiteLLM
// Готова версія (reference)

// Завантажуємо .env файл
import "dotenv/config";

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 1. Підключення до MCP серверу
//    MultiServerMCPClient може підключатись до кількох серверів одночасно
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    workshop: {
      transport: "stdio",           // stdio = сервер запускається як subprocess
      command: "node",
      args: ["../01-server/server.js"],
    },
  },
});

// 2. Отримуємо всі інструменти від всіх підключених серверів
const tools = await mcpClient.getTools();
console.log("Інструменти:", tools.map(t => t.name));
// → ["add"]

// 3. LLM через LiteLLM proxy (OpenAI-сумісний API)
//    LiteLLM проксує запити до нашої внутрішньої моделі
const llm = new ChatOpenAI({
  openAIApiKey: process.env.LITELLM_API_KEY,
  configuration: {
    baseURL: process.env.LITELLM_BASE_URL,  // http://our-litellm:4000/v1
  },
  model: process.env.LLM_MODEL,            // gpt-4o-mini або інша модель
});

// 4. ReAct агент: LLM + інструменти
//    createReactAgent сам реалізує Think-Act-Observe луп
//    Нам не потрібно писати while(true) з перевіркою stop_reason
const agent = createReactAgent({ llm, tools });

// 5. Запуск агента
const result = await agent.invoke({
  messages: [{ role: "user", content: "Скільки буде 15 + 27?" }],
});

// Остання відповідь в масиві messages
console.log(result.messages.at(-1).content);
// → "15 + 27 = 42"

// 6. Закриваємо MCP з'єднання (зупиняє subprocess серверу)
await mcpClient.close();
