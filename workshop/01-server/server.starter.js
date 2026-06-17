import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Ініціалізуємо сервер
const server = new McpServer({
  name: "workshop",
  version: "1.0.0"
});

// КРОК 1: Оголоси інструмент "add" який додає два числа
// Параметри: a (number), b (number)
// Результат: content масив з текстом суми
//
// server.tool("add", { ... }, async ({ ... }) => ({
//   content: [{ type: "text", text: ... }]
// }));



// КРОК 2: Підключи stdio транспорт і запусти сервер
//
// const transport = new StdioServerTransport();
// await server.connect(transport);
