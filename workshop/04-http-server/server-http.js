import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

// Той самий сервер що і в 01-server/ — нічого не змінилось
const server = new McpServer({ name: "workshop-http", version: "1.0.0" });

server.tool(
  "add",
  {
    a: z.number().describe("Перше число"),
    b: z.number().describe("Друге число"),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
  })
);

// Тільки транспорт змінився: HTTP замість stdio
const app = express();
app.use(express.json());

// Опційно: авторизація через Bearer token
app.use((req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (process.env.MCP_SECRET && token !== process.env.MCP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP HTTP Server запущено на порту ${PORT}`);
  console.log(`URL: http://localhost:${PORT}/mcp`);
});
