import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./01-server/server.js"]
});

const client = new Client({ name: "demo-client", version: "1.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("Інструменти:", tools.map(t => t.name));

const result = await client.callTool({
  name: "add",
  arguments: { a: 5, b: 3 }
});
console.log("5 + 3 =", result.content[0].text);
