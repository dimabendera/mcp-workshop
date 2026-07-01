import "dotenv/config";

import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

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
console.log("Інструменти:", tools.map((t) => t.name));

const llm = new ChatOpenAI({
  apiKey: process.env.LITELLM_API_KEY,
  model: process.env.LLM_MODEL,
  temperature: 0,
  configuration: {
    baseURL: process.env.LITELLM_BASE_URL,
  },
});

const agent = createAgent({ model: llm, tools });

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Використовуй інструмент add і додай 19+22+23",
    },
  ],
});

// console.log(result.messages.at(-1)?.content);
console.log(result.messages);
await mcpClient.close();
