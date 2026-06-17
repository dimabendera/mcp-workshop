// agent.starter.js — Стартовий файл для Кроку 4
// Завдання: написати LangChain ReAct агента з MCP інструментами через LiteLLM

// Завантажуємо .env файл (LITELLM_BASE_URL, LITELLM_API_KEY, LLM_MODEL)
import "dotenv/config";

// Імпорти (вже підготовлені)
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// =============================================================
// КРОК 1: Підключись до MCP серверу через MultiServerMCPClient
//
// Конфігурація:
//   mcpServers: {
//     workshop: {
//       transport: "stdio",
//       command: "node",
//       args: ["../01-server/server.js"],
//     }
//   }
//
// const mcpClient = new MultiServerMCPClient({ ... });
// const tools = await mcpClient.getTools();
// console.log("Інструменти:", tools.map(t => t.name));
// =============================================================



// =============================================================
// КРОК 2: Налаштуй LLM через LiteLLM proxy
//
// ChatOpenAI приймає:
//   openAIApiKey: process.env.LITELLM_API_KEY
//   configuration: { baseURL: process.env.LITELLM_BASE_URL }
//   model: process.env.LLM_MODEL
//
// const llm = new ChatOpenAI({ ... });
// =============================================================



// =============================================================
// КРОК 3: Створи ReAct агента
//
// createReactAgent приймає: { llm, tools }
// Він сам реалізує Think-Act-Observe луп
//
// const agent = createReactAgent({ llm, tools });
// =============================================================



// =============================================================
// КРОК 4: Запусти агента і виведи відповідь
//
// agent.invoke приймає: { messages: [{ role: "user", content: "..." }] }
// Відповідь в: result.messages.at(-1).content
//
// const result = await agent.invoke({
//   messages: [{ role: "user", content: "Скільки буде 15 + 27?" }],
// });
// console.log(result.messages.at(-1).content);
// =============================================================



// =============================================================
// КРОК 5: Закрий MCP з'єднання
//
// await mcpClient.close();
// =============================================================
