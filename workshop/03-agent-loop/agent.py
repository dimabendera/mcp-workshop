# LangChain ReAct агент з двома MCP серверами через LiteLLM — Python версія
# Запуск: python 03-agent-loop/agent.py

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


async def main():
    # 1. Підключаємось до обох MCP серверів
    async with MultiServerMCPClient({
        # Сервер 1: простий math сервер (крок 1)
        "math": {
            "transport": "stdio",
            "command": "python",
            "args": ["./01-server/server.py"],
        },
        # Сервер 2: AUTO.RIA пошук (крок 4)
        "autoria": {
            "transport": "stdio",
            "command": "python",
            "args": ["./02-server/server.py"],
        },
    }) as client:

        # 2. Отримуємо всі інструменти від обох серверів
        tools = await client.get_tools()
        print("Інструменти:", [t.name for t in tools])
        # → ['add', 'search_cars']

        # 3. LLM через LiteLLM proxy
        llm = ChatOpenAI(
            api_key=os.environ["LITELLM_API_KEY"],
            base_url=os.environ["LITELLM_BASE_URL"],
            model=os.environ["LLM_MODEL"],
        )

        # 4. ReAct агент — весь Think-Act-Observe луп в одному рядку
        agent = create_react_agent(llm, tools)

        # 5. Запит
        result = await agent.ainvoke({
            "messages": [
                {"role": "user", "content": "Знайди BMW X5 дизель до 20000 доларів"},
            ]
        })

        print(result["messages"][-1].content)


asyncio.run(main())
