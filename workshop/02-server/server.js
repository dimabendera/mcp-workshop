// AUTO.RIA MCP Server
// Один інструмент = пошук + деталі по кожному авто
// Чому один? Все що можна зробити кодом — краще робити кодом,
// а не покладатись на LLM яка може помилитись при виборі між кількома інструментами.

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ------- Конфігурація з .env -------
const SEARCH_URL    = process.env.AUTO_RIA_SEARCH_URL;
const USED_INFO_URL = process.env.AUTO_RIA_USED_URL;
const NEW_INFO_URL  = process.env.AUTO_RIA_NEW_URL;
const NEW_OPTS_URL  = process.env.AUTO_RIA_NEW_OPTIONS_URL;

const server = new McpServer({ name: "auto-ria", version: "1.0.0" });

// ------- Допоміжні функції -------

// Детальна інформація по вживаному авто
async function getUsedCarInfo(id) {
  const res = await fetch(`${USED_INFO_URL}/${id}`, {
    headers: { "X-Ria-Source": "ria-ai-mcp-advertisement" },
  });
  if (!res.ok) throw new Error(`Used car API: ${res.status}`);
  return res.json();
}

// Детальна інформація по новому авто (2 запити: авто + комплектація)
async function getNewCarInfo(id) {
  const autoRes = await fetch(`${NEW_INFO_URL}/${id}/`);
  if (!autoRes.ok) throw new Error(`New car API: ${autoRes.status}`);
  const autoData = await autoRes.json();

  // baseId + equipId визначають комплектацію
  const { baseId, equipId } = autoData?.autoData || {};

  let options = null;
  if (baseId && equipId) {
    const optRes = await fetch(
      `${NEW_OPTS_URL}?baseId=${baseId}&equipId=${equipId}&langId=4`
    );
    if (optRes.ok) options = await optRes.json();
  }

  return { autoInfo: autoData, options };
}

// ------- Єдиний інструмент: пошук + деталі -------
server.tool(
  "search_cars",
  "Шукає автомобілі на AUTO.RIA і відразу повертає детальну інформацію по кожному результату. Об'єднує текстовий пошук та отримання деталей в одному запиті.",
  {
    query: z.string().describe(
      "Пошуковий запит, напр. 'BMW X5 дизель до 20000$' або 'седан до 2020 року не старше 50 тис км'"
    ),
    limit: z.number().optional().describe("Кількість результатів (за замовчуванням 5)"),
    page:  z.number().optional().describe("Сторінка результатів (за замовчуванням 0)"),
  },
  async ({ query, limit = 5, page = 0 }) => {
    // Крок 1: Пошук по текстовому запиту
    const searchRes = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, page }),
    });

    if (!searchRes.ok) {
      return {
        isError: true,
        content: [{ type: "text", text: `Помилка пошуку: ${searchRes.status}` }],
      };
    }

    const searchData = await searchRes.json();
    const cars = searchData.result || [];

    // Крок 2: Деталі по кожному авто — паралельно (не послідовно)
    // LLM не потрібно вибирати між get_used / get_new — ми робимо це самі
    const detailed = await Promise.all(
      cars.map(async (car) => {
        try {
          const details = car.type === "new"
            ? await getNewCarInfo(car.id)
            : await getUsedCarInfo(car.id);
          return { ...car, details };
        } catch (err) {
          // Помилка по одному авто не ламає весь результат
          return { ...car, detailsError: err.message };
        }
      })
    );

    return {
      content: [{ type: "text", text: JSON.stringify(detailed, null, 2) }],
    };
  }
);

// ------- Запуск -------
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("AUTO.RIA MCP сервер запущено (stdio)");
