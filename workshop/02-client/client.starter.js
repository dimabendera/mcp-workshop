import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// КРОК 1: Створи транспорт — він запустить server.js як subprocess
// const transport = new StdioClientTransport({
//   command: "node",
//   args: ["../01-server/server.js"]
// });



// КРОК 2: Створи клієнт і підключись до серверу
// const client = new Client({ name: "demo-client", version: "1.0.0" });
// await client.connect(transport);



// КРОК 3: Отримай список інструментів і виведи їх назви
// const { tools } = await client.listTools();
// console.log("Інструменти:", tools.map(t => t.name));



// КРОК 4: Виклич інструмент "add" з параметрами { a: 5, b: 3 }
// і виведи результат
// const result = await client.callTool("add", { a: 5, b: 3 });
// console.log("5 + 3 =", result.content[0].text);
