// agent-traced.js — LangChain агент з Langfuse трасуванням
// Різниця від agent.js: тільки 3 нових рядки

import "dotenv/config";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// НОВИЙ ІМПОРТ: Langfuse callback handler для LangChain
import { CallbackHandler } from "langfuse-langchain";

// НОВА ІНІЦІАЛІЗАЦІЯ: handler читає ключі з .env
const langfuseHandler = new CallbackHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
  // sessionId: "workshop-session-1",  // опційно — для групування traces
  // userId: "user@example.com",       // опційно — для аналітики по юзерам
});

// Все те саме що в agent.js ↓
const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    workshop: {
      transport: "stdio",
      command: "node",
      args: ["../01-server/server.js"],
    },
  },
});

const tools = await mcpClient.getTools();

const llm = new ChatOpenAI({
  openAIApiKey: process.env.LITELLM_API_KEY,
  configuration: { baseURL: process.env.LITELLM_BASE_URL },
  model: process.env.LLM_MODEL,
});

const agent = createReactAgent({ llm, tools });

// ЄДИНА ЗМІНА В ВИКЛИКУ: додаємо { callbacks: [langfuseHandler] }
const result = await agent.invoke(
  { messages: [{ role: "user", content: "Скільки буде 15 + 27?" }] },
  { callbacks: [langfuseHandler] }  // ← ось і все трасування
);

console.log(result.messages.at(-1).content);

// ВАЖЛИВО: flush надсилає дані в Langfuse перед завершенням процесу
await langfuseHandler.flushAsync();

await mcpClient.close();
