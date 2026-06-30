// LangChain агент з Langfuse трасуванням
// Різниця від agent.js — тільки 3 рядки (імпорт + ініціалізація + callbacks)
// Запуск: npm run traced

import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { CallbackHandler } from "langfuse-langchain"; // ← 1. Новий імпорт

// 2. Langfuse handler — читає ключі з .env автоматично
const langfuseHandler = new CallbackHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
});

// Все те саме що в agent.js ↓
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    math: {
      transport: "stdio",
      command: "node",
      args: ["./01-server/server.js"],
    },
    autoria: {
      transport: "stdio",
      command: "node",
      args: ["./02-server/server.js"],
    },
  },
});

const tools = await mcpClient.getTools();

const llm = new ChatOpenAI({
  apiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: process.env.LITELLM_BASE_URL },
  model: process.env.LLM_MODEL,
});

const agent = createReactAgent({ llm, tools });

// 3. Єдина зміна при виклику — callbacks: [langfuseHandler]
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Порахуй за допомогою інструмента add 34+12+56" }] },
  { callbacks: [langfuseHandler] }  // ← ось і все трасування
);

console.log(result.messages.at(-1).content);

// Важливо: flush надсилає дані в Langfuse перед завершенням процесу
await langfuseHandler.flushAsync();
await mcpClient.close();
