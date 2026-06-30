# AUTO.RIA MCP Server — Python версія
# Один інструмент = пошук + деталі по кожному авто
# httpx для async HTTP, FastMCP для MCP сервера

import os
import asyncio
import json
import httpx
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

load_dotenv()

# ------- Конфігурація з .env -------
SEARCH_URL    = os.environ["AUTO_RIA_SEARCH_URL"]
USED_INFO_URL = os.environ["AUTO_RIA_USED_URL"]
NEW_INFO_URL  = os.environ["AUTO_RIA_NEW_URL"]
NEW_OPTS_URL  = os.environ["AUTO_RIA_NEW_OPTIONS_URL"]

mcp = FastMCP("auto-ria")


# ------- Допоміжні функції -------

async def get_used_car_info(client: httpx.AsyncClient, car_id: str) -> dict:
    """Детальна інформація по вживаному авто."""
    res = await client.get(
        f"{USED_INFO_URL}/{car_id}",
        headers={"X-Ria-Source": "ria-ai-mcp-advertisement"},
    )
    res.raise_for_status()
    return res.json()


async def get_new_car_info(client: httpx.AsyncClient, car_id: str) -> dict:
    """Детальна інформація по новому авто (авто + комплектація)."""
    auto_res = await client.get(f"{NEW_INFO_URL}/{car_id}/")
    auto_res.raise_for_status()
    auto_data = auto_res.json()

    base_id  = auto_data.get("autoData", {}).get("baseId")
    equip_id = auto_data.get("autoData", {}).get("equipId")

    options = None
    if base_id and equip_id:
        opts_res = await client.get(
            f"{NEW_OPTS_URL}?baseId={base_id}&equipId={equip_id}&langId=4"
        )
        if opts_res.is_success:
            options = opts_res.json()

    return {"autoInfo": auto_data, "options": options}


# ------- Єдиний інструмент: пошук + деталі -------

@mcp.tool()
async def search_cars(query: str, limit: int = 5, page: int = 0) -> str:
    """
    Шукає автомобілі на AUTO.RIA і відразу повертає детальну інформацію.
    Об'єднує текстовий пошук та отримання деталей в одному запиті.

    query: Пошуковий запит, напр. 'BMW X5 дизель до 20000$'
    limit: Кількість результатів (за замовчуванням 5)
    page:  Сторінка результатів (за замовчуванням 0)
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Крок 1: Пошук
        search_res = await client.post(
            SEARCH_URL,
            json={"query": query, "limit": limit, "page": page},
        )
        search_res.raise_for_status()
        cars = search_res.json().get("result", [])

        # Крок 2: Деталі паралельно
        # LLM не потрібно вибирати між get_used / get_new — робимо самі
        async def enrich(car: dict) -> dict:
            try:
                if car.get("type") == "new":
                    details = await get_new_car_info(client, str(car["id"]))
                else:
                    details = await get_used_car_info(client, str(car["id"]))
                return {**car, "details": details}
            except Exception as e:
                return {**car, "detailsError": str(e)}

        detailed = await asyncio.gather(*[enrich(car) for car in cars])

    return json.dumps(detailed, ensure_ascii=False, indent=2)


# ------- Запуск -------
mcp.run()
