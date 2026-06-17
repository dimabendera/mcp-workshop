# agent.py — LangChain ReAct агент з MCP + LiteLLM (Python версія)
import asyncio
import os
from dotenv import load_dotenv

# Завантажуємо .env файл
load_dotenv()

from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent


async def main():
    # 1. Підключення до MCP серверу
    #    async with = автоматично підключає і закриває з'єднання
    async with MultiServerMCPClient({
        "workshop": {
            "transport": "stdio",           # stdio транспорт
            "command": "python",
            "args": ["../01-server/server.py"],
        }
    }) as client:

        # 2. Отримуємо інструменти від всіх серверів
        tools = await client.get_tools()
        print("Інструменти:", [t.name for t in tools])
        # → ['add']

        # 3. LLM через LiteLLM proxy (OpenAI-сумісний API)
        llm = ChatOpenAI(
            api_key=os.environ["LITELLM_API_KEY"],
            base_url=os.environ["LITELLM_BASE_URL"],  # http://our-litellm:4000/v1
            model=os.environ["LLM_MODEL"],
        )

        # 4. ReAct агент
        agent = create_react_agent(llm, tools)

        # 5. Запуск
        result = await agent.ainvoke({
            "messages": [{"role": "user", "content": "Скільки буде 15 + 27?"}]
        })

        # Остання відповідь
        print(result["messages"][-1].content)
        # → "15 + 27 = 42"


asyncio.run(main())
